"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const STATUS_OPTS = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETE"];
const STATUS_COLORS = {
  TODO:        { bg: "rgba(107,142,35,0.1)",  text: "#8a9a70" },
  IN_PROGRESS: { bg: "rgba(255,177,0,0.12)",  text: "#ffb100" },
  REVIEW:      { bg: "rgba(76,201,240,0.12)", text: "#4cc9f0" },
  COMPLETE:    { bg: "rgba(40,167,69,0.12)",  text: "#28a745" },
};
const PRIORITY_COLORS = {
  HIGH:   "#ff3b30", MEDIUM: "#ffb100", LOW: "#6b8e23", URGENT: "#ff0000",
};

const S = {
  page: { padding: 24, background: "#0d1108", minHeight: "100vh", fontFamily: "'Rajdhani', sans-serif" },
  title: { fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#a8c060", letterSpacing: 2, margin: "0 0 4px" },
  sub: { color: "#6b7a5a", fontSize: "0.75rem", letterSpacing: 1, marginBottom: 20 },
  filters: { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  filterBtn: (active) => ({ background: active ? "#4a6741" : "#1a1f14", color: active ? "#d4e8a0" : "#6b7a5a", border: `1px solid ${active ? "#5a7a50" : "#2a3020"}`, borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: 1 }),
  table: { width: "100%", borderCollapse: "collapse" },
  th: { background: "#1a1f14", color: "#6b7a5a", fontSize: "0.65rem", letterSpacing: 1, textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #2a3020" },
  td: { padding: "12px 14px", borderBottom: "1px solid #1a1f14", color: "#c8d8a0", fontSize: "0.85rem", verticalAlign: "middle" },
  badge: (s) => ({ background: STATUS_COLORS[s]?.bg || "#1a1f14", color: STATUS_COLORS[s]?.text || "#6b7a5a", borderRadius: 3, padding: "3px 8px", fontSize: "0.65rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: 1 }),
};

export default function WorkspaceTasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/pm-tasks")
      .then(r => r.json())
      .then(d => setTasks(Array.isArray(d) ? d : []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? tasks : tasks.filter(t => t.status === filter);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/pm-tasks/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error((await res.json()).error);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div style={S.page}>
      <h1 style={S.title}>◈ MY TASKS</h1>
      <p style={S.sub}>ASSIGNED TASKS · STATUS TRACKING · PRIORITY MANAGEMENT</p>
      <div style={S.filters}>
        {["ALL", ...STATUS_OPTS].map(s => (
          <button key={s} style={S.filterBtn(filter === s)} onClick={() => setFilter(s)}>{s.replace("_", " ")}</button>
        ))}
      </div>
      {loading ? (
        <div style={{ color: "#6b7a5a", textAlign: "center", padding: 60, fontFamily: "'Orbitron', sans-serif", fontSize: "0.8rem", letterSpacing: 2 }}>LOADING TASKS...</div>
      ) : (
        <div style={{ background: "#1a1f14", border: "1px solid #2a3020", borderRadius: 6, overflow: "hidden" }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Task</th>
                <th style={S.th}>Project</th>
                <th style={S.th}>Priority</th>
                <th style={S.th}>Status</th>
                <th style={S.th}>Due Date</th>
                <th style={S.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ ...S.td, textAlign: "center", color: "#3a4a30", padding: 40 }}>No tasks found</td></tr>
              ) : filtered.map(task => (
                <tr key={task.id} style={{ background: "transparent" }}>
                  <td style={S.td}>
                    <div style={{ fontWeight: 600 }}>{task.title}</div>
                    {task.description && <div style={{ color: "#6b7a5a", fontSize: "0.75rem", marginTop: 2 }}>{task.description?.slice(0, 60)}{task.description?.length > 60 ? "..." : ""}</div>}
                  </td>
                  <td style={{ ...S.td, color: "#8a9a70" }}>{task.project?.name || "—"}</td>
                  <td style={S.td}>
                    <span style={{ color: PRIORITY_COLORS[task.priority] || "#6b7a5a", fontWeight: 600, fontSize: "0.75rem" }}>{task.priority || "—"}</span>
                  </td>
                  <td style={S.td}><span style={S.badge(task.status)}>{task.status?.replace("_", " ")}</span></td>
                  <td style={{ ...S.td, color: "#6b7a5a", fontSize: "0.75rem" }}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</td>
                  <td style={S.td}>
                    <select
                      value={task.status}
                      onChange={e => updateStatus(task.id, e.target.value)}
                      style={{ background: "#0d1108", border: "1px solid #3a4a30", borderRadius: 3, color: "#c8d8a0", padding: "4px 8px", fontSize: "0.75rem", cursor: "pointer" }}
                    >
                      {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
