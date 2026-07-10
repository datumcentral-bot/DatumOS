"use client";
import { useState, useEffect } from "react";
import { C, PageHeader, KpiRow, Panel, Chip, statusColor, Table, Modal, Field, Input, Select, Textarea, Btn, FormRow, FormActions, ConfirmDialog, useToast } from "@/components/mil";

const STATUSES = ["OPEN","IN_REVIEW","RESPONDED","CLOSED"];
const PRIORITIES = ["LOW","MEDIUM","HIGH","CRITICAL"];
const DISCIPLINES = ["ARCHITECTURAL","STRUCTURAL","MEP","CIVIL","FACADE","LANDSCAPE","OTHER"];

export default function CoordinationPage() {
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
    const [d, p] = await Promise.all([
      fetch("/api/coordination").then(r => r.json()),
      fetch("/api/pm-projects").then(r => r.json()),
    ]);
    setData(Array.isArray(d) ? d : []);
    setProjects(Array.isArray(p?.projects) ? p.projects : []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = data.filter(item => JSON.stringify(item).toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setForm({ status: "OPEN", priority: "MEDIUM" }); setShowForm(true); };
  const openEdit = (item) => { setForm({ ...item, dueDate: item.dueDate?.split("T")[0] }); setShowForm(true); };

  const save = async (e) => {
    e?.preventDefault();
    if (!form.subject || !form.projectId) { toast("Subject and project required", "error"); return; }
    setSaving(true);
    try {
      const url = form.id ? `/api/coordination/${form.id}` : "/api/coordination";
      const method = form.id ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error);
      toast(form.id ? "RFI updated" : "RFI created", "success");
      setShowForm(false); setForm({}); load();
    } catch (err) { toast(err.message, "error"); }
    finally { setSaving(false); }
  };

  const del = (item) => setConfirm({ msg: `Delete RFI "${item.subject}"?`, onConfirm: async () => {
    await fetch(`/api/coordination/${item.id}`, { method: "DELETE" });
    toast("RFI deleted", "success"); setConfirm(null); load();
  }});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader icon="🔗" title="Coordination Hub" subtitle="RFI management and BIM coordination tracking"
        search={search} setSearch={setSearch} onNew={openNew} newLabel="+ RFI" />
      <KpiRow items={[
        { label: "Total RFIs", value: data.length, color: C.olive },
        { label: "Open", value: data.filter(d => d.status === "OPEN").length, color: C.warn },
        { label: "In Review", value: data.filter(d => d.status === "IN_REVIEW").length, color: C.info },
        { label: "Closed", value: data.filter(d => d.status === "CLOSED").length, color: C.ok },
      ]} />
      <Panel title="RFI Register">
        <Table columns={[
          { key: "ref", label: "Ref" },
          { key: "subject", label: "Subject" },
          { key: "discipline", label: "Discipline", render: r => r.discipline ? <Chip label={r.discipline} color={C.info} /> : "—" },
          { key: "priority", label: "Priority", render: r => <Chip label={r.priority} color={statusColor(r.priority)} /> },
          { key: "status", label: "Status", render: r => <Chip label={r.status} color={statusColor(r.status)} /> },
          { key: "project", label: "Project", render: r => r.project?.code || "—" },
          { key: "dueDate", label: "Due", render: r => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—" },
        ]} rows={filtered} onEdit={openEdit} onDelete={del} />
      </Panel>
      <Modal open={showForm} onClose={() => { setShowForm(false); setForm({}); }} title={form.id ? "Edit RFI" : "New RFI"} width={580}>
        <form onSubmit={save}>
          <FormRow>
            <Field label="Subject *"><Input value={form.subject||""} onChange={e => setForm(p => ({...p, subject: e.target.value}))} placeholder="Clash between structural and MEP" /></Field>
            <Field label="Project *"><Select value={form.projectId||""} onChange={e => setForm(p => ({...p, projectId: e.target.value}))}><option value="">Select...</option>{projects.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}</Select></Field>
          </FormRow>
          <FormRow>
            <Field label="Discipline"><Select value={form.discipline||""} onChange={e => setForm(p => ({...p, discipline: e.target.value}))}><option value="">Select...</option>{DISCIPLINES.map(d => <option key={d}>{d}</option>)}</Select></Field>
            <Field label="Priority"><Select value={form.priority||"MEDIUM"} onChange={e => setForm(p => ({...p, priority: e.target.value}))}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</Select></Field>
          </FormRow>
          <FormRow>
            <Field label="Status"><Select value={form.status||"OPEN"} onChange={e => setForm(p => ({...p, status: e.target.value}))}>{STATUSES.map(s => <option key={s}>{s}</option>)}</Select></Field>
            <Field label="Due Date"><Input type="date" value={form.dueDate||""} onChange={e => setForm(p => ({...p, dueDate: e.target.value}))} /></Field>
          </FormRow>
          <Field label="Question"><Textarea value={form.question||""} onChange={e => setForm(p => ({...p, question: e.target.value}))} placeholder="Describe the coordination issue..." /></Field>
          <Field label="Answer / Resolution"><Textarea value={form.answer||""} onChange={e => setForm(p => ({...p, answer: e.target.value}))} placeholder="Resolution or response..." /></Field>
          <FormActions onCancel={() => { setShowForm(false); setForm({}); }} saving={saving} submitLabel={form.id ? "UPDATE RFI" : "CREATE RFI"} />
        </form>
      </Modal>
      <ConfirmDialog open={!!confirm} message={confirm?.msg} onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </div>
  );
}
