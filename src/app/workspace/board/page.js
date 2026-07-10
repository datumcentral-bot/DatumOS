"use client";
import { useState, useEffect, useRef } from "react";

const COLUMNS = [
  { id: "TODO",        label: "TO DO",       color: "#94a3b8" },
  { id: "IN_PROGRESS", label: "IN PROGRESS", color: "#ffb100" },
  { id: "REVIEW",      label: "REVIEW",      color: "#4cc9f0" },
  { id: "COMPLETE",    label: "COMPLETE",    color: "#28a745" },
];

const PRIORITY_COLORS = {
  HIGH:   { bg: "rgba(255,59,48,0.12)",  text: "#ff3b30" },
  MEDIUM: { bg: "rgba(255,177,0,0.12)",  text: "#ffb100" },
  LOW:    { bg: "rgba(107,142,35,0.12)", text: "#6b8e23" },
};

const S = {
  page: { padding: 24, background: "#0d1108", minHeight: "100vh", fontFamily: "'Rajdhani', sans-serif" },
  title: { fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#a8c060", letterSpacing: 2, margin: "0 0 4px" },
  sub: { color: "#6b7a5a", fontSize: "0.75rem", letterSpacing: 1, marginBottom: 20 },
  board: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, overflowX: "auto" },
  col: (isOver) => ({ background: isOver ? "rgba(107,142,35,0.06)" : "#1a1f14", border: `1px solid ${isOver ? "#4a6741" : "#2a3020"}`, borderRadius: 6, padding: 12, minHeight: 400, transition: "border-color 0.2s" }),
  colHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #2a3020" },
  colTitle: { fontFamily: "'Orbitron', sans-serif", fontSize: "0.6rem", letterSpacing: 1, color: "#a8c060" },
  card: { background: "#0d1108", border: "1px solid #2a3020", borderRadius: 4, padding: "10px 12px", marginBottom: 8, cursor: "grab" },
  cardTitle: { color: "#c8d8a0", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4 },
  cardMeta: { color: "#6b7a5a", fontSize: "0.7rem" },
};

function TaskCard({ task, onDragStart }) {
  const pc = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM;
  return (
    <div draggable onDragStart={(e) => onDragStart(e, task.id)} style={S.card}>
      <div style={S.cardTitle}>{task.title}</div>
      {task.project?.name && <div style={S.cardMeta}>{task.project.name}</div>}
      <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
        {task.priority && <span style={{ background: pc.bg, color: pc.text, borderRadius: 3, padding: "2px 6px", fontSize: "0.6rem" }}>{task.priority}</span>}
        {task.dueDate && <span style={{ color: "#5a6a40", fontSize: "0.65rem" }}>{new Date(task.dueDate).toLocaleDateString()}</span>}
      </div>
    </div>
  );
}

export default function WorkspaceBoardPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(null);
  const [overCol, setOverCol] = useState(null);

  useEffect(() => {
    fetch("/api/pm-tasks").then(r => r.json()).then(d => setTasks(Array.isArray(d) ? d : [])).catch(() => setTasks([])).finally(() => setLoading(false));
  }, []);

  const byCol = COLUMNS.reduce((acc, c) => { acc[c.id] = tasks.filter(t => t.status === c.id); return acc; }, {});

  const handleDragStart = (e, id) => { setDragging(id); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e, colId) => { e.preventDefault(); setOverCol(colId); };
  const handleDrop = async (e, colId) => {
    e.preventDefault();
    if (!dragging) return;
    const task = tasks.find(t => t.id === dragging);
    if (!task || task.status === colId) { setDragging(null); setOverCol(null); return; }
    setTasks(prev => prev.map(t => t.id === dragging ? { ...t, status: colId } : t));
    await fetch(`/api/pm-tasks/${dragging}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: colId }) });
    setDragging(null); setOverCol(null);
  };

  return (
    <div style={S.page}>
      <h1 style={S.title}>◉ TASK BOARD</h1>
      <p style={S.sub}>KANBAN VIEW · DRAG & DROP · STATUS MANAGEMENT</p>
      {loading ? (
        <div style={{ color: "#6b7a5a", textAlign: "center", padding: 60, fontFamily: "'Orbitron', sans-serif", fontSize: "0.8rem", letterSpacing: 2 }}>LOADING BOARD...</div>
      ) : (
        <div style={S.board}>
          {COLUMNS.map(col => (
            <div key={col.id} style={S.col(overCol === col.id)} onDragOver={e => handleDragOver(e, col.id)} onDrop={e => handleDrop(e, col.id)} onDragLeave={() => setOverCol(null)}>
              <div style={S.colHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.color, display: "inline-block" }} />
                  <span style={S.colTitle}>{col.label}</span>
                </div>
                <span style={{ background: "#2a3020", color: "#6b7a5a", borderRadius: 10, padding: "2px 8px", fontSize: "0.7rem" }}>{byCol[col.id]?.length || 0}</span>
              </div>
              {(byCol[col.id] || []).map(task => <TaskCard key={task.id} task={task} onDragStart={handleDragStart} />)}
              {(byCol[col.id] || []).length === 0 && (
                <div style={{ border: "1px dashed #2a3020", borderRadius: 4, padding: "24px 12px", textAlign: "center", color: "#3a4a30", fontSize: "0.7rem" }}>Drop here</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
