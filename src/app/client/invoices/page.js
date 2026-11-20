"use client";
import { useState, useEffect } from "react";

const STATUS_COLORS = {
  DRAFT:    { bg: "rgba(76,201,240,0.15)", text: "#4cc9f0" },
  SENT:     { bg: "rgba(255,177,0,0.15)",  text: "#ffb100" },
  PAID:     { bg: "rgba(40,167,69,0.15)",  text: "#28a745" },
  OVERDUE:  { bg: "rgba(255,59,48,0.15)",  text: "#ff3b30" },
  CANCELLED:{ bg: "rgba(100,100,100,0.15)",text: "#888" },
};

const S = {
  page: { padding: 24, background: "#0a0e14", minHeight: "100vh", fontFamily: "'Rajdhani', sans-serif" },
  title: { fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#4cc9f0", letterSpacing: 2, margin: "0 0 4px" },
  sub: { color: "#4a6a7a", fontSize: "0.75rem", letterSpacing: 1, marginBottom: 20 },
  stats: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 },
  stat: { background: "#111820", border: "1px solid #1a2a3a", borderRadius: 6, padding: "14px 16px" },
  statVal: { fontFamily: "'Orbitron', sans-serif", fontSize: "1.2rem", color: "#4cc9f0", margin: 0 },
  statLbl: { color: "#4a6a7a", fontSize: "0.65rem", letterSpacing: 1, textTransform: "uppercase", marginTop: 4 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { background: "#111820", color: "#4a6a7a", fontSize: "0.65rem", letterSpacing: 1, textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #1a2a3a" },
  td: { padding: "12px 14px", borderBottom: "1px solid #111820", color: "#c8e8f0", fontSize: "0.85rem" },
  badge: (s) => ({ background: STATUS_COLORS[s]?.bg || "#111820", color: STATUS_COLORS[s]?.text || "#4a6a7a", borderRadius: 3, padding: "3px 8px", fontSize: "0.65rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: 1 }),
};

function fmt(n) { return "AED " + Number(n || 0).toLocaleString(); }

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/invoices").then(r => r.json()).then(d => setInvoices(Array.isArray(d) ? d : [])).catch(() => setInvoices([])).finally(() => setLoading(false));
  }, []);

  const total = invoices.reduce((s, i) => s + (i.amount || 0), 0);
  const paid = invoices.filter(i => i.status === "PAID").reduce((s, i) => s + (i.amount || 0), 0);
  const pending = invoices.filter(i => i.status === "SENT").reduce((s, i) => s + (i.amount || 0), 0);
  const overdue = invoices.filter(i => i.status === "OVERDUE").length;

  return (
    <div style={S.page}>
      <h1 style={S.title}>◇ INVOICES</h1>
      <p style={S.sub}>BILLING · PAYMENT STATUS · FINANCIAL OVERVIEW</p>
      <div style={S.stats}>
        <div style={S.stat}><p style={S.statVal}>{invoices.length}</p><p style={S.statLbl}>Total Invoices</p></div>
        <div style={S.stat}><p style={{ ...S.statVal, fontSize: "0.9rem" }}>{fmt(total)}</p><p style={S.statLbl}>Total Value</p></div>
        <div style={S.stat}><p style={{ ...S.statVal, fontSize: "0.9rem", color: "#28a745" }}>{fmt(paid)}</p><p style={S.statLbl}>Paid</p></div>
        <div style={S.stat}><p style={{ ...S.statVal, color: overdue > 0 ? "#ff3b30" : "#4cc9f0" }}>{overdue}</p><p style={S.statLbl}>Overdue</p></div>
      </div>
      {loading ? (
        <div style={{ color: "#4a6a7a", textAlign: "center", padding: 60, fontFamily: "'Orbitron', sans-serif", fontSize: "0.8rem", letterSpacing: 2 }}>LOADING INVOICES...</div>
      ) : (
        <div style={{ background: "#111820", border: "1px solid #1a2a3a", borderRadius: 6, overflow: "hidden" }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Invoice #</th>
                <th style={S.th}>Description</th>
                <th style={S.th}>Amount</th>
                <th style={S.th}>Due Date</th>
                <th style={S.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan={5} style={{ ...S.td, textAlign: "center", color: "#1a3a4a", padding: 40 }}>No invoices found</td></tr>
              ) : invoices.map(inv => (
                <tr key={inv.id}>
                  <td style={S.td}><div style={{ fontWeight: 600, fontFamily: "'Orbitron', sans-serif", fontSize: "0.75rem" }}>{inv.invoiceNo}</div></td>
                  <td style={{ ...S.td, color: "#4a6a7a" }}>{inv.description || inv.notes || "—"}</td>
                  <td style={{ ...S.td, fontWeight: 600 }}>{fmt(inv.amount)}</td>
                  <td style={{ ...S.td, color: "#4a6a7a", fontSize: "0.75rem" }}>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</td>
                  <td style={S.td}><span style={S.badge(inv.status)}>{inv.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
