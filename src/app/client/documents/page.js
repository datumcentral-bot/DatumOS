"use client";
import { useState, useEffect } from "react";

const STATUS_COLORS = {
  APPROVED:    { bg: "rgba(40,167,69,0.15)",  text: "#28a745" },
  UNDER_REVIEW:{ bg: "rgba(255,177,0,0.15)",  text: "#ffb100" },
  DRAFT:       { bg: "rgba(76,201,240,0.15)", text: "#4cc9f0" },
  SUPERSEDED:  { bg: "rgba(100,100,100,0.15)",text: "#888" },
};

const S = {
  page: { padding: 24, background: "#0a0e14", minHeight: "100vh", fontFamily: "'Rajdhani', sans-serif" },
  title: { fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#4cc9f0", letterSpacing: 2, margin: "0 0 4px" },
  sub: { color: "#4a6a7a", fontSize: "0.75rem", letterSpacing: 1, marginBottom: 20 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { background: "#111820", color: "#4a6a7a", fontSize: "0.65rem", letterSpacing: 1, textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #1a2a3a" },
  td: { padding: "12px 14px", borderBottom: "1px solid #111820", color: "#c8e8f0", fontSize: "0.85rem" },
  badge: (s) => ({ background: STATUS_COLORS[s]?.bg || "#111820", color: STATUS_COLORS[s]?.text || "#4a6a7a", borderRadius: 3, padding: "3px 8px", fontSize: "0.65rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: 1 }),
};

export default function ClientDocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bim/cde").then(r => r.json()).then(d => setDocs(Array.isArray(d) ? d : [])).catch(() => setDocs([])).finally(() => setLoading(false));
  }, []);

  return (
    <div style={S.page}>
      <h1 style={S.title}>◎ DOCUMENTS</h1>
      <p style={S.sub}>CDE DOCUMENTS · SHARED FILES · APPROVALS</p>
      {loading ? (
        <div style={{ color: "#4a6a7a", textAlign: "center", padding: 60, fontFamily: "'Orbitron', sans-serif", fontSize: "0.8rem", letterSpacing: 2 }}>LOADING DOCUMENTS...</div>
      ) : (
        <div style={{ background: "#111820", border: "1px solid #1a2a3a", borderRadius: 6, overflow: "hidden" }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Document Title</th>
                <th style={S.th}>Type</th>
                <th style={S.th}>Revision</th>
                <th style={S.th}>Status</th>
                <th style={S.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {docs.length === 0 ? (
                <tr><td colSpan={5} style={{ ...S.td, textAlign: "center", color: "#1a3a4a", padding: 40 }}>No documents shared yet</td></tr>
              ) : docs.map(d => (
                <tr key={d.id}>
                  <td style={S.td}><div style={{ fontWeight: 600 }}>{d.name || d.title}</div>{d.discipline && <div style={{ color: "#4a6a7a", fontSize: "0.7rem", marginTop: 2 }}>{d.discipline}</div>}</td>
                  <td style={{ ...S.td, color: "#4a6a7a" }}>{d.fileType || d.docType || "—"}</td>
                  <td style={{ ...S.td, color: "#4a6a7a" }}>{d.revision || d.docCode || "—"}</td>
                  <td style={S.td}><span style={S.badge(d.status || d.approvalStatus)}>{d.status || d.approvalStatus}</span></td>
                  <td style={{ ...S.td, color: "#4a6a7a", fontSize: "0.75rem" }}>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}