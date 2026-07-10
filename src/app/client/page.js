"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const HEALTH_COLORS = { GREEN: "#28a745", AMBER: "#ffb100", RED: "#ff3b30" };
const STATUS_COLORS = {
  ACTIVE:   { bg: "rgba(107,142,35,0.15)", text: "#6b8e23" },
  COMPLETE: { bg: "rgba(76,201,240,0.15)", text: "#4cc9f0" },
  ON_HOLD:  { bg: "rgba(255,177,0,0.15)",  text: "#ffb100" },
};

export default function ClientDashboard() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.json())
      .then(d => {
        const arr = Array.isArray(d) ? d : Array.isArray(d?.projects) ? d.projects : [];
        setProjects(arr);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeProjects = projects.filter(p => p.status === "ACTIVE");
  const completedProjects = projects.filter(p => p.status === "COMPLETE");
  const totalMilestones = projects.reduce((s, p) => s + (p.milestones?.length || 0), 0);
  const completedMilestones = projects.reduce((s, p) => s + (p.milestones?.filter(m => m.status === "COMPLETE").length || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1rem", borderBottom: "1px solid rgba(76,201,240,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 40, height: 40, borderRadius: 4, background: "rgba(76,201,240,0.12)", border: "1px solid rgba(76,201,240,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", color: "#4cc9f0" }}>⬡</div>
          <div>
            <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "#fff", letterSpacing: "2px", textTransform: "uppercase" }}>Client Dashboard</h1>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>Welcome, {session?.user?.name || "Client"} — Project Overview</p>
          </div>
        </div>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", color: "#4cc9f0", letterSpacing: "1px", background: "rgba(76,201,240,0.1)", border: "1px solid rgba(76,201,240,0.2)", padding: "0.4rem 0.8rem", borderRadius: 2 }}>
          ISO 19650 COMPLIANT
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {[
          { label: "YOUR PROJECTS", value: projects.length, color: "#4cc9f0" },
          { label: "ACTIVE", value: activeProjects.length, color: "#6b8e23" },
          { label: "MILESTONES", value: totalMilestones, color: "#c19749" },
          { label: "COMPLETED", value: completedMilestones, color: "#28a745" },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(76,201,240,0.1)", borderRadius: 4, padding: "1rem", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: `1px solid ${s.color}`, borderLeft: `1px solid ${s.color}`, opacity: 0.6 }} />
            <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.5rem", color: "#94a3b8", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.4rem", fontWeight: 700, color: s.color }}>{loading ? "—" : s.value}</p>
          </div>
        ))}
      </div>

      {/* Projects */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", fontFamily: "'Orbitron', sans-serif", fontSize: "0.7rem", letterSpacing: "2px" }}>LOADING YOUR PROJECTS...</div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#4d584d", fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", letterSpacing: "2px" }}>NO PROJECTS ASSIGNED</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
          {projects.map(p => {
            const hc = HEALTH_COLORS[p.health] || HEALTH_COLORS.AMBER;
            const sc = STATUS_COLORS[p.status] || STATUS_COLORS.ACTIVE;
            const milestones = p.milestones || [];
            const completedMs = milestones.filter(m => m.status === "COMPLETE").length;
            return (
              <div key={p.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid rgba(76,201,240,0.12)`, borderTop: `2px solid ${hc}`, borderRadius: 4, padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", color: "#4cc9f0", letterSpacing: "1px" }}>{p.code}</span>
                      <span style={{ fontSize: "0.6rem", fontFamily: "'Orbitron', sans-serif", padding: "0.15rem 0.4rem", borderRadius: 2, background: sc.bg, color: sc.text }}>{p.status}</span>
                    </div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#f0f2f5" }}>{p.name}</h3>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: hc, boxShadow: `0 0 6px ${hc}` }} />
                    <span style={{ fontSize: "0.6rem", color: hc, fontFamily: "'Orbitron', sans-serif" }}>{p.health}</span>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: "0.65rem", color: "#94a3b8", fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px" }}>PROGRESS</span>
                    <span style={{ fontSize: "0.65rem", color: "#6b8e23", fontFamily: "'Orbitron', sans-serif" }}>{p.progress || 0}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${p.progress || 0}%`, height: "100%", background: "#6b8e23", borderRadius: 3, transition: "width 0.4s ease" }} />
                  </div>
                </div>

                {/* Milestones */}
                {milestones.length > 0 && (
                  <div>
                    <p style={{ fontSize: "0.6rem", color: "#94a3b8", fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px", marginBottom: 6 }}>MILESTONES ({completedMs}/{milestones.length})</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {milestones.slice(0, 4).map(m => (
                        <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.status === "COMPLETE" ? "#28a745" : m.status === "IN_PROGRESS" ? "#ffb100" : "rgba(255,255,255,0.1)", border: m.status !== "COMPLETE" ? "1px solid rgba(255,255,255,0.2)" : "none", flexShrink: 0 }} />
                          <span style={{ fontSize: "0.75rem", color: m.status === "COMPLETE" ? "#94a3b8" : "#f0f2f5", textDecoration: m.status === "COMPLETE" ? "line-through" : "none" }}>{m.title}</span>
                          {m.dueDate && <span style={{ fontSize: "0.6rem", color: "#94a3b8", marginLeft: "auto" }}>{new Date(m.dueDate).toLocaleDateString()}</span>}
                        </div>
                      ))}
                      {milestones.length > 4 && <p style={{ fontSize: "0.65rem", color: "#94a3b8" }}>+{milestones.length - 4} more milestones</p>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
