"use client";
import { useState, useEffect } from "react";

const STATUS_COLORS = {
  TODO:        { color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
  IN_PROGRESS: { color: "#ffb100", bg: "rgba(255,177,0,0.1)" },
  REVIEW:      { color: "#4cc9f0", bg: "rgba(76,201,240,0.1)" },
  COMPLETE:    { color: "#28a745", bg: "rgba(40,167,69,0.1)" },
  BLOCKED:     { color: "#ff3b30", bg: "rgba(255,59,48,0.1)" },
};

const HEALTH_COLORS = { GREEN: "#28a745", AMBER: "#ffb100", RED: "#ff3b30" };

export default function MonitoringPage() {
  const [data, setData] = useState({ tasks: [], projects: [], activity: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("tasks");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data?collection=production_monitor");
      const d = await res.json();
      setData({
        tasks: Array.isArray(d?.tasks) ? d.tasks : [],
        projects: Array.isArray(d?.projects) ? d.projects : [],
        activity: Array.isArray(d?.activity) ? d.activity : [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  const tasksByStatus = (status) => data.tasks.filter(t => t.status === status);
  const criticalTasks = data.tasks.filter(t => t.priority === "HIGH" && t.status !== "COMPLETE");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1rem", borderBottom: "1px solid rgba(107,142,35,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 40, height: 40, borderRadius: 4, background: "rgba(107,142,35,0.12)", border: "1px solid rgba(107,142,35,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", color: "#6b8e23" }}>◉</div>
          <div>
            <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "#fff", letterSpacing: "2px", textTransform: "uppercase" }}>Production Monitor</h1>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>Sub-con Monitoring — Live Task Pipeline</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28a745", animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.6rem", color: "#28a745", letterSpacing: "1px" }}>LIVE</span>
          </div>
          <button onClick={load} style={{ background: "rgba(107,142,35,0.1)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 2, color: "#6b8e23", padding: "0.35rem 0.75rem", fontFamily: "'Orbitron', sans-serif", fontSize: "0.6rem", cursor: "pointer", letterSpacing: "1px" }}>REFRESH</button>
        </div>
      </div>

      {/* Live KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem" }}>
        {[
          { label: "TOTAL TASKS", value: data.tasks.length, color: "#4cc9f0" },
          { label: "IN PROGRESS", value: tasksByStatus("IN_PROGRESS").length, color: "#ffb100" },
          { label: "REVIEW", value: tasksByStatus("REVIEW").length, color: "#4cc9f0" },
          { label: "COMPLETE", value: tasksByStatus("COMPLETE").length, color: "#28a745" },
          { label: "CRITICAL", value: criticalTasks.length, color: "#ff3b30" },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(107,142,35,0.12)", borderRadius: 4, padding: "0.75rem 1rem", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: `1px solid ${s.color}`, borderLeft: `1px solid ${s.color}`, opacity: 0.6 }} />
            <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.5rem", color: "#94a3b8", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.4rem", fontWeight: 700, color: s.color }}>{loading ? "—" : s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid rgba(107,142,35,0.15)", paddingBottom: "0.5rem" }}>
        {[
          { id: "tasks", label: "TASK PIPELINE" },
          { id: "projects", label: "PROJECT HEALTH" },
          { id: "activity", label: "ACTIVITY FEED" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ background: tab === t.id ? "rgba(107,142,35,0.15)" : "transparent", border: tab === t.id ? "1px solid rgba(107,142,35,0.3)" : "1px solid transparent", borderRadius: 2, color: tab === t.id ? "#a2d033" : "#94a3b8", padding: "0.4rem 0.9rem", fontFamily: "'Orbitron', sans-serif", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "1.5px", cursor: "pointer", textTransform: "uppercase" }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", fontFamily: "'Orbitron', sans-serif", fontSize: "0.7rem", letterSpacing: "2px" }}>SYNCHRONIZING...</div>
      ) : (
        <>
          {/* Task Pipeline */}
          {tab === "tasks" && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(107,142,35,0.12)", borderRadius: 4, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(107,142,35,0.2)" }}>
                    {["TASK", "PROJECT", "ASSIGNEE", "STATUS", "PRIORITY", "DUE DATE"].map(h => (
                      <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontFamily: "'Orbitron', sans-serif", fontSize: "0.55rem", color: "#94a3b8", letterSpacing: "1.5px", fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.tasks.slice(0, 30).map((task, i) => {
                    const sc = STATUS_COLORS[task.status] || STATUS_COLORS.TODO;
                    const isHigh = task.priority === "HIGH";
                    return (
                      <tr key={task.id} style={{ borderBottom: "1px solid rgba(107,142,35,0.06)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                        <td style={{ padding: "0.65rem 1rem", fontSize: "0.8rem", color: isHigh ? "#ff3b30" : "#f0f2f5", fontWeight: isHigh ? 600 : 400 }}>{task.title}</td>
                        <td style={{ padding: "0.65rem 1rem", fontFamily: "'Orbitron', sans-serif", fontSize: "0.6rem", color: "#4cc9f0", letterSpacing: "1px" }}>{task.project?.code || "—"}</td>
                        <td style={{ padding: "0.65rem 1rem", fontSize: "0.75rem", color: "#94a3b8" }}>{task.assignee?.name || "Unassigned"}</td>
                        <td style={{ padding: "0.65rem 1rem" }}>
                          <span style={{ fontSize: "0.6rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px", padding: "0.15rem 0.4rem", borderRadius: 2, background: sc.bg, color: sc.color }}>{task.status}</span>
                        </td>
                        <td style={{ padding: "0.65rem 1rem" }}>
                          <span style={{ fontSize: "0.6rem", fontFamily: "'Orbitron', sans-serif", color: isHigh ? "#ff3b30" : task.priority === "MEDIUM" ? "#ffb100" : "#6b8e23" }}>{task.priority}</span>
                        </td>
                        <td style={{ padding: "0.65rem 1rem", fontSize: "0.7rem", color: "#94a3b8" }}>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    );
                  })}
                  {data.tasks.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#4d584d", fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", letterSpacing: "2px" }}>NO TASKS IN PIPELINE</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Project Health */}
          {tab === "projects" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
              {data.projects.map(p => {
                const hc = HEALTH_COLORS[p.health] || HEALTH_COLORS.AMBER;
                return (
                  <div key={p.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${hc}22`, borderLeft: `3px solid ${hc}`, borderRadius: 4, padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", color: "#4cc9f0", letterSpacing: "1px" }}>{p.code}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: hc }} />
                        <span style={{ fontSize: "0.6rem", color: hc, fontFamily: "'Orbitron', sans-serif" }}>{p.health}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f0f2f5", marginBottom: 6 }}>{p.name}</p>
                    <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginBottom: 8 }}>{p.client?.companyName}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${p.progress || 0}%`, height: "100%", background: hc, borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: "0.65rem", color: "#94a3b8", fontFamily: "'Orbitron', sans-serif", minWidth: 30 }}>{p.progress || 0}%</span>
                    </div>
                  </div>
                );
              })}
              {data.projects.length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "#4d584d", fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", letterSpacing: "2px" }}>NO PROJECTS</div>
              )}
            </div>
          )}

          {/* Activity Feed */}
          {tab === "activity" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {data.activity.map(a => (
                <div key={a.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(107,142,35,0.1)", borderRadius: 4, padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(107,142,35,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "#6b8e23", fontWeight: 700, flexShrink: 0 }}>
                    {a.actor?.charAt(0) || "?"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.8rem", color: "#f0f2f5" }}>{a.summary}</p>
                    <p style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: 2 }}>{a.actor} · {new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                  <span style={{ fontSize: "0.6rem", fontFamily: "'Orbitron', sans-serif", color: "#94a3b8", letterSpacing: "1px" }}>{a.entity}</span>
                </div>
              ))}
              {data.activity.length === 0 && (
                <div style={{ textAlign: "center", padding: "3rem", color: "#4d584d", fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", letterSpacing: "2px" }}>NO ACTIVITY LOGGED</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
