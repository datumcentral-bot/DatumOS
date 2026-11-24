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

export default function RevitSchedulesPage() {
  const { data: session } = useSession();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/revit/schedules");
      const data = await res.json();
      setSchedules(data.schedules || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportSchedules = async (scheduleIds) => {
    setLoading(true);
    try {
      const res = await fetch("/api/revit/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleIds, format: "csv" }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div style={{ padding: "1.5rem", maxWidth: "900px", margin: "0 auto", fontFamily: MIL.font, color: MIL.text }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          paddingBottom: "1rem",
          borderBottom: `1px solid ${MIL.border}`,
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>≣</span>
        <div>
          <h1 style={{ fontFamily: MIL.head, fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            REVIT SCHEDULES EXPORT
          </h1>
          <p style={{ fontSize: "0.7rem", color: MIL.dim, margin: 0 }}>Export Revit schedules to CSV/Excel</p>
        </div>
      </div>

      {/* Schedules List */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
          AVAILABLE SCHEDULES
        </div>
        <div style={{ background: "rgba(16,20,26,0.8)", border: `1px solid ${MIL.border}`, borderRadius: 4, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "1rem", color: MIL.green, fontFamily: MIL.head, fontSize: "0.7rem" }}>
              Loading schedules...
            </div>
          ) : schedules.length === 0 ? (
            <div style={{ padding: "1rem", color: MIL.dim, fontFamily: MIL.font, fontSize: "0.7rem" }}>
              No schedules found
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
              <thead>
                <tr>
                  <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Name</th>
                  <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Type</th>
                  <th style={{ padding: "0.3rem", textAlign: "center", color: "#94a3b8" }}>Elements</th>
                  <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Last Modified</th>
                  <th style={{ padding: "0.3rem", textAlign: "center", color: "#94a3b8" }}>Export</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{s.name}</td>
                    <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{s.type}</td>
                    <td style={{ padding: "0.3rem", textAlign: "center", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{s.elementCount}</td>
                    <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.65rem" }}>{new Date(s.lastModified).toLocaleDateString()}</td>
                    <td style={{ padding: "0.3rem", textAlign: "center" }}>
                      <button
                        onClick={() => exportSchedules([s.id])}
                        style={{
                          padding: "0.2rem 0.4rem",
                          background: "rgba(107,142,35,0.1)",
                          border: "1px solid rgba(107,142,35,0.3)",
                          borderRadius: 2,
                          color: MIL.green,
                          fontFamily: MIL.head,
                          fontSize: "0.6rem",
                          cursor: "pointer",
                        }}
                      >
                        EXPORT
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Export Multiple */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
          EXPORT MULTIPLE SCHEDULES
        </div>
        <div style={{ background: "rgba(16,20,26,0.6)", border: `1px solid ${MIL.border}`, borderRadius: 4, padding: "1rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <span style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem" }}>Select Schedules:</span>
            <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {schedules.map((s) => (
                <label key={s.id} style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginRight: "0.8rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    name="schedule"
                    value={s.id}
                    style={{ accentColor: MIL.green }}
                  />
                  <span style={{ fontSize: "0.65rem", color: MIL.text, fontFamily: MIL.font }}>{s.name}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              const selected = Array.from(document.querySelectorAll('input[name="schedule"]:checked')).map((el) => el.value);
              if (selected.length === 0) {
                alert("Please select at least one schedule");
                return;
              }
              exportSchedules(selected);
            }}
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
            EXPORT SELECTED
          </button>
        </div>
      </div>

      {/* Response */}
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
            EXPORT RESULT
          </div>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.65rem", lineHeight: 1.5 }}>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
