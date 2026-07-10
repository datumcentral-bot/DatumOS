"use client";
import { useState, useEffect } from "react";
import { C, PageHeader, KpiRow, Panel, Chip, statusColor, Table, Modal, Field, Input, Select, Textarea, Btn, FormRow, FormActions, ConfirmDialog, useToast } from "@/components/mil";

const CATEGORIES = ["PROJECT_PROGRESS","TEAM_UTILIZATION","CLASH_RESOLUTION_RATE","RFI_RESPONSE_TIME","DOCUMENT_COMPLIANCE","CLIENT_SATISFACTION","BUDGET_VARIANCE","SCHEDULE_VARIANCE","BIM_MATURITY","QUALITY_SCORE"];

export default function KpiPage() {
  const toast = useToast();
  const [data, setData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    const [k, p] = await Promise.all([
      fetch("/api/kpi").then(r => r.json()),
      fetch("/api/pm-projects").then(r => r.json()),
    ]);
    setData(Array.isArray(k) ? k : []);
    setProjects(Array.isArray(p?.projects) ? p.projects : []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = data.filter(item => JSON.stringify(item).toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setForm({ value: 0, period: new Date().toISOString().split("T")[0] }); setShowForm(true); };
  const openEdit = (item) => { setForm({ ...item }); setShowForm(true); };

  const save = async (e) => {
    e?.preventDefault();
    if (!form.name) { toast("Metric name required", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        value: parseFloat(form.value) || 0,
        target: form.target ? parseFloat(form.target) : null,
        unit: form.unit || null,
        category: form.category || null,
        period: form.period || null,
        notes: form.notes || null,
        projectId: form.projectId || null,
      };
      const method = form.id ? "PUT" : "POST";
      const url = form.id ? `/api/kpi?id=${form.id}` : "/api/kpi";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form.id ? { id: form.id, ...payload } : payload) });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      toast(form.id ? "KPI updated" : "KPI recorded", "success");
      setShowForm(false); setForm({}); load();
    } catch (err) { toast(err.message, "error"); }
    finally { setSaving(false); }
  };

  const del = (item) => setConfirm({ msg: "Delete this KPI record?", onConfirm: async () => {
    await fetch(`/api/kpi?id=${item.id}`, { method: "DELETE" });
    toast("Deleted", "success"); setConfirm(null); load();
  }});

  const avgValue = data.length ? (data.reduce((s, d) => s + (d.value || 0), 0) / data.length).toFixed(1) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader icon="📈" title="Management Insights" subtitle="KPI tracking and performance metrics"
        search={search} setSearch={setSearch} onNew={openNew} newLabel="+ KPI" />
      <KpiRow items={[
        { label: "KPI Records", value: data.length, color: C.olive },
        { label: "Categories", value: new Set(data.map(d => d.category).filter(Boolean)).size, color: C.info },
        { label: "Projects Tracked", value: new Set(data.filter(d => d.projectId).map(d => d.projectId)).size, color: C.gold },
        { label: "Avg Value", value: avgValue, color: C.ok },
      ]} />
      <Panel title="KPI Records">
        <Table columns={[
          { key: "name", label: "Metric Name", render: r => <span style={{ color: C.oliveBright, fontWeight: 600 }}>{r.name}</span> },
          { key: "category", label: "Category", render: r => r.category ? <Chip label={r.category.replace(/_/g, " ")} color={C.olive} /> : <span style={{ color: C.dim }}>—</span> },
          { key: "value", label: "Value", render: r => <span style={{ fontFamily: C.orbit, color: C.gold, fontWeight: 700 }}>{r.value}{r.unit ? ` ${r.unit}` : ""}</span> },
          { key: "target", label: "Target", render: r => r.target != null ? <span style={{ color: C.info }}>{r.target}{r.unit ? ` ${r.unit}` : ""}</span> : <span style={{ color: C.dim }}>—</span> },
          { key: "period", label: "Period", render: r => r.period?.split("T")[0] || "—" },
          { key: "notes", label: "Notes", render: r => <span style={{ color: C.dim, fontSize: "0.8rem" }}>{r.notes || "—"}</span> },
        ]} rows={filtered} onEdit={openEdit} onDelete={del} />
      </Panel>
      <Modal open={showForm} onClose={() => { setShowForm(false); setForm({}); }} title={form.id ? "Edit KPI" : "Record KPI"} width={520}>
        <form onSubmit={save}>
          <Field label="Metric Name *"><Input value={form.name||""} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Clash Resolution Rate" /></Field>
          <Field label="Category"><Select value={form.category||""} onChange={e => setForm(p => ({...p, category: e.target.value}))}><option value="">Select category...</option>{CATEGORIES.map(m => <option key={m}>{m}</option>)}</Select></Field>
          <FormRow>
            <Field label="Value"><Input type="number" step="0.01" value={form.value||0} onChange={e => setForm(p => ({...p, value: e.target.value}))} /></Field>
            <Field label="Target"><Input type="number" step="0.01" value={form.target||""} onChange={e => setForm(p => ({...p, target: e.target.value}))} placeholder="Optional" /></Field>
            <Field label="Unit"><Input value={form.unit||""} onChange={e => setForm(p => ({...p, unit: e.target.value}))} placeholder="%, hrs, AED..." /></Field>
          </FormRow>
          <FormRow>
            <Field label="Period"><Input type="date" value={form.period?.split("T")[0]||""} onChange={e => setForm(p => ({...p, period: e.target.value}))} /></Field>
            <Field label="Project"><Select value={form.projectId||""} onChange={e => setForm(p => ({...p, projectId: e.target.value || null}))}><option value="">Global</option>{projects.map(p => <option key={p.id} value={p.id}>{p.code || p.name}</option>)}</Select></Field>
          </FormRow>
          <Field label="Notes"><Textarea value={form.notes||""} onChange={e => setForm(p => ({...p, notes: e.target.value}))} rows={2} /></Field>
          <FormActions onCancel={() => { setShowForm(false); setForm({}); }} saving={saving} submitLabel={form.id ? "UPDATE" : "RECORD"} />
        </form>
      </Modal>
      <ConfirmDialog open={!!confirm} message={confirm?.msg} onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </div>
  );
}
