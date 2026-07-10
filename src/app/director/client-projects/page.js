"use client";
import { useState, useEffect } from "react";
import { C, PageHeader, KpiRow, Panel, Chip, statusColor, Table, Modal, Field, Input, Select, Textarea, Btn, CommentThread, ConfirmDialog, useToast, FormRow, FormActions, Tabs, ProgressBar } from "@/components/mil";

const FILE_ICONS = { REVIT: "🅡", NAVISWORKS: "🅝", PDF: "📄", DWG: "📐", POINT_CLOUD: "☁", IFC: "🅘" };

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState(null);
  const [tab, setTab] = useState("overview");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [fileForm, setFileForm] = useState({});
  const [viewFile, setViewFile] = useState(null);

  const load = () => Promise.all([
    fetch("/api/client-projects").then((r) => r.json()),
    fetch("/api/clients").then((r) => r.json()),
  ]).then(([p, c]) => { setProjects(Array.isArray(p) ? p : []); setClients(Array.isArray(c) ? c : []); setLoading(false); });
  useEffect(() => { load(); }, []);

  const refreshSel = async (id) => { const d = await (await fetch("/api/client-projects")).json(); setProjects(d); if (id) setSel(d.find((x) => x.id === id)); };
  const filtered = projects.filter((p) => JSON.stringify(p).toLowerCase().includes(search.toLowerCase()));

  const save = async () => {
    const method = form.id ? "PUT" : "POST";
    await fetch("/api/client-projects", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false); setForm({}); load();
  };
  const del = async (id) => { if (!confirm("Delete project and all files?")) return; await fetch(`/api/client-projects?id=${id}`, { method: "DELETE" }); setSel(null); load(); };
  const addFile = async () => {
    await fetch("/api/project-files", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fileForm, clientProjectId: sel.id, fileSizeKb: Math.floor(Math.random() * 40000) + 500 }) });
    setFileForm({}); refreshSel(sel.id);
  };
  const delFile = async (id) => { await fetch(`/api/project-files?id=${id}`, { method: "DELETE" }); refreshSel(sel.id); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader icon="◧" title="Client Projects" subtitle="Full project delivery — files, BIM data, scope & requirements" accent={C.gold}
        search={search} setSearch={setSearch} onNew={() => { setForm({}); setShowForm(true); }} newLabel="+ NEW PROJECT" />

      <KpiRow items={[
        { label: "Projects", value: loading ? "—" : projects.length, color: C.gold },
        { label: "Active", value: loading ? "—" : projects.filter((p) => p.status === "ACTIVE").length, color: C.ok },
        { label: "Total Files", value: loading ? "—" : projects.reduce((s, p) => s + (p.files?.length || 0), 0), color: C.info },
        { label: "Contract Value", value: loading ? "—" : `$${(projects.reduce((s, p) => s + p.contractValue, 0) / 1e6).toFixed(1)}M`, color: C.oliveBright },
      ]} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
        {filtered.map((p) => (
          <div key={p.id} onClick={() => { setSel(p); setTab("overview"); }} style={{ background: C.panel, border: `1px solid ${C.olive}22`, borderRadius: 6, padding: "1.1rem", cursor: "pointer", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: p.coverHue || C.olive, borderRadius: "6px 6px 0 0", opacity: 0.8 }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <Chip label={p.code} color={C.gold} />
              <Chip label={p.health} color={statusColor(p.health)} />
            </div>
            <h3 style={{ fontFamily: C.orbit, fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: 3 }}>{p.name}</h3>
            <p style={{ fontFamily: C.rajd, fontSize: "0.8rem", color: C.dim }}>{p.client?.companyName} · {p.projectType}</p>
            <div style={{ marginTop: "0.7rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}><span style={{ fontFamily: C.rajd, fontSize: "0.7rem", color: C.dim }}>Progress</span><span style={{ fontFamily: C.orbit, fontSize: "0.7rem", color: C.oliveBright }}>{p.progress}%</span></div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${p.progress}%`, height: "100%", background: p.coverHue || C.olive }} /></div>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.8rem", paddingTop: "0.6rem", borderTop: `1px solid ${C.olive}14` }}>
              <span style={{ fontFamily: C.rajd, fontSize: "0.72rem", color: C.dim }}>📁 {p.files?.length || 0} files</span>
              <span style={{ fontFamily: C.rajd, fontSize: "0.72rem", color: C.dim }}>◈ {p.isoStatus}</span>
            </div>
          </div>
        ))}
      </div>

      {/* New/Edit project */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={form.id ? "Edit Project" : "New Client Project"} width={640}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
          <Field label="Code" required><Input value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Field>
          <Field label="Name" required><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Client" required><Select value={form.clientId || ""} onChange={(e) => setForm({ ...form, clientId: e.target.value })}><option value="">Select…</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}</Select></Field>
          <Field label="Project Type"><Input value={form.projectType || ""} onChange={(e) => setForm({ ...form, projectType: e.target.value })} /></Field>
          <Field label="Stage"><Input value={form.stage || ""} onChange={(e) => setForm({ ...form, stage: e.target.value })} /></Field>
          <Field label="ISO Status"><Select value={form.isoStatus || "MOBILIZATION"} onChange={(e) => setForm({ ...form, isoStatus: e.target.value })}><option>MOBILIZATION</option><option>TECHNICAL_DESIGN</option><option>PRODUCTION</option><option>HANDOVER</option></Select></Field>
          <Field label="Progress %"><Input type="number" value={form.progress || ""} onChange={(e) => setForm({ ...form, progress: e.target.value })} /></Field>
          <Field label="Contract Value"><Input type="number" value={form.contractValue || ""} onChange={(e) => setForm({ ...form, contractValue: e.target.value })} /></Field>
          <Field label="Health"><Select value={form.health || "GREEN"} onChange={(e) => setForm({ ...form, health: e.target.value })}><option>GREEN</option><option>AMBER</option><option>RED</option></Select></Field>
          <Field label="Status"><Select value={form.status || "ACTIVE"} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>ACTIVE</option><option>ON_HOLD</option><option>COMPLETE</option></Select></Field>
        </div>
        <Field label="Scope Summary"><Textarea value={form.scopeSummary || ""} onChange={(e) => setForm({ ...form, scopeSummary: e.target.value })} /></Field>
        <Field label="Requirements"><Textarea value={form.requirements || ""} onChange={(e) => setForm({ ...form, requirements: e.target.value })} /></Field>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem" }}>
          <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn>
          <Btn variant="gold" onClick={save}>{form.id ? "Save" : "Create"}</Btn>
        </div>
      </Modal>

      {/* Detail */}
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel ? `${sel.code} · ${sel.name}` : ""} width={780}>
        {sel && (
          <div>
            <div style={{ display: "flex", gap: 4, marginBottom: "1rem", flexWrap: "wrap" }}>
              {["overview", "files", "deliverables", "team", "activity"].map((t) => (
                <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? `${C.gold}22` : "transparent", border: `1px solid ${tab === t ? C.gold + "66" : C.olive + "22"}`, color: tab === t ? "#fff" : C.dim, padding: "0.4rem 0.8rem", fontFamily: C.orbit, fontSize: "0.55rem", letterSpacing: "1px", cursor: "pointer", borderRadius: 2, textTransform: "uppercase" }}>{t}</button>
              ))}
            </div>

            {tab === "overview" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.6rem", marginBottom: "1rem" }}>
                  {[["Client", sel.client?.companyName], ["Type", sel.projectType], ["Stage", sel.stage], ["ISO Status", sel.isoStatus], ["Progress", `${sel.progress}%`], ["Value", `$${(sel.contractValue / 1000).toFixed(0)}k`]].map(([k, v]) => (
                    <div key={k} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.olive}14`, borderRadius: 3, padding: "0.5rem 0.7rem" }}>
                      <p style={{ fontFamily: C.orbit, fontSize: "0.5rem", color: C.dim, letterSpacing: "1px", textTransform: "uppercase" }}>{k}</p>
                      <p style={{ fontFamily: C.rajd, fontSize: "0.9rem", color: C.text }}>{v || "—"}</p>
                    </div>
                  ))}
                </div>
                {sel.scopeSummary && <Panel title="Scope"><p style={{ fontFamily: C.rajd, color: C.dim, fontSize: "0.85rem" }}>{sel.scopeSummary}</p></Panel>}
                <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem" }}>
                  <Btn variant="gold" onClick={() => { setForm(sel); setSel(null); setShowForm(true); }}>Edit</Btn>
                  <Btn variant="danger" onClick={() => del(sel.id)}>Delete</Btn>
                </div>
              </div>
            )}

            {tab === "files" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 0.8fr auto", gap: "0.5rem", marginBottom: "0.75rem", alignItems: "end" }}>
                  <Input placeholder="filename.rvt" value={fileForm.fileName || ""} onChange={(e) => setFileForm({ ...fileForm, fileName: e.target.value })} />
                  <Select value={fileForm.fileType || "REVIT"} onChange={(e) => setFileForm({ ...fileForm, fileType: e.target.value })}>{Object.keys(FILE_ICONS).map((t) => <option key={t}>{t}</option>)}</Select>
                  <Select value={fileForm.cdeState || "WIP"} onChange={(e) => setFileForm({ ...fileForm, cdeState: e.target.value })}><option>WIP</option><option>SHARED</option><option>PUBLISHED</option><option>ARCHIVED</option></Select>
                  <Btn onClick={addFile}>Upload</Btn>
                </div>
                <Table columns={[
                  { key: "fileName", label: "File", render: (r) => <span style={{ cursor: "pointer" }} onClick={() => setViewFile(r)}>{FILE_ICONS[r.fileType] || "📄"} {r.fileName}</span> },
                  { key: "fileType", label: "Type", render: (r) => <Chip label={r.fileType} /> },
                  { key: "discipline", label: "Disc" },
                  { key: "revision", label: "Rev" },
                  { key: "cdeState", label: "CDE", render: (r) => <Chip label={r.cdeState} color={statusColor(r.cdeState)} /> },
                  { key: "suitability", label: "Suit" },
                  { key: "fileSizeKb", label: "Size", align: "right", render: (r) => `${(r.fileSizeKb / 1024).toFixed(1)} MB` },
                  { key: "act", label: "", align: "right", render: (r) => <button onClick={() => delFile(r.id)} style={{ background: "none", border: "none", color: C.danger, cursor: "pointer" }}>✕</button> },
                ]} rows={sel.files || []} empty="No files uploaded." />
              </div>
            )}

            {tab === "deliverables" && (
              <Table columns={[
                { key: "name", label: "Deliverable" },
                { key: "discipline", label: "Disc" },
                { key: "loi", label: "LOI", render: (r) => <Chip label={r.loi} color={C.info} /> },
                { key: "container", label: "Container" },
                { key: "status", label: "Status", render: (r) => <Chip label={r.status} color={statusColor(r.status)} /> },
                { key: "responsible", label: "Owner" },
              ]} rows={sel.deliverables || []} empty="No deliverables." />
            )}

            {tab === "team" && (
              <Table columns={[
                { key: "member", label: "Member", render: (r) => r.teamMember?.name },
                { key: "role", label: "Role", render: (r) => <Chip label={r.roleOnProject} /> },
                { key: "allocationPct", label: "Alloc", align: "center", render: (r) => `${r.allocationPct}%` },
                { key: "performanceScore", label: "Perf", align: "center", render: (r) => <span style={{ color: r.performanceScore >= 85 ? C.ok : C.warn, fontFamily: C.orbit }}>{r.performanceScore}</span> },
                { key: "status", label: "Status", render: (r) => <Chip label={r.status} color={statusColor(r.status)} /> },
              ]} rows={sel.subAssignments || []} empty="No team assigned." />
            )}

            {tab === "activity" && <CommentThread entityType="clientProject" entityId={sel.id} />}
          </div>
        )}
      </Modal>

      {/* File viewer */}
      <Modal open={!!viewFile} onClose={() => setViewFile(null)} title={viewFile ? `Viewer · ${viewFile.fileName}` : ""} width={640}>
        {viewFile && (
          <div>
            <div style={{ height: 300, background: "radial-gradient(circle at 50% 40%, rgba(107,142,35,0.15), rgba(10,14,20,0.9))", border: `1px solid ${C.olive}33`, borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(107,142,35,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(107,142,35,0.06) 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
              <div style={{ fontSize: "4rem", zIndex: 1 }}>{FILE_ICONS[viewFile.fileType] || "📄"}</div>
              <p style={{ fontFamily: C.orbit, fontSize: "0.8rem", color: "#fff", zIndex: 1, marginTop: "0.5rem" }}>{viewFile.fileType} MODEL PREVIEW</p>
              <p style={{ fontFamily: C.rajd, fontSize: "0.75rem", color: C.dim, zIndex: 1 }}>3D/2D viewer placeholder — integrate Autodesk Forge / Speckle for live render</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.5rem", marginTop: "1rem" }}>
              {[["Type", viewFile.fileType], ["Revision", viewFile.revision], ["CDE", viewFile.cdeState], ["Suitability", viewFile.suitability]].map(([k, v]) => (
                <div key={k} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.olive}14`, borderRadius: 3, padding: "0.5rem" }}>
                  <p style={{ fontFamily: C.orbit, fontSize: "0.5rem", color: C.dim, textTransform: "uppercase" }}>{k}</p>
                  <p style={{ fontFamily: C.rajd, fontSize: "0.85rem", color: C.text }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
