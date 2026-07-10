"use client";
import { useState, useEffect } from "react";
import { C, PageHeader, KpiRow, Panel, Chip, statusColor, Table, Modal, Field, Input, Select, Textarea, Btn, FormRow, FormActions, ConfirmDialog, useToast, ProgressBar } from "@/components/mil";

const STATUSES = ["PENDING","IN_PROGRESS","COMPLETE","DELAYED","CANCELLED"];

export default function MilestonesPage() {
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
    const [m, p] = await Promise.all([
      fetch("/api/milestones").then(r => r.json()),
      fetch("/api/pm-projects").then(r => r.json()),
    ]);
    setData(Array.isArray(m) ? m : []);
    setProjects(Array.isArray(p?.projects) ? p.projects : []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = data.filter(item => JSON.stringify(item).toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setForm({ status: "PENDING" }); setShowForm(true); };
  const openEdit = (item) => { setForm({ ...item, dueDate: item.dueDate?.split("T")[0] }); setShowForm(true); };

  const save = async (e) => {
    e?.preventDefault();
    if (!form.title || !form.projectId) { toast("Title and project required", "error"); return; }
    setSaving(true);
    try {
      const url = form.id ? `/api/milestones/${form.id}` : "/api/milestones";
      const method = form.id ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error);
      toast(form.id ? "Milestone updated" : "Milestone created", "success");
      setShowForm(false); setForm({}); load();
    } catch (err) { toast(err.message, "error"); }
    finally { setSaving(false); }
  };

  const del = (item) => setConfirm({ msg: `Delete milestone "${item.title}"?`, onConfirm: async () => {
    await fetch(`/api/milestones/${item.id}`, { method: "DELETE" });
    toast("Milestone deleted", "success"); setConfirm(null); load();
  }});

  const complete = data.filter(m => m.status === "COMPLETE").length;
  const overdue = data.filter(m => m.status === "DELAYED" || (m.dueDate && new Date(m.dueDate) < new Date() && m.status !== "COMPLETE")).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader icon="🎯" title="Milestones" subtitle="MIDP/TIDP milestone tracking across all projects"
        search={search} setSearch={setSearch} onNew={openNew} newLabel="+ MILESTONE" />
      <KpiRow items={[
        { label: "Total", value: data.length, color: C.olive },
        { label: "Complete", value: complete, color: C.ok },
        { label: "Pending", value: data.filter(m => m.status === "PENDING").length, color: C.warn },
        { label: "Overdue", value: overdue, color: C.danger },
      ]} />
      <Panel title="Milestone Register">
        <Table columns={[
          { key: "title", label: "Milestone" },
          { key: "project", label: "Project", render: r => r.project?.code || "—" },
          { key: "dueDate", label: "Due Date", render: r => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—" },
          { key: "status", label: "Status", render: r => <Chip label={r.status} color={statusColor(r.status)} /> },
        ]} rows={filtered} onEdit={openEdit} onDelete={del} />
      </Panel>
      <Modal open={showForm} onClose={() => { setShowForm(false); setForm({}); }} title={form.id ? "Edit Milestone" : "New Milestone"} width={520}>
        <form onSubmit={save}>
          <Field label="Title *"><Input value={form.title||""} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Milestone title" /></Field>
          <FormRow>
            <Field label="Project *"><Select value={form.projectId||""} onChange={e => setForm(p => ({...p, projectId: e.target.value}))}><option value="">Select project...</option>{projects.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}</Select></Field>
            <Field label="Status"><Select value={form.status||"PENDING"} onChange={e => setForm(p => ({...p, status: e.target.value}))}>{STATUSES.map(s => <option key={s}>{s}</option>)}</Select></Field>
          </FormRow>
          <Field label="Due Date"><Input type="date" value={form.dueDate||""} onChange={e => setForm(p => ({...p, dueDate: e.target.value}))} /></Field>
          <FormActions onCancel={() => { setShowForm(false); setForm({}); }} saving={saving} submitLabel={form.id ? "UPDATE" : "CREATE"} />
        </form>
      </Modal>
      <ConfirmDialog open={!!confirm} message={confirm?.msg} onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </div>
  );
}
