"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const S = {
  page: { padding: 24, background: "#0a0e14", minHeight: "100vh", fontFamily: "'Rajdhani', sans-serif" },
  back: { color: "#4cc9f0", fontSize: "0.75rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 },
  title: { fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#4cc9f0", letterSpacing: 2, margin: "0 0 4px" },
  sub: { color: "#4a6a7a", fontSize: "0.75rem", letterSpacing: 1, marginBottom: 24 },
  section: { background: "#111820", border: "1px solid #1a2a3a", borderRadius: 6, padding: 20, marginBottom: 20 },
  sectionTitle: { fontFamily: "'Orbitron', sans-serif", fontSize: "0.7rem", color: "#4cc9f0", letterSpacing: 2, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #1a2a3a" },
  row: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #0a0e14", fontSize: "0.85rem" },
  label: { color: "#4a6a7a" },
  value: { color: "#c8e8f0" },
  progress: { background: "#0a0e14", borderRadius: 4, height: 8, overflow: "hidden", marginTop: 8 },
  progressBar: (pct) => ({ background: "#4cc9f0", height: "100%", width: `${Math.min(100, pct || 0)}%`, borderRadius: 4 }),
};

export default function ClientProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(d => setProject(d))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ ...S.page, color: "#4a6a7a", textAlign: "center", paddingTop: 80, fontFamily: "'Orbitron', sans-serif", fontSize: "0.8rem", letterSpacing: 2 }}>LOADING PROJECT...</div>;
  if (!project) return <div style={{ ...S.page, color: "#4a6a7a", textAlign: "center", paddingTop: 80 }}>Project not found.</div>;

  return (
    <div style={S.page}>
      <Link href="/client/projects" style={S.back}>← Back to Projects</Link>
      <h1 style={S.title}>{project.name}</h1>
      <p style={S.sub}>{project.code} · {project.status}</p>

      {/* Overview */}
      <div style={S.section}>
        <div style={S.sectionTitle}>PROJECT OVERVIEW</div>
        <div style={S.row}><span style={S.label}>Status</span><span style={S.value}>{project.status}</span></div>
        <div style={S.row}><span style={S.label}>Start Date</span><span style={S.value}>{project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"}</span></div>
        <div style={S.row}><span style={S.label}>End Date</span><span style={S.value}>{project.endDate ? new Date(project.endDate).toLocaleDateString() : "—"}</span></div>
        <div style={S.row}><span style={S.label}>Progress</span><span style={S.value}>{project.progress || 0}%</span></div>
        <div style={S.progress}><div style={S.progressBar(project.progress || 0)} /></div>
        {project.description && <p style={{ color: "#4a6a7a", fontSize: "0.8rem", marginTop: 12, lineHeight: 1.6 }}>{project.description}</p>}
      </div>

      {/* Milestones */}
      {project.milestones?.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>MILESTONES ({project.milestones.length})</div>
          {project.milestones.map(m => (
            <div key={m.id} style={S.row}>
              <span style={S.label}>{m.title}</span>
              <span style={S.value}>{m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "—"} · {m.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Deliverables */}
      {project.deliverables?.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>DELIVERABLES ({project.deliverables.length})</div>
          {project.deliverables.map(d => (
            <div key={d.id} style={S.row}>
              <span style={S.label}>{d.title}</span>
              <span style={S.value}>{d.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
