"use client";
import { useState, useEffect } from "react";

const S = {
  page: { padding: 24, background: "#0a0e14", minHeight: "100vh", fontFamily: "'Rajdhani', sans-serif" },
  title: { fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#4cc9f0", letterSpacing: 2, margin: "0 0 4px" },
  sub: { color: "#4a6a7a", fontSize: "0.75rem", letterSpacing: 1, marginBottom: 20 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 },
  card: { background: "#111820", border: "1px solid #1a2a3a", borderRadius: 6, padding: 18 },
  cardTitle: { color: "#c8e8f0", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 },
  meta: { color: "#4a6a7a", fontSize: "0.75rem", marginBottom: 4 },
  badge: (s) => ({ background: s === "SCHEDULED" ? "rgba(76,201,240,0.15)" : s === "COMPLETED" ? "rgba(40,167,69,0.15)" : "rgba(255,59,48,0.15)", color: s === "SCHEDULED" ? "#4cc9f0" : s === "COMPLETED" ? "#28a745" : "#ff3b30", borderRadius: 3, padding: "3px 8px", fontSize: "0.65rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: 1 }),
};

export default function ClientMeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bim-meetings").then(r => r.json()).then(d => setMeetings(Array.isArray(d) ? d : [])).catch(() => setMeetings([])).finally(() => setLoading(false));
  }, []);

  return (
    <div style={S.page}>
      <h1 style={S.title}>◐ MEETINGS</h1>
      <p style={S.sub}>SCHEDULED MEETINGS · BIM COORDINATION · AGENDA</p>
      {loading ? (
        <div style={{ color: "#4a6a7a", textAlign: "center", padding: 60, fontFamily: "'Orbitron', sans-serif", fontSize: "0.8rem", letterSpacing: 2 }}>LOADING MEETINGS...</div>
      ) : meetings.length === 0 ? (
        <div style={{ color: "#1a3a4a", textAlign: "center", padding: 60, fontSize: "0.9rem" }}>No meetings scheduled.</div>
      ) : (
        <div style={S.grid}>
          {meetings.map(m => (
            <div key={m.id} style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={S.cardTitle}>{m.title}</div>
                <span style={S.badge(m.status)}>{m.status}</span>
              </div>
              <div style={S.meta}>📅 {m.meetingDate ? new Date(m.meetingDate).toLocaleString() : "TBD"}</div>
              <div style={S.meta}>📍 {m.location || "Online"}</div>
              {m.agenda && <div style={{ color: "#4a6a7a", fontSize: "0.75rem", marginTop: 8, lineHeight: 1.5 }}>{m.agenda?.slice(0, 100)}...</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
