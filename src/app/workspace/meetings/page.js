"use client";
import { useState, useEffect } from "react";

const STATUS_COLORS = {
  SCHEDULED: { bg: "rgba(107,142,35,0.15)", text: "#6b8e23" },
  COMPLETED: { bg: "rgba(76,201,240,0.15)", text: "#4cc9f0" },
  CANCELLED: { bg: "rgba(255,59,48,0.15)",  text: "#ff3b30" },
};

const S = {
  page: { padding: 24, background: "#0d1108", minHeight: "100vh", fontFamily: "'Rajdhani', sans-serif" },
  title: { fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#a8c060", letterSpacing: 2, margin: "0 0 4px" },
  sub: { color: "#6b7a5a", fontSize: "0.75rem", letterSpacing: 1, marginBottom: 20 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { background: "#1a1f14", color: "#6b7a5a", fontSize: "0.65rem", letterSpacing: 1, textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #2a3020" },
  td: { padding: "12px 14px", borderBottom: "1px solid #1a1f14", color: "#c8d8a0", fontSize: "0.85rem" },
  badge: (s) => ({ background: STATUS_COLORS[s]?.bg || "#1a1f14", color: STATUS_COLORS[s]?.text || "#6b7a5a", borderRadius: 3, padding: "3px 8px", fontSize: "0.65rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: 1 }),
};

export default function WorkspaceMeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bim-meetings").then(r => r.json()).then(d => setMeetings(Array.isArray(d) ? d : [])).catch(() => setMeetings([])).finally(() => setLoading(false));
  }, []);

  return (
    <div style={S.page}>
      <h1 style={S.title}>◐ MEETINGS</h1>
      <p style={S.sub}>BIM COORDINATION MEETINGS · SCHEDULE · AGENDA</p>
      {loading ? (
        <div style={{ color: "#6b7a5a", textAlign: "center", padding: 60, fontFamily: "'Orbitron', sans-serif", fontSize: "0.8rem", letterSpacing: 2 }}>LOADING MEETINGS...</div>
      ) : (
        <div style={{ background: "#1a1f14", border: "1px solid #2a3020", borderRadius: 6, overflow: "hidden" }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Meeting Title</th>
                <th style={S.th}>Type</th>
                <th style={S.th}>Date</th>
                <th style={S.th}>Location</th>
                <th style={S.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {meetings.length === 0 ? (
                <tr><td colSpan={5} style={{ ...S.td, textAlign: "center", color: "#3a4a30", padding: 40 }}>No meetings scheduled</td></tr>
              ) : meetings.map(m => (
                <tr key={m.id}>
                  <td style={S.td}><div style={{ fontWeight: 600 }}>{m.title}</div>{m.agenda && <div style={{ color: "#6b7a5a", fontSize: "0.7rem", marginTop: 2 }}>{m.agenda?.slice(0, 60)}...</div>}</td>
                  <td style={{ ...S.td, color: "#8a9a70" }}>{m.meetingType || "BIM"}</td>
                  <td style={{ ...S.td, color: "#8a9a70", fontSize: "0.75rem" }}>{m.meetingDate ? new Date(m.meetingDate).toLocaleString() : "—"}</td>
                  <td style={{ ...S.td, color: "#6b7a5a", fontSize: "0.75rem" }}>{m.location || "—"}</td>
                  <td style={S.td}><span style={S.badge(m.status)}>{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
