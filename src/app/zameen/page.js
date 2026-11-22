"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const MIL = {
  bg: "#0a0e14",
  panel: "rgba(10,14,20,0.97)",
  border: "rgba(107,142,35,0.3)",
  green: "#6b8e23",
  gold: "#c19749",
  text: "#f0f2f5",
  dim: "#8a9bb0",
  blue: "#4a9eff",
  font: "'Rajdhani', sans-serif",
  head: "'Orbitron', sans-serif",
};

export default function ZameenPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState([]);
  const [workRoutine, setWorkRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(null);

  const fetchData = async () => {
    try {
      const [wrRes, projRes] = await Promise.all([
        fetch("/api/zameen?action=work_routine"),
        fetch("/api/zameen?action=projects"),
      ]);
      const [wrData, projData] = await Promise.all([wrRes.json(), projRes.json()]);
      setWorkRoutine(wrData.workRoutine);
      setProjects(projData.projects || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (projectId, taskId, status, assignee) => {
    setLoading(true);
    try {
      const res = await fetch("/api/zameen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, taskId, status, assignee }),
      });
      const data = await res.json();
      setResponse(data);
      setLoading(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1000px", margin: "0 auto", fontFamily: MIL.font, color: MIL.text }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          paddingBottom: "1rem",
          borderBottom: `1px solid ${MIL.border}`,
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>▧</span>
        <div>
          <h1 style={{ fontFamily: MIL.head, fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            ZAMEEN DEVELOPMENT
          </h1>
          <p style={{ fontSize: "0.7rem", color: MIL.dim, margin: 0 }}>BIM Works - Daily Work Routine & Project Portal</p>
        </div>
      </div>

      {/* Daily Work Routine */}
      {workRoutine && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
            DAILY WORK ROUTINE
          </div>
          <div style={{ background: "rgba(16,20,26,0.8)", border: `1px solid ${MIL.border}`, borderRadius: 4, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
              <thead>
                <tr>
                  <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Time</th>
                  <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Task</th>
                  <th style={{ padding: "0.3rem", textAlign: "center", color: "#94a3b8" }}>Duration</th>
                  <th style={{ padding: "0.3rem", textAlign: "center", color: "#94a3b8" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {workRoutine.tasks.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{t.time}</td>
                    <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{t.name}</td>
                    <td style={{ padding: "0.3rem", textAlign: "center", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{t.duration}</td>
                    <td style={{ padding: "0.3rem", textAlign: "center" }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background:
                            t.status === "COMPLETED" ? MIL.green : t.status === "PENDING" ? MIL.gold : MIL.blue,
                          display: "inline-block",
                          marginRight: "0.5rem",
                        }}
                      />
                      {t.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Projects */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
          PROJECTS
        </div>
        <div style={{ background: "rgba(16,20,26,0.8)", border: `1px solid ${MIL.border}`, borderRadius: 4, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
            <thead>
              <tr>
                <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Project</th>
                <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Type</th>
                <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Status</th>
                <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Location</th>
                <th style={{ padding: "0.3rem", textAlign: "center", color: "#94a3b8" }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{p.name}</td>
                  <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{p.type}</td>
                  <td style={{ padding: "0.3rem", textAlign: "center" }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background:
                          p.status === "Design Development" ? MIL.blue : p.status === "Schematic Design" ? MIL.gold : MIL.green,
                          display: "inline-block",
                          marginRight: "0.5rem",
                        }}
                      />
                        {p.status}
                      </td>
                    <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{p.location}</td>
                    <td style={{ padding: "0.3rem", textAlign: "center", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{p.progress}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>

      {/* Update Task */}
      <div>
        <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
          UPDATE TASK STATUS
        </div>
        <div style={{ background: "rgba(16,20,26,0.6)", border: `1px solid ${MIL.border}`, borderRadius: 4, padding: "1rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: "0.25rem" }}>Project ID</label>
            <input
              type="text"
              placeholder="e.g., zm_proj_001"
              style={{
                width: "100%",
                padding: "0.6rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(107,142,35,0.2)",
                borderRadius: 3,
                color: MIL.text,
                fontFamily: MIL.font,
                fontSize: "0.7rem",
              }}
            />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: "0.25rem" }}>Task ID</label>
            <input
              type="text"
              placeholder="e.g., zw_001"
              style={{
                width: "100%",
                padding: "0.6rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(107,142,35,0.2)",
                borderRadius: 3,
                color: MIL.text,
                fontFamily: MIL.font,
                fontSize: "0.7rem",
              }}
            />
          </div>
          <div style={{ marginBottom: "0.5rem", display: "flex", gap: "0.5rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: "0.25rem" }}>Status</label>
              <select
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(107,142,35,0.2)",
                  borderRadius: 3,
                  color: MIL.text,
                  fontFamily: MIL.font,
                  fontSize: "0.7rem",
                }}
              >
                <option value="PENDING">PENDING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: "0.25rem" }}>Assignee</label>
              <input
                type="text"
                placeholder="e.g., director@datumbim.com"
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(107,142,35,0.2)",
                  borderRadius: 3,
                  color: MIL.text,
                  fontFamily: MIL.font,
                  fontSize: "0.7rem",
                }}
              />
            </div>
          </div>
          <button
            style={{
              padding: "0.6rem 1rem",
              background: MIL.green,
              border: "none",
              borderRadius: 3,
              color: "#fff",
              fontFamily: MIL.head,
              fontSize: "0.7rem",
              fontWeight: 700,
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            UPDATE TASK
          </button>
        </div>
      </div>

      {response && (
        <div
          style={{
            background: "rgba(16,20,26,0.8)",
            border: `1px solid ${MIL.border}`,
            borderRadius: 4,
            padding: "1rem",
            marginTop: "1.5rem",
            fontFamily: MIL.font,
            fontSize: "0.7rem",
            color: MIL.text,
          }}
        >
          <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
            RESPONSE
          </div>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.65rem", lineHeight: 1.5 }}>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
