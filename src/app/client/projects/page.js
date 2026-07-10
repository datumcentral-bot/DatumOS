"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const STATUS_COLORS = {
  ACTIVE:    { bg: "rgba(76,201,240,0.15)", text: "#4cc9f0" },
  COMPLETE:  { bg: "rgba(40,167,69,0.15)",  text: "#28a745" },
  ON_HOLD:   { bg: "rgba(255,177,0,0.15)",  text: "#ffb100" },
  CANCELLED: { bg: "rgba(255,59,48,0.15)",  text: "#ff3b30" },
};

const S = {
  page: { padding: 24, background: "#0a0e14", minHeight: "100vh", fontFamily: "'Rajdhani', sans-serif" },
  title: { fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#4cc9f0", letterSpacing: 2, margin: "0 0 4px" },
  sub: { color: "#4a6a7a", fontSize: "0.75rem", letterSpacing: 1, marginBottom: 20 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 },
  card: { background: "#111820", border: "1px solid #1a2a3a", borderRadius: 8, padding: 22, textDecoration: "none", display: "block", transition: "border-color 0.2s" },
  cardTitle: { fontFamily: "'Orbitron', sans-serif", fontSize: "0.85rem", color: "#4cc9f0", letterSpacing: 1, marginBottom: 6 },
  badge: (s) => ({ background: STATUS_COLORS[s]?.bg || "#111820", color: STATUS_COLORS[s]?.text || "#4a6a7a", borderRadius: 3, padding: "3px 8px", fontSize: "0.65rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: 1 }),
  progress: { background: "#0a0e14", borderRadius: 4, height: 6, overflow: "hidden", marginTop: 12 },
  progressBar: (pct) => ({ background: "#4cc9f0", height: "100%", width: `${Math.min(100, pct || 0)}%`, borderRadius: 4 }),
};

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(d => setProjects(Array.isArray(d) ? d : Array.isArray(d?.projects) ? d.projects : [])).catch(() => setProjects([])).finally(() => setLoading(false));
  }, []);

  return (
    <div style={S.page}>
      <h1 style={S.title}>◆ MY PROJECTS</h1>
      <p style={S.sub}>PROJECT PORTFOLIO · PROGRESS · DELIVERABLES</p>
      {loading ? (
        <div style={{ color: "#4a6a7a", textAlign: "center", padding: 60, fontFamily: "'Orbitron', sans-serif", fontSize: "0.8rem", letterSpacing: 2 }}>LOADING PROJECTS...</div>
      ) : projects.length === 0 ? (
        <div style={{ color: "#1a3a4a", textAlign: "center", padding: 60, fontSize: "0.9rem" }}>No projects found.</div>
      ) : (
        <div style={S.grid}>
          {projects.map(p => (
            <Link key={p.id} href={`/client/projects/${p.id}`} style={S.card}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div style={S.cardTitle}>{p.name}</div>
                  <div style={{ color: "#4a6a7a", fontSize: "0.75rem" }}>{p.code || "—"}</div>
                </div>
                <span style={S.badge(p.status)}>{p.status}</span>
              </div>
              {p.description && <div style={{ color: "#4a6a7a", fontSize: "0.75rem", marginBottom: 10, lineHeight: 1.5 }}>{p.description?.slice(0, 100)}...</div>}
              <div style={{ display: "flex", gap: 16, fontSize: "0.7rem", color: "#4a6a7a", marginBottom: 8 }}>
                {p.startDate && <span>Start: {new Date(p.startDate).toLocaleDateString()}</span>}
                {p.endDate && <span>End: {new Date(p.endDate).toLocaleDateString()}</span>}
              </div>
              <div style={S.progress}><div style={S.progressBar(p.progress || 0)} /></div>
              <div style={{ color: "#4a6a7a", fontSize: "0.65rem", marginTop: 4, textAlign: "right" }}>{p.progress || 0}% complete</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
