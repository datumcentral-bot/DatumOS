"use client";
import { useState, useEffect, useRef } from "react";

const COLUMNS = [
  { id: "TODO",        label: "TO DO",       color: "#94a3b8" },
  { id: "IN_PROGRESS", label: "IN PROGRESS", color: "#ffb100" },
  { id: "REVIEW",      label: "REVIEW",      color: "#4cc9f0" },
  { id: "COMPLETE",    label: "COMPLETE",    color: "#28a745" },
];

const PRIORITY_COLORS = {
  HIGH:   { bg: "rgba(255,59,48,0.12)",  text: "#ff3b30",  border: "rgba(255,59,48,0.3)" },
  MEDIUM: { bg: "rgba(255,177,0,0.12)",  text: "#ffb100",  border: "rgba(255,177,0,0.3)" },
  LOW:    { bg: "rgba(107,142,35,0.12)", text: "#6b8e23",  border: "rgba(107,142,35,0.3)" },
};

function TaskCard({ task, onDragStart }) {
  const pc = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM;
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(107,142,35,0.15)",
        borderRadius: 4,
        padding: "0.75rem",
        cursor: "grab",
        marginBottom: "0.5rem",
        transition: "border-color 0.2s, box-shadow 0.2s",
        position: "relative",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(107,142,35,0.4)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.3)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(107,142,35,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: "1px solid rgba(107,142,35,0.4)", borderLeft: "1px solid rgba(107,142,35,0.4)" }} />
      <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#f0f2f5", marginBottom: 6, lineHeight: 1.3 }}>{task.title}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <span style={{ fontSize: "0.6rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px", padding: "0.15rem 0.4rem", borderRadius: 2, background: pc.bg, color: pc.text, border: `1px solid ${pc.border}` }}>
          {task.priority}
        </span>
        {task.project && (
          <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px" }}>
            {task.project.code}
          </span>
        )}
      </div>
      {task.assignee && (
        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(107,142,35,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", color: "#a2d033", fontWeight: 700 }}>
            {task.assignee.name?.charAt(0) || "?"}
          </div>
          <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{task.assignee.name}</span>
        </div>
      )}
      {task.dueDate && (
        <p style={{ fontSize: "0.6rem", color: "#94a3b8", marginTop: 4 }}>
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

export default function WorkspacePage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", priority: "MEDIUM", status: "TODO" });
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [tRes, pRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/projects"),
      ]);
      const [tData, pData] = await Promise.all([tRes.json(), pRes.json()]);
      setTasks(Array.isArray(tData) ? tData : Array.isArray(tData?.tasks) ? tData.tasks : []);
      setProjects(Array.isArray(pData) ? pData : Array.isArray(pData?.projects) ? pData.projects : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDragStart = (e, id) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!dragId) return;
    const task = tasks.find(t => t.id === dragId);
    if (!task || task.status === newStatus) { setDragId(null); return; }

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === dragId ? { ...t, status: newStatus } : t));
    setDragId(null);

    try {
      await fetch(`/api/tasks/${dragId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error("Failed to update task status", e);
      load(); // revert
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ title: "", priority: "MEDIUM", status: "TODO" });
        load();
      }
    } finally {
      setSaving(false);
    }
  };

  const byStatus = (status) => tasks.filter(t => t.status === status);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", height: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1rem", borderBottom: "1px solid rgba(107,142,35,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 40, height: 40, borderRadius: 4, background: "rgba(107,142,35,0.12)", border: "1px solid rgba(107,142,35,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", color: "#6b8e23" }}>
            ⬡
          </div>
          <div>
            <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "#fff", letterSpacing: "2px", textTransform: "uppercase" }}>Task Board</h1>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>BIM Delivery Kanban — Drag to update status</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: "rgba(107,142,35,0.12)", border: "1px solid rgba(107,142,35,0.3)", borderRadius: 2, color: "#fff", padding: "0.45rem 1rem", fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "1.5px", cursor: "pointer", textTransform: "uppercase" }}
        >
          + NEW TASK
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {COLUMNS.map(col => (
          <div key={col.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(107,142,35,0.12)", borderRadius: 4, padding: "0.75rem 1rem", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: `1px solid ${col.color}`, borderLeft: `1px solid ${col.color}`, opacity: 0.6 }} />
            <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.5rem", color: "#94a3b8", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>{col.label}</p>
            <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.4rem", fontWeight: 700, color: col.color }}>{loading ? "—" : byStatus(col.id).length}</p>
          </div>
        ))}
      </div>

      {/* Add Task Form */}
      {showForm && (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(107,142,35,0.3)", borderRadius: 4, padding: "1.25rem" }}>
          <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.7rem", color: "#a2d033", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "1rem" }}>NEW TASK</h3>
          <form onSubmit={handleAddTask} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.65rem", color: "#94a3b8", display: "block", marginBottom: 4, fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px" }}>TASK TITLE *</label>
              <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 2, color: "#f0f2f5", padding: "0.5rem 0.75rem", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.9rem", outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.65rem", color: "#94a3b8", display: "block", marginBottom: 4, fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px" }}>PRIORITY</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                style={{ width: "100%", background: "#0a0e14", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 2, color: "#f0f2f5", padding: "0.5rem 0.75rem", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.9rem", outline: "none" }}>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.65rem", color: "#94a3b8", display: "block", marginBottom: 4, fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px" }}>PROJECT</label>
              <select value={form.projectId || ""} onChange={e => setForm({ ...form, projectId: e.target.value || undefined })}
                style={{ width: "100%", background: "#0a0e14", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 2, color: "#f0f2f5", padding: "0.5rem 0.75rem", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.9rem", outline: "none" }}>
                <option value="">— Select Project —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.65rem", color: "#94a3b8", display: "block", marginBottom: 4, fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px" }}>DUE DATE</label>
              <input type="date" value={form.dueDate || ""} onChange={e => setForm({ ...form, dueDate: e.target.value || undefined })}
                style={{ width: "100%", background: "#0a0e14", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 2, color: "#f0f2f5", padding: "0.5rem 0.75rem", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.9rem", outline: "none" }} />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, color: "#94a3b8", padding: "0.45rem 1rem", fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", cursor: "pointer" }}>
                CANCEL
              </button>
              <button type="submit" disabled={saving}
                style={{ background: "rgba(107,142,35,0.2)", border: "1px solid rgba(107,142,35,0.4)", borderRadius: 2, color: "#fff", padding: "0.45rem 1rem", fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "1.5px", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                {saving ? "SAVING..." : "CREATE TASK"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", fontFamily: "'Orbitron', sans-serif", fontSize: "0.7rem", letterSpacing: "2px" }}>
          LOADING TASK BOARD...
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", flex: 1, minHeight: 0 }}>
          {COLUMNS.map(col => (
            <div
              key={col.id}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, col.id)}
              style={{
                background: "rgba(255,255,255,0.015)",
                border: `1px solid ${col.color}22`,
                borderTop: `2px solid ${col.color}`,
                borderRadius: 4,
                padding: "0.75rem",
                minHeight: 300,
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.6rem", fontWeight: 700, color: col.color, letterSpacing: "2px", textTransform: "uppercase" }}>
                  {col.label}
                </span>
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", color: col.color, background: `${col.color}22`, padding: "0.1rem 0.4rem", borderRadius: 2 }}>
                  {byStatus(col.id).length}
                </span>
              </div>
              {byStatus(col.id).map(task => (
                <TaskCard key={task.id} task={task} onDragStart={handleDragStart} />
              ))}
              {byStatus(col.id).length === 0 && (
                <div style={{ textAlign: "center", padding: "2rem 0", color: "#4d584d", fontSize: "0.7rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px" }}>
                  DROP HERE
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}