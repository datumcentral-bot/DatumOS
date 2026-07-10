"use client";
import { useState, useEffect } from "react";
import { C, PageHeader, KpiRow, Panel, Chip, statusColor, Table, Modal, Field, Input, Select, Textarea, Btn, FormRow, FormActions, Tabs, ProgressBar, EmptyState, ConfirmDialog, useToast, CommentThread } from "@/components/mil";

const INDUSTRIES = ["Architecture","Engineering","Construction","Real Estate","Government","Infrastructure","Oil & Gas","Healthcare","Education","Other"];
const TIERS = ["TIER1","TIER2","TIER3","TIER4"];
const STATUSES = ["ACTIVE","ON_HOLD","CLOSED"];
const PRIORITIES = ["CRITICAL","HIGH","MEDIUM","LOW"];
const REQ_CATS = ["FUNCTIONAL","TECHNICAL","REGULATORY","COMMERCIAL","QUALITY","SAFETY"];
const REQ_STATUSES = ["CAPTURED","IN_REVIEW","AGREED","REJECTED"];

export default function ClientsPage() {
  const toast = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("board");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("info");
  const [reqForm, setReqForm] = useState({});
  const [editReq, setEditReq] = useState(null);
  const [assessForm, setAssessForm] = useState({});
  const [editAssess, setEditAssess] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = () => fetch("/api/clients").then(r => r.json()).then(d => { setClients(Array.isArray(d) ? d : []); setLoading(false); });
  useEffect(() => { load(); }, []);

  const filtered = clients.filter(c => JSON.stringify(c).toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setForm({ tier: "TIER2", status: "ACTIVE" }); setShowForm(true); };
  const openEdit = (c) => { setForm({ ...c }); setShowForm(true); };

  const save = async (e) => {
    e?.preventDefault();
    if (!form.companyName || !form.contactName) { toast("Company name and contact name are required", "error"); return; }
    setSaving(true);
    try {
      const method = form.id ? "PUT" : "POST";
      const res = await fetch("/api/clients", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error);
      toast(form.id ? "Client updated" : "Client created", "success");
      setShowForm(false); setForm({}); load();
      if (sel) { const d = await (await fetch("/api/clients")).json(); setSel(d.find(x => x.id === sel.id) || null); }
    } catch (err) { toast(err.message, "error"); }
    finally { setSaving(false); }
  };

  const del = (c) => setConfirm({ msg: `Delete ${c.companyName} and ALL its data?`, onConfirm: async () => {
    await fetch(`/api/clients?id=${c.id}`, { method: "DELETE" });
    toast("Client deleted", "success"); setSel(null); load(); setConfirm(null);
  }});

  // Requirements
  const saveReq = async (e) => {
    e?.preventDefault();
    if (!reqForm.title) { toast("Title required", "error"); return; }
    const method = editReq ? "PUT" : "POST";
    const url = editReq ? `/api/clients/requirements?id=${editReq.id}` : "/api/clients/requirements";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...reqForm, clientId: sel.id }) });
    toast(editReq ? "Requirement updated" : "Requirement added", "success");
    setReqForm({}); setEditReq(null); refresh();
  };
  const delReq = (r) => setConfirm({ msg: `Delete requirement "${r.title}"?`, onConfirm: async () => {
    await fetch(`/api/clients/requirements?id=${r.id}`, { method: "DELETE" });
    toast("Requirement deleted", "success"); setConfirm(null); refresh();
  }});

  // Assessments
  const saveAssess = async (e) => {
    e?.preventDefault();
    const method = editAssess ? "PUT" : "POST";
    const url = editAssess ? `/api/clients/assessments?id=${editAssess.id}` : "/api/clients/assessments";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...assessForm, clientId: sel.id }) });
    toast(editAssess ? "Assessment updated" : "Assessment added", "success");
    setAssessForm({}); setEditAssess(null); refresh();
  };
  const delAssess = (a) => setConfirm({ msg: `Delete assessment for "${a.period}"?`, onConfirm: async () => {
    await fetch(`/api/clients/assessments?id=${a.id}`, { method: "DELETE" });
    toast("Assessment deleted", "success"); setConfirm(null); refresh();
  }});

  const refresh = async () => { const d = await (await fetch("/api/clients")).json(); setClients(d); if (sel) setSel(d.find(x => x.id === sel.id) || null); };

  const kpis = [
    { label: "Total Clients", value: clients.length, color: C.olive },
    { label: "Active", value: clients.filter(c => c.status === "ACTIVE").length, color: C.ok },
    { label: "Tier 1", value: clients.filter(c => c.tier === "TIER1").length, color: C.gold },
    { label: "Requirements", value: clients.reduce((s, c) => s + (c.requirements?.length || 0), 0), color: C.info },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader icon="🏢" title="Clients" subtitle="Client portfolio — requirements, assessments, documents"
        search={search} setSearch={setSearch} onNew={openNew} newLabel="+ CLIENT"
        right={<div style={{ display: "flex", gap: 4 }}>
          {["board","list"].map(v => <button key={v} onClick={() => setView(v)} style={{ background: view===v?`${C.olive}22`:"transparent", border:`1px solid ${view===v?C.olive+"66":C.olive+"22"}`, color: view===v?"#fff":C.dim, padding:"0.4rem 0.7rem", fontFamily:C.orbit, fontSize:"0.55rem", letterSpacing:"1px", cursor:"pointer", borderRadius:2, textTransform:"uppercase" }}>{v}</button>)}
        </div>} />
      <KpiRow items={kpis} />

      {loading ? <div style={{ color: C.dim, fontFamily: C.rajd, padding: "2rem" }}>Loading...</div> : (
        view === "board" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {filtered.length === 0 && <EmptyState icon="🏢" title="No clients yet" subtitle="Click + CLIENT to add your first client" />}
            {filtered.map(c => (
              <div key={c.id} onClick={() => { setSel(c); setTab("info"); }} style={{ background: C.panel, border: `1px solid ${C.olive}22`, borderRadius: 6, padding: "1rem", cursor: "pointer", position: "relative", transition: "border-color 0.2s" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${c.logoHue || C.olive}, transparent)` }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 4, background: `${c.logoHue || C.olive}22`, border: `1px solid ${c.logoHue || C.olive}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>🏢</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <Chip label={c.tier} color={statusColor(c.tier)} />
                    <Chip label={c.status} color={statusColor(c.status)} />
                  </div>
                </div>
                <h3 style={{ fontFamily: C.orbit, fontSize: "0.75rem", color: "#fff", letterSpacing: "1px", marginBottom: 2 }}>{c.companyName}</h3>
                <p style={{ fontFamily: C.rajd, fontSize: "0.8rem", color: C.dim, marginBottom: "0.75rem" }}>{c.industry} · {c.country}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.4rem", marginBottom: "0.75rem" }}>
                  {[["Projects", c.projects?.length || 0, C.olive], ["Reqs", c.requirements?.length || 0, C.info], ["Assessments", c.assessments?.length || 0, C.gold]].map(([l, v, col]) => (
                    <div key={l} style={{ textAlign: "center", background: `${col}0d`, border: `1px solid ${col}22`, borderRadius: 3, padding: "0.3rem" }}>
                      <div style={{ fontFamily: C.orbit, fontSize: "0.9rem", color: col, fontWeight: 700 }}>{v}</div>
                      <div style={{ fontFamily: C.orbit, fontSize: "0.45rem", color: C.dim, letterSpacing: "1px" }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <Btn onClick={e => { e.stopPropagation(); openEdit(c); }} variant="ghost" style={{ flex: 1, fontSize: "0.5rem", padding: "0.3rem" }}>EDIT</Btn>
                  <Btn onClick={e => { e.stopPropagation(); del(c); }} variant="danger" style={{ flex: 1, fontSize: "0.5rem", padding: "0.3rem" }}>DELETE</Btn>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Panel title="Client List">
            <Table columns={[
              { key: "companyName", label: "Company" },
              { key: "industry", label: "Industry" },
              { key: "country", label: "Country" },
              { key: "tier", label: "Tier", render: r => <Chip label={r.tier} color={statusColor(r.tier)} /> },
              { key: "status", label: "Status", render: r => <Chip label={r.status} color={statusColor(r.status)} /> },
              { key: "contactName", label: "Contact" },
              { key: "_projects", label: "Projects", render: r => r.projects?.length || 0 },
            ]} rows={filtered}
              onEdit={openEdit}
              onDelete={del}
            />
          </Panel>
        )
      )}

      {/* Client Detail Drawer */}
      {sel && (
        <Modal open={!!sel} onClose={() => setSel(null)} title={sel.companyName} width={720}>
          <Tabs tabs={[{id:"info",label:"Info"},{id:"requirements",label:`Requirements (${sel.requirements?.length||0})`},{id:"assessments",label:`Assessments (${sel.assessments?.length||0})`},{id:"projects",label:`Projects (${sel.projects?.length||0})`},{id:"comments",label:"Activity"}]} active={tab} setActive={setTab} />

          {tab === "info" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1.5rem" }}>
              {[["Company", sel.companyName], ["Industry", sel.industry], ["Country", sel.country], ["City", sel.city], ["Address", sel.address], ["Website", sel.website], ["Contact", sel.contactName], ["Email", sel.contactEmail], ["Phone", sel.contactPhone], ["Lead Member", sel.leadMember], ["Rep Team", sel.repTeam], ["Notes", sel.notes]].map(([l, v]) => v ? (
                <div key={l}><p style={{ fontFamily: C.orbit, fontSize: "0.5rem", color: C.dim, letterSpacing: "1px", marginBottom: 2 }}>{l}</p><p style={{ fontFamily: C.rajd, fontSize: "0.9rem", color: C.text }}>{v}</p></div>
              ) : null)}
            </div>
          )}

          {tab === "requirements" && (
            <div>
              <form onSubmit={saveReq} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "0.5rem", marginBottom: "1rem", alignItems: "end" }}>
                <Field label="Title *"><Input value={reqForm.title||""} onChange={e => setReqForm(p => ({...p, title: e.target.value}))} placeholder="Requirement title" /></Field>
                <Field label="Category"><Select value={reqForm.category||"FUNCTIONAL"} onChange={e => setReqForm(p => ({...p, category: e.target.value}))}>{REQ_CATS.map(c => <option key={c}>{c}</option>)}</Select></Field>
                <Field label="Priority"><Select value={reqForm.priority||"MEDIUM"} onChange={e => setReqForm(p => ({...p, priority: e.target.value}))}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</Select></Field>
                <Btn type="submit" style={{ marginBottom: 1 }}>{editReq ? "UPDATE" : "+ ADD"}</Btn>
              </form>
              {editReq && <div style={{ marginBottom: "0.5rem" }}><Field label="Detail"><Textarea value={reqForm.detail||""} onChange={e => setReqForm(p => ({...p, detail: e.target.value}))} /></Field></div>}
              <Table columns={[
                { key: "title", label: "Title" },
                { key: "category", label: "Category", render: r => <Chip label={r.category} color={C.info} /> },
                { key: "priority", label: "Priority", render: r => <Chip label={r.priority} color={statusColor(r.priority)} /> },
                { key: "status", label: "Status", render: r => <Chip label={r.status} color={statusColor(r.status)} /> },
                { key: "detail", label: "Detail" },
              ]} rows={sel.requirements || []}
                onEdit={r => { setEditReq(r); setReqForm({ ...r }); }}
                onDelete={delReq}
              />
            </div>
          )}

          {tab === "assessments" && (
            <div>
              <form onSubmit={saveAssess} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: "0.5rem", marginBottom: "1rem", alignItems: "end" }}>
                <Field label="Period *"><Input value={assessForm.period||""} onChange={e => setAssessForm(p => ({...p, period: e.target.value}))} placeholder="Q1 2026" /></Field>
                <Field label="Delivery (0-10)"><Input type="number" min="0" max="10" value={assessForm.scoreDelivery||0} onChange={e => setAssessForm(p => ({...p, scoreDelivery: Number(e.target.value)}))} /></Field>
                <Field label="Comms (0-10)"><Input type="number" min="0" max="10" value={assessForm.scoreComms||0} onChange={e => setAssessForm(p => ({...p, scoreComms: Number(e.target.value)}))} /></Field>
                <Field label="Value (0-10)"><Input type="number" min="0" max="10" value={assessForm.scoreValue||0} onChange={e => setAssessForm(p => ({...p, scoreValue: Number(e.target.value)}))} /></Field>
                <Btn type="submit" style={{ marginBottom: 1 }}>{editAssess ? "UPDATE" : "+ ADD"}</Btn>
              </form>
              <Table columns={[
                { key: "period", label: "Period" },
                { key: "scoreDelivery", label: "Delivery", render: r => <span style={{ color: r.scoreDelivery >= 7 ? C.ok : r.scoreDelivery >= 4 ? C.warn : C.danger, fontFamily: C.orbit, fontWeight: 700 }}>{r.scoreDelivery}/10</span> },
                { key: "scoreComms", label: "Comms", render: r => <span style={{ color: r.scoreComms >= 7 ? C.ok : r.scoreComms >= 4 ? C.warn : C.danger, fontFamily: C.orbit, fontWeight: 700 }}>{r.scoreComms}/10</span> },
                { key: "scoreValue", label: "Value", render: r => <span style={{ color: r.scoreValue >= 7 ? C.ok : r.scoreValue >= 4 ? C.warn : C.danger, fontFamily: C.orbit, fontWeight: 700 }}>{r.scoreValue}/10</span> },
                { key: "strengths", label: "Strengths" },
                { key: "concerns", label: "Concerns" },
              ]} rows={sel.assessments || []}
                onEdit={a => { setEditAssess(a); setAssessForm({ ...a }); }}
                onDelete={delAssess}
              />
            </div>
          )}

          {tab === "projects" && (
            <Table columns={[
              { key: "code", label: "Code" },
              { key: "name", label: "Project" },
              { key: "status", label: "Status", render: r => <Chip label={r.status} color={statusColor(r.status)} /> },
              { key: "progress", label: "Progress", render: r => <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><ProgressBar value={r.progress} /><span style={{ fontFamily: C.orbit, fontSize: "0.6rem", color: C.dim }}>{r.progress}%</span></div> },
              { key: "contractValue", label: "Value", render: r => `$${(r.contractValue||0).toLocaleString()}` },
            ]} rows={sel.projects || []} />
          )}

          {tab === "comments" && <CommentThread entityType="client" entityId={sel.id} />}
        </Modal>
      )}

      {/* New/Edit Client Modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setForm({}); }} title={form.id ? "Edit Client" : "New Client"} width={640}>
        <form onSubmit={save}>
          <FormRow>
            <Field label="Company Name *"><Input value={form.companyName||""} onChange={e => setForm(p => ({...p, companyName: e.target.value}))} placeholder="BAGC Engineering" /></Field>
            <Field label="Industry"><Select value={form.industry||""} onChange={e => setForm(p => ({...p, industry: e.target.value}))}><option value="">Select...</option>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}</Select></Field>
          </FormRow>
          <FormRow>
            <Field label="Country"><Input value={form.country||""} onChange={e => setForm(p => ({...p, country: e.target.value}))} placeholder="UAE" /></Field>
            <Field label="City"><Input value={form.city||""} onChange={e => setForm(p => ({...p, city: e.target.value}))} placeholder="Dubai" /></Field>
          </FormRow>
          <Field label="Address"><Input value={form.address||""} onChange={e => setForm(p => ({...p, address: e.target.value}))} placeholder="Business Bay, Dubai" /></Field>
          <Field label="Website"><Input value={form.website||""} onChange={e => setForm(p => ({...p, website: e.target.value}))} placeholder="https://..." /></Field>
          <FormRow>
            <Field label="Contact Name *"><Input value={form.contactName||""} onChange={e => setForm(p => ({...p, contactName: e.target.value}))} placeholder="Khalid Al-Rashid" /></Field>
            <Field label="Contact Email"><Input type="email" value={form.contactEmail||""} onChange={e => setForm(p => ({...p, contactEmail: e.target.value}))} placeholder="khalid@..." /></Field>
          </FormRow>
          <FormRow>
            <Field label="Contact Phone"><Input value={form.contactPhone||""} onChange={e => setForm(p => ({...p, contactPhone: e.target.value}))} placeholder="+971 50 ..." /></Field>
            <Field label="Lead Member"><Input value={form.leadMember||""} onChange={e => setForm(p => ({...p, leadMember: e.target.value}))} placeholder="Ahmed Hassan" /></Field>
          </FormRow>
          <Field label="Representative Team"><Input value={form.repTeam||""} onChange={e => setForm(p => ({...p, repTeam: e.target.value}))} placeholder="BIM Team, Coordination Team" /></Field>
          <FormRow>
            <Field label="Tier"><Select value={form.tier||"TIER2"} onChange={e => setForm(p => ({...p, tier: e.target.value}))}>{TIERS.map(t => <option key={t}>{t}</option>)}</Select></Field>
            <Field label="Status"><Select value={form.status||"ACTIVE"} onChange={e => setForm(p => ({...p, status: e.target.value}))}>{STATUSES.map(s => <option key={s}>{s}</option>)}</Select></Field>
          </FormRow>
          <Field label="Notes"><Textarea value={form.notes||""} onChange={e => setForm(p => ({...p, notes: e.target.value}))} placeholder="Additional notes..." /></Field>
          <FormActions onCancel={() => { setShowForm(false); setForm({}); }} saving={saving} submitLabel={form.id ? "UPDATE CLIENT" : "CREATE CLIENT"} />
        </form>
      </Modal>

      <ConfirmDialog open={!!confirm} message={confirm?.msg} onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </div>
  );
}
