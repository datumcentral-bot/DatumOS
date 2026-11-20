"use client";
import { useState, useEffect } from "react";

const STATUS_COLORS = {
  ACTIVE:    { bg: "rgba(107,142,35,0.15)", text: "#6b8e23" },
  COMPLETE:  { bg: "rgba(76,201,240,0.15)", text: "#4cc9f0" },
  ON_HOLD:   { bg: "rgba(255,177,0,0.15)",  text: "#ffb100" },
  CANCELLED: { bg: "rgba(255,59,48,0.15)",  text: "#ff3b30" },
};

const S = {
  page: { padding: 24, background: "#0d1108", minHeight: "100vh", fontFamily: "'Rajdhani', sans-serif" },
  title: { fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#a8c060", letterSpacing: 2, margin: "0 0 4px" },
  sub: { color: "#6b7a5a", fontSize: "0.75rem", letterSpacing: 1, marginBottom: 20 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 },
  card: { background: "#1a1f14", border: "1px solid #2a3020", borderRadius: 6, padding: 20 },
  cardTitle: { fontFamily: "'Orbitron', sans-serif", fontSize: "0.85rem", color: "#a8c060", letterSpacing: 1, marginBottom: 6 },
  badge: (s) => ({ background: STATUS_COLORS[s]?.bg || "#1a1f14", color: STATUS_COLORS[s]?.text || "#6b7a5a", borderRadius: 3, padding: "3px 8px", fontSize: "0.65rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: 1 }),
  progress: { background: "#0d1108", borderRadius: 4, height: 6, overflow: "hidden", marginTop: 12 },
  progressBar: (pct) => ({ background: "#4a6741", height: "100%", width: `${Math.min(100, pct || 0)}%`, borderRadius: 4, transition: "width 0.3s" }),
};

export default function WorkspaceProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.json())
      .then(d => setProjects(Array.isArray(d) ? d : Array.isArray(d?.projects) ? d.projects : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={S.page}>
      <h1 style={S.title}>◆ MY PROJECTS</h1>
      <p style={S.sub}>ASSIGNED PROJECTS · PROGRESS TRACKING · DELIVERABLES</p>
      {loading ? (
        <div style={{ color: "#6b7a5a", textAlign: "center", padding: 60, fontFamily: "'Orbitron', sans-serif", fontSize: "0.8rem", letterSpacing: 2 }}>LOADING PROJECTS...</div>
      ) : projects.length === 0 ? (
        <div style={{ color: "#3a4a30", textAlign: "center", padding: 60, fontSize: "0.9rem" }}>No projects assigned yet.</div>
      ) : (
        <div style={S.grid}>
          {projects.map(p => (
            <div key={p.id} style={S.card}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div style={S.cardTitle}>{p.name}</div>
                  <div style={{ color: "#6b7a5a", fontSize: "0.75rem" }}>{p.code || "—"}</div>
                </div>
                <span style={S.badge(p.status)}>{p.status}</span>
              </div>
              {p.client && <div style={{ color: "#8a9a70", fontSize: "0.75rem", marginBottom: 8 }}>Client: {p.client.companyName}</div>}
              {p.description && <div style={{ color: "#6b7a5a", fontSize: "0.75rem", marginBottom: 10, lineHeight: 1.5 }}>{p.description?.slice(0, 100)}{p.description?.length > 100 ? "..." : ""}</div>}
              <div style={{ display: "flex", gap: 16, fontSize: "0.7rem", color: "#6b7a5a", marginBottom: 8 }}>
                {p.startDate && <span>Start: {new Date(p.startDate).toLocaleDateString()}</span>}
                {p.endDate && <span>End: {new Date(p.endDate).toLocaleDateString()}</span>}
              </div>
              <div style={S.progress}>
                <div style={S.progressBar(p.progress || 0)} />
              </div>
              <div style={{ color: "#6b7a5a", fontSize: "0.65rem", marginTop: 4, textAlign: "right" }}>{p.progress || 0}% complete</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
