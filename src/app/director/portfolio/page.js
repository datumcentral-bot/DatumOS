"use client";
import { useState, useEffect } from "react";
import { C, PageHeader, KpiRow, Panel, Chip, statusColor, Table, ProgressBar, useToast, Modal, Field, Input, Select, Textarea, Btn, FormRow, FormActions } from "@/components/mil";

const STATUS_OPTS = ["ACTIVE","PLANNING","ON_HOLD","COMPLETED","CANCELLED"];
const HEALTH_OPTS = ["GREEN","AMBER","RED"];
const ISO_OPTS = ["PRE-APPOINTMENT","APPOINTMENT","DESIGN","CONSTRUCTION","HANDOVER","CLOSEOUT"];
const EMPTY = { name:'', code:'', status:'ACTIVE', health:'GREEN', progress:0, contractValue:0, isoStatus:'DESIGN', description:'' };

export default function PortfolioPage() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = () => {
    Promise.all([
      fetch("/api/pm-projects").then(r => r.json()).catch(()=>({projects:[]})),
      fetch("/api/clients").then(r => r.json()).catch(()=>[])
    ]).then(([d, c]) => {
      setProjects(Array.isArray(d?.projects) ? d.projects : []);
      setClients(Array.isArray(c) ? c : []);
      setLoading(false);
    });
  };
  useEffect(() => { load(); }, []);

  const filtered = projects.filter(p => JSON.stringify(p).toLowerCase().includes(search.toLowerCase()));
  const active = projects.filter(p => p.status === "ACTIVE").length;
  const totalValue = projects.reduce((s, p) => s + (p.contractValue || 0), 0);
  const avgProgress = projects.length ? Math.round(projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length) : 0;

  const openNew = () => { setForm(EMPTY); setShowForm(true); };
  const openEdit = (p) => { setForm({ ...p }); setShowForm(true); };
  const f = (k) => (v) => setForm(prev => ({ ...prev, [k]: v }));

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const method = form.id ? "PUT" : "POST";
      const url = form.id ? `/api/pm-projects?id=${form.id}` : "/api/pm-projects";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, contractValue: Number(form.contractValue), progress: Number(form.progress) }) });
      if (!res.ok) throw new Error(await res.text());
      toast(form.id ? "Project updated" : "Project created", "success");
      setShowForm(false); setForm(EMPTY); load();
    } catch(err) { toast(err.message, "error"); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/pm-projects?id=${id}`, { method: "DELETE" });
    toast("Project deleted", "success"); load();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader icon="📁" title="Project Portfolio" subtitle="All client projects — status, health, and progress overview"
        search={search} setSearch={setSearch} onNew={openNew} newLabel="+ NEW PROJECT" />
      <KpiRow items={[
        { label: "Total Projects", value: projects.length, color: C.olive },
        { label: "Active", value: active, color: C.ok },
        { label: "Total Value", value: `$${(totalValue/1e6).toFixed(1)}M`, color: C.gold },
        { label: "Avg Progress", value: `${avgProgress}%`, color: C.info },
      ]} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
        {filtered.map(p => (
          <div key={p.id} style={{ background: C.panel, border: `1px solid ${C.olive}22`, borderRadius: 6, padding: "1rem", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${statusColor(p.health)}, transparent)` }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <Chip label={p.code} color={C.gold} />
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <Chip label={p.status} color={statusColor(p.status)} />
                <Chip label={p.health} color={statusColor(p.health)} />
              </div>
            </div>
            <h3 style={{ fontFamily: C.orbit, fontSize: "0.75rem", color: "#fff", letterSpacing: "1px", marginBottom: 2 }}>{p.name}</h3>
            <p style={{ fontFamily: C.rajd, fontSize: "0.8rem", color: C.dim, marginBottom: "0.75rem" }}>{p.client?.companyName || "—"}</p>
            <div style={{ marginBottom: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontFamily: C.orbit, fontSize: "0.5rem", color: C.dim, letterSpacing: "1px" }}>PROGRESS</span>
                <span style={{ fontFamily: C.orbit, fontSize: "0.6rem", color: C.oliveBright }}>{p.progress}%</span>
              </div>
              <ProgressBar value={p.progress} color={statusColor(p.health)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginBottom: "0.5rem" }}>
              <div style={{ background: `${C.gold}0d`, border: `1px solid ${C.gold}22`, borderRadius: 3, padding: "0.3rem", textAlign: "center" }}>
                <div style={{ fontFamily: C.orbit, fontSize: "0.7rem", color: C.gold }}>${(p.contractValue/1000).toFixed(0)}K</div>
                <div style={{ fontFamily: C.orbit, fontSize: "0.45rem", color: C.dim }}>VALUE</div>
              </div>
              <div style={{ background: `${C.info}0d`, border: `1px solid ${C.info}22`, borderRadius: 3, padding: "0.3rem", textAlign: "center" }}>
                <div style={{ fontFamily: C.orbit, fontSize: "0.7rem", color: C.info }}>{p.isoStatus || "—"}</div>
                <div style={{ fontFamily: C.orbit, fontSize: "0.45rem", color: C.dim }}>ISO STAGE</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => openEdit(p)} style={{ flex:1, padding:"4px 0", background:"#1a2a1a", border:"1px solid #3a5020", color:"#8a9a70", borderRadius:3, cursor:"pointer", fontFamily:C.orbit, fontSize:"0.5rem", letterSpacing:"1px" }}>✏ EDIT</button>
              <button onClick={() => del(p.id)} style={{ flex:1, padding:"4px 0", background:"#2a1010", border:"1px solid #5a2020", color:"#9a6060", borderRadius:3, cursor:"pointer", fontFamily:C.orbit, fontSize:"0.5rem", letterSpacing:"1px" }}>✕ DELETE</button>
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"3rem", color:C.dim, fontFamily:C.rajd }}>
            No projects found. <button onClick={openNew} style={{ color:C.gold, background:"none", border:"none", cursor:"pointer", fontFamily:C.rajd, fontSize:"inherit" }}>+ Create your first project</button>
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => { setShowForm(false); setForm(EMPTY); }} title={form.id ? "Edit Project" : "New Project"} width={640}>
        <form onSubmit={save}>
          <FormRow>
            <Field label="Project Name" required><Input value={form.name} onChange={f("name")} placeholder="e.g. ARITC Tower — BIM Package" required /></Field>
            <Field label="Project Code" required><Input value={form.code} onChange={f("code")} placeholder="e.g. ARITC-2026" required /></Field>
          </FormRow>
          <FormRow>
            <Field label="Status"><Select value={form.status} onChange={f("status")} options={STATUS_OPTS} /></Field>
            <Field label="Health"><Select value={form.health} onChange={f("health")} options={HEALTH_OPTS} /></Field>
          </FormRow>
          <FormRow>
            <Field label="ISO Stage"><Select value={form.isoStatus} onChange={f("isoStatus")} options={ISO_OPTS} /></Field>
            <Field label="Client">
              <Select value={form.clientId} onChange={f("clientId")} options={clients.map(c=>({value:c.id,label:c.companyName}))} placeholder="Select client..." />
            </Field>
          </FormRow>
          <FormRow>
            <Field label="Contract Value (USD)"><Input type="number" value={form.contractValue} onChange={f("contractValue")} placeholder="0" /></Field>
            <Field label="Progress (%)"><Input type="number" min="0" max="100" value={form.progress} onChange={f("progress")} placeholder="0" /></Field>
          </FormRow>
          <Field label="Description"><Textarea value={form.description} onChange={f("description")} rows={2} /></Field>
          <FormActions onCancel={() => { setShowForm(false); setForm(EMPTY); }} saving={saving} submitLabel={form.id ? "UPDATE PROJECT" : "CREATE PROJECT"} />
        </form>
      </Modal>
    </div>
  );
}
