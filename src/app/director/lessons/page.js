"use client";
import { useState, useEffect } from "react";
import { C, PageHeader, KpiRow, Panel, Chip, statusColor, Table, Modal, Field, Input, Select, Textarea, Btn, FormRow, FormActions, ConfirmDialog, useToast } from "@/components/mil";

const CATS = ["PROCESS","TECHNICAL","COMMUNICATION","PLANNING","QUALITY","SAFETY","COMMERCIAL","OTHER"];
const IMPACTS = ["LOW","MEDIUM","HIGH","CRITICAL"];
const STATUSES = ["OPEN","IN_REVIEW","IMPLEMENTED","CLOSED"];

export default function LessonsPage() {
  const toast = useToast();
  const [lessons, setLessons] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    const [l, p] = await Promise.all([
      fetch("/api/lessons").then(r => r.json()),
      fetch("/api/pm-projects").then(r => r.json()),
    ]);
    setLessons(Array.isArray(l) ? l : []);
    setProjects(Array.isArray(p?.projects) ? p.projects : []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = lessons.filter(l => {
    const matchSearch = JSON.stringify(l).toLowerCase().includes(search.toLowerCase());
    const matchProject = !filterProject || l.projectId === filterProject;
    return matchSearch && matchProject;
  });

  const openNew = () => { setForm({ category: "PROCESS", impact: "MEDIUM", status: "OPEN" }); setShowForm(true); };
  const openEdit = (l) => { setForm({ ...l }); setShowForm(true); };

  const save = async (e) => {
    e?.preventDefault();
    if (!form.title || !form.description) { toast("Title and description required", "error"); return; }
    setSaving(true);
    try {
      const url = form.id ? `/api/lessons/${form.id}` : "/api/lessons";
      const method = form.id ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error);
      toast(form.id ? "Lesson updated" : "Lesson recorded", "success");
      setShowForm(false); setForm({}); load();
    } catch (err) { toast(err.message, "error"); }
    finally { setSaving(false); }
  };

  const del = (l) => setConfirm({ msg: `Delete lesson "${l.title}"?`, onConfirm: async () => {
    await fetch(`/api/lessons/${l.id}`, { method: "DELETE" });
    toast("Lesson deleted", "success"); setConfirm(null); load();
  }});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader icon="📚" title="Lessons Learned" subtitle="Capture and share knowledge from project experience"
        search={search} setSearch={setSearch} onNew={openNew} newLabel="+ LESSON"
        right={<Select value={filterProject} onChange={e => setFilterProject(e.target.value)} style={{ width: 180, padding: "0.4rem 0.6rem", fontSize: "0.8rem" }}><option value="">All Projects</option>{projects.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}</Select>} />
      <KpiRow items={[
        { label: "Total Lessons", value: lessons.length, color: C.olive },
        { label: "Open", value: lessons.filter(l => l.status === "OPEN").length, color: C.warn },
        { label: "Implemented", value: lessons.filter(l => l.status === "IMPLEMENTED").length, color: C.ok },
        { label: "High Impact", value: lessons.filter(l => l.impact === "HIGH" || l.impact === "CRITICAL").length, color: C.danger },
      ]} />
      <Panel title="Lessons Register">
        <Table columns={[
          { key: "title", label: "Title" },
          { key: "category", label: "Category", render: r => <Chip label={r.category} color={C.info} /> },
          { key: "impact", label: "Impact", render: r => <Chip label={r.impact} color={statusColor(r.impact)} /> },
          { key: "status", label: "Status", render: r => <Chip label={r.status} color={statusColor(r.status)} /> },
          { key: "project", label: "Project", render: r => r.project?.code || "—" },
          { key: "author", label: "Author" },
          { key: "description", label: "Description", render: r => r.description?.substring(0, 60) + (r.description?.length > 60 ? "..." : "") },
        ]} rows={filtered} onEdit={openEdit} onDelete={del} />
      </Panel>

      <Modal open={showForm} onClose={() => { setShowForm(false); setForm({}); }} title={form.id ? "Edit Lesson" : "New Lesson Learned"} width={620}>
        <form onSubmit={save}>
          <FormRow>
            <Field label="Title *"><Input value={form.title||""} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Lesson title" /></Field>
            <Field label="Category"><Select value={form.category||"PROCESS"} onChange={e => setForm(p => ({...p, category: e.target.value}))}>{CATS.map(c => <option key={c}>{c}</option>)}</Select></Field>
          </FormRow>
          <FormRow>
            <Field label="Impact"><Select value={form.impact||"MEDIUM"} onChange={e => setForm(p => ({...p, impact: e.target.value}))}>{IMPACTS.map(i => <option key={i}>{i}</option>)}</Select></Field>
            <Field label="Status"><Select value={form.status||"OPEN"} onChange={e => setForm(p => ({...p, status: e.target.value}))}>{STATUSES.map(s => <option key={s}>{s}</option>)}</Select></Field>
          </FormRow>
          <FormRow>
            <Field label="Phase"><Input value={form.phase||""} onChange={e => setForm(p => ({...p, phase: e.target.value}))} placeholder="Design, Coordination, Delivery..." /></Field>
            <Field label="Author"><Input value={form.author||""} onChange={e => setForm(p => ({...p, author: e.target.value}))} placeholder="Ahmed Hassan" /></Field>
          </FormRow>
          <Field label="Project"><Select value={form.projectId||""} onChange={e => setForm(p => ({...p, projectId: e.target.value || null}))}><option value="">General (no project)</option>{projects.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}</Select></Field>
          <Field label="Description *"><Textarea value={form.description||""} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="What happened and what was learned..." /></Field>
          <Field label="Recommended Action"><Textarea value={form.action||""} onChange={e => setForm(p => ({...p, action: e.target.value}))} placeholder="What should be done differently next time..." /></Field>
          <FormActions onCancel={() => { setShowForm(false); setForm({}); }} saving={saving} submitLabel={form.id ? "UPDATE" : "RECORD LESSON"} />
        </form>
      </Modal>
      <ConfirmDialog open={!!confirm} message={confirm?.msg} onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </div>
  );
}
