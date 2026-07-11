"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/lib/useSocket";
import LiveToast from "@/components/LiveToast";
import OnlineUsers from "@/components/OnlineUsers";
import { C, PageHeader, KpiRow, Panel, Chip, statusColor, Table, Modal, Field, Input, Select, Textarea, Btn, ConfirmDialog, useToast, FormRow, FormActions } from "@/components/mil";

const COLUMNS = [
  { key: "TODO", label: "To Do", color: C.dim },
  { key: "IN_PROGRESS", label: "In Progress", color: C.warn },
  { key: "IN_REVIEW", label: "In Review", color: C.info },
  { key: "DONE", label: "Done", color: C.ok },
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function TasksPage() {
  

  const { data: session } = useSession();
  const [liveEvents, setLiveEvents] = useState([]);
  const handleLiveEvent = (ev) => {
    setLiveEvents(prev => [...prev, { ...ev, id: Date.now() + Math.random() }]);
    // Auto-refresh data list
    if (ev.action === 'created' || ev.action === 'updated' || ev.action === 'deleted') {
      // Re-fetch from DB to get the latest data
      load();
    }
  };
  const { isConnected, onlineUsers, emitCrud } = useSocket('tasks', session?.user, handleLiveEvent);
const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ projects: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("board");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [drag, setDrag] = useState(null);
  const toast = useToast();

  const load = () => Promise.all([
    fetch("/api/pm-tasks").then((r) => r.json()),
    fetch("/api/pm-projects").then((r) => r.json()),
  ]).then(([t, m]) => { setTasks(Array.isArray(t) ? t : []); setMeta(m || { projects: [], users: [] }); setLoading(false); });
  useEffect(() => { load(); }, []);

  const filtered = tasks.filter((t) => JSON.stringify(t).toLowerCase().includes(search.toLowerCase()));

  const save = async () => {
    try {
      const method = form.id ? "PUT" : "POST";
      const url = form.id ? `/api/pm-tasks` : `/api/pm-tasks`;
      const payload = { ...form };
      if (payload.estimatedHrs === '' || payload.estimatedHrs === undefined) delete payload.estimatedHrs;
      else payload.estimatedHrs = parseFloat(payload.estimatedHrs);
      if (payload.dueDate) payload.dueDate = new Date(payload.dueDate).toISOString();
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.message || 'Failed to save task');
      }
      const saved = await res.json();
      toast(form.id ? "Task updated" : "Task created", "success");
      setShowForm(false);
      setForm({});
      load();
    } catch (err) {
      toast(err.message, "error");
    }
  };
  const del = async (id) => {
    try {
      await fetch(`/api/pm-tasks?id=${id}`, { method: "DELETE" });
      toast("Task deleted", "success");
      load();
    } catch (err) {
      toast(err.message, "error");
    }
  };
  const move = async (task, status) => {
    try {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
      const res = await fetch("/api/pm-tasks", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: task.id, status }) });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to move task');
      }
      toast(`Moved to ${status}`, "success");
    } catch (err) {
      toast(err.message, "error");
      load();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <LiveToast events={liveEvents} />

<style>{`
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
`}</style>

      <PageHeader icon="▤" title="Task Board" subtitle="ClickUp-style multi-view — Board · List · Calendar · Timeline"
        search={search} setSearch={setSearch} onNew={() => { setForm({}); setShowForm(true); }} newLabel="+ TASK"
        right={
          <div style={{ display: "flex", gap: 4 }}>
            {["board", "list", "calendar", "timeline"].map((v) => (
              <button key={v} onClick={() => setView(v)} style={{ background: view === v ? `${C.olive}22` : "transparent", border: `1px solid ${view === v ? C.olive + "66" : C.olive + "22"}`, color: view === v ? "#fff" : C.dim, padding: "0.4rem 0.7rem", fontFamily: C.orbit, fontSize: "0.55rem", letterSpacing: "1px", cursor: "pointer", borderRadius: 2, textTransform: "uppercase" }}>{v}</button>
            ))}
          </div>
        } />

      <KpiRow items={[
        { label: "Total Tasks", value: loading ? "—" : tasks.length, color: C.olive },
        { label: "In Progress", value: loading ? "—" : tasks.filter((t) => t.status === "IN_PROGRESS").length, color: C.warn },
        { label: "In Review", value: loading ? "—" : tasks.filter((t) => t.status === "IN_REVIEW").length, color: C.info },
        { label: "Done", value: loading ? "—" : tasks.filter((t) => t.status === "DONE").length, color: C.ok },
      ]} />

      {view === "board" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", alignItems: "start" }}>
          {COLUMNS.map((col) => {
            const items = filtered.filter((t) => t.status === col.key);
            return (
              <div key={col.key} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag) move(drag, col.key); setDrag(null); }}
                style={{ background: "rgba(255,255,255,0.015)", border: `1px solid ${col.color}33`, borderRadius: 6, minHeight: 200 }}>
                <div style={{ padding: "0.7rem 0.9rem", borderBottom: `1px solid ${col.color}22`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: C.orbit, fontSize: "0.6rem", color: col.color, letterSpacing: "1.5px", textTransform: "uppercase" }}>{col.label}</span>
                  <span style={{ fontFamily: C.orbit, fontSize: "0.6rem", color: C.dim }}>{items.length}</span>
                </div>
                <div style={{ padding: "0.6rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {items.map((t) => (
                    <div key={t.id} draggable onDragStart={() => setDrag(t)} onClick={() => { setForm({ ...t }); setShowForm(true); }}
                      style={{ background: C.panel, border: `1px solid ${C.olive}22`, borderRadius: 4, padding: "0.6rem 0.7rem", cursor: "grab" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <Chip label={t.priority} color={statusColor(t.priority)} />
                        {t.project && <span style={{ fontFamily: C.rajd, fontSize: "0.65rem", color: C.faint }}>{t.project.code}</span>}
                      </div>
                      <p style={{ fontFamily: C.rajd, fontSize: "0.85rem", color: C.text, marginBottom: 4 }}>{t.title}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: C.rajd, fontSize: "0.68rem", color: C.dim }}>{t.assignee?.name || "Unassigned"}</span>
                        {t.dueDate && <span style={{ fontFamily: C.rajd, fontSize: "0.65rem", color: C.faint }}>{new Date(t.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "list" && (
        <Panel title="Task List">
          <Table columns={[
            { key: "title", label: "Task" },
            { key: "project", label: "Project", render: (r) => r.project?.code },
            { key: "assignee", label: "Assignee", render: (r) => r.assignee?.name || "—" },
            { key: "priority", label: "Priority", render: (r) => <Chip label={r.priority} color={statusColor(r.priority)} /> },
            { key: "status", label: "Status", render: (r) => <Chip label={r.status} color={statusColor(r.status)} /> },
            { key: "dueDate", label: "Due", render: (r) => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—" },
            { key: "act", label: "", align: "right", render: (r) => <><Btn variant="ghost" onClick={() => { setForm({ ...r }); setShowForm(true); }}>Edit</Btn> <button onClick={() => del(r.id)} style={{ background: "none", border: "none", color: C.danger, cursor: "pointer" }}>✕</button></> },
          ]} rows={filtered} empty="No tasks." />
        </Panel>
      )}

      {view === "calendar" && (
        <Panel title="Calendar — Tasks by Due Date">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
            {MONTHS.map((mo, mi) => {
              const items = filtered.filter((t) => t.dueDate && new Date(t.dueDate).getMonth() === mi);
              return (
                <div key={mo} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.olive}18`, borderRadius: 4, padding: "0.6rem", minHeight: 90 }}>
                  <p style={{ fontFamily: C.orbit, fontSize: "0.6rem", color: C.oliveBright, letterSpacing: "1px", marginBottom: 6 }}>{mo}</p>
                  {items.map((t) => (
                    <div key={t.id} onClick={() => { setForm({ ...t }); setShowForm(true); }} style={{ fontFamily: C.rajd, fontSize: "0.72rem", color: C.text, padding: "2px 4px", marginBottom: 3, borderLeft: `2px solid ${statusColor(t.priority)}`, cursor: "pointer", background: "rgba(255,255,255,0.02)" }}>{t.title}</div>
                  ))}
                  {items.length === 0 && <span style={{ fontFamily: C.rajd, fontSize: "0.7rem", color: C.faint }}>—</span>}
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {view === "timeline" && (
        <Panel title="Timeline — Gantt View">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "180px repeat(12, 1fr)", gap: 2, marginBottom: 4 }}>
              <span />
              {MONTHS.map((m) => <span key={m} style={{ fontFamily: C.orbit, fontSize: "0.5rem", color: C.dim, textAlign: "center" }}>{m}</span>)}
            </div>
            {filtered.filter((t) => t.dueDate).slice(0, 20).map((t) => {
              const mo = new Date(t.dueDate).getMonth();
              return (
                <div key={t.id} style={{ display: "grid", gridTemplateColumns: "180px repeat(12, 1fr)", gap: 2, alignItems: "center" }}>
                  <span style={{ fontFamily: C.rajd, fontSize: "0.72rem", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</span>
                  {MONTHS.map((m, i) => (
                    <div key={i} style={{ height: 16, borderRadius: 2, background: i === mo ? statusColor(t.status) : "rgba(255,255,255,0.03)", opacity: i === mo ? 0.9 : 1 }} />
                  ))}
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={form.id ? "Edit Task" : "New Task"}>
        <Field label="Title" required><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
          <Field label="Project"><Select value={form.projectId || ""} onChange={(e) => setForm({ ...form, projectId: e.target.value })}><option value="">First project</option>{meta.projects.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}</Select></Field>
          <Field label="Assignee"><Select value={form.assigneeId || ""} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}><option value="">Unassigned</option>{meta.users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select></Field>
          <Field label="Status"><Select value={form.status || "TODO"} onChange={(e) => setForm({ ...form, status: e.target.value })}>{COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</Select></Field>
          <Field label="Priority"><Select value={form.priority || "MEDIUM"} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></Select></Field>
          <Field label="Est. Hrs"><Input type="number" value={form.estimatedHrs || ""} onChange={(e) => setForm({ ...form, estimatedHrs: e.target.value })} /></Field>
          <Field label="Due Date"><Input type="date" value={form.dueDate ? String(form.dueDate).slice(0, 10) : ""} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></Field>
        </div>
        <Field label="Description"><Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
          {form.id ? <Btn variant="danger" onClick={() => { del(form.id); setShowForm(false); }}>Delete</Btn> : <span />}
          <div style={{ display: "flex", gap: "0.6rem" }}><Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn><Btn onClick={save}>{form.id ? "Save" : "Create"}</Btn></div>
        </div>
      </Modal>
    </div>
  );
}