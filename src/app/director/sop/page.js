"use client";
import { useState, useEffect } from "react";
import { C, PageHeader, KpiRow, Panel, Chip, statusColor, Table, Modal, Field, Input, Select, Textarea, Btn, FormRow, FormActions, ConfirmDialog, useToast } from "@/components/mil";

const DIVISIONS = ["BIM","COORDINATION","MODELING","QA","MANAGEMENT","ADMIN","ALL"];

export default function SopPage() {
  const toast = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);

  const load = () => fetch("/api/sop").then(r => r.json()).then(d => { setData(Array.isArray(d) ? d : []); setLoading(false); });
  useEffect(() => { load(); }, []);

  const filtered = data.filter(item => JSON.stringify(item).toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setForm({}); setShowForm(true); };
  const openEdit = (item) => { setForm({ ...item }); setShowForm(true); };

  const save = async (e) => {
    e?.preventDefault();
    if (!form.title) { toast("Title required", "error"); return; }
    setSaving(true);
    try {
      const url = form.id ? `/api/sop/${form.id}` : "/api/sop";
      const method = form.id ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error);
      toast(form.id ? "SOP updated" : "SOP created", "success");
      setShowForm(false); setForm({}); load();
    } catch (err) { toast(err.message, "error"); }
    finally { setSaving(false); }
  };

  const del = (item) => setConfirm({ msg: `Delete SOP "${item.title}"?`, onConfirm: async () => {
    await fetch(`/api/sop/${item.id}`, { method: "DELETE" });
    toast("SOP deleted", "success"); setConfirm(null); load();
  }});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader icon="📋" title="Standard Operating Procedures" subtitle="BIM SOPs, workflows, and how-to guides"
        search={search} setSearch={setSearch} onNew={openNew} newLabel="+ SOP" />
      <KpiRow items={[
        { label: "Total SOPs", value: data.length, color: C.olive },
        { label: "BIM", value: data.filter(d => d.divisionCode === "BIM").length, color: C.info },
        { label: "QA", value: data.filter(d => d.divisionCode === "QA").length, color: C.gold },
        { label: "General", value: data.filter(d => !d.divisionCode || d.divisionCode === "ALL").length, color: C.dim },
      ]} />
      <Panel title="SOP Library">
        <Table columns={[
          { key: "code", label: "Code" },
          { key: "title", label: "Title" },
          { key: "divisionCode", label: "Division", render: r => r.divisionCode ? <Chip label={r.divisionCode} color={C.info} /> : "—" },
          { key: "summary", label: "Summary", render: r => r.summary?.substring(0, 60) || "—" },
          { key: "checklist", label: "Steps", render: r => r.checklist?.length || 0 },
        ]} rows={filtered} onEdit={openEdit} onDelete={del} />
      </Panel>
      <Modal open={showForm} onClose={() => { setShowForm(false); setForm({}); }} title={form.id ? "Edit SOP" : "New SOP"} width={600}>
        <form onSubmit={save}>
          <FormRow>
            <Field label="Title *"><Input value={form.title||""} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="BIM Coordination Procedure" /></Field>
            <Field label="Division"><Select value={form.divisionCode||""} onChange={e => setForm(p => ({...p, divisionCode: e.target.value || null}))}><option value="">All divisions</option>{DIVISIONS.map(d => <option key={d}>{d}</option>)}</Select></Field>
          </FormRow>
          <Field label="Summary"><Textarea value={form.summary||""} onChange={e => setForm(p => ({...p, summary: e.target.value}))} placeholder="Brief description of this SOP..." /></Field>
          <Field label="Steps (one per line)"><Textarea value={form.steps||""} onChange={e => setForm(p => ({...p, steps: e.target.value}))} style={{ minHeight: 120 }} placeholder="1. Open Revit model&#10;2. Run clash detection&#10;3. Export report..." /></Field>
          <FormActions onCancel={() => { setShowForm(false); setForm({}); }} saving={saving} submitLabel={form.id ? "UPDATE SOP" : "CREATE SOP"} />
        </form>
      </Modal>
      <ConfirmDialog open={!!confirm} message={confirm?.msg} onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </div>
  );
}
