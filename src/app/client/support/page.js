"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

const TYPES = ["Change Request", "Technical Issue", "Document Query", "Invoice Query", "General Enquiry"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const S = {
  page: { padding: 24, background: "#0a0e14", minHeight: "100vh", fontFamily: "'Rajdhani', sans-serif" },
  title: { fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#4cc9f0", letterSpacing: 2, margin: "0 0 4px" },
  sub: { color: "#4a6a7a", fontSize: "0.75rem", letterSpacing: 1, marginBottom: 24 },
  card: { background: "#111820", border: "1px solid #1a2a3a", borderRadius: 6, padding: 28, maxWidth: 600 },
  sectionTitle: { fontFamily: "'Orbitron', sans-serif", fontSize: "0.7rem", color: "#4cc9f0", letterSpacing: 2, marginBottom: 20 },
  field: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 },
  label: { color: "#4a6a7a", fontSize: "0.65rem", letterSpacing: 1, textTransform: "uppercase" },
  input: { background: "#0a0e14", border: "1px solid #1a2a3a", borderRadius: 4, padding: "8px 10px", color: "#c8e8f0", fontSize: "0.85rem", outline: "none" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 0 },
  btn: { background: "#1a4a6a", color: "#4cc9f0", border: "1px solid #2a6a8a", borderRadius: 4, padding: "10px 24px", cursor: "pointer", fontFamily: "'Orbitron', sans-serif", fontSize: "0.7rem", letterSpacing: 1, marginTop: 8 },
  success: { background: "rgba(40,167,69,0.1)", border: "1px solid rgba(40,167,69,0.3)", borderRadius: 6, padding: 20, color: "#28a745", textAlign: "center", marginTop: 20 },
};

export default function ClientSupportPage() {
  const { data: session } = useSession();
  const [form, setForm] = useState({ type: "General Enquiry", priority: "MEDIUM", subject: "", description: "" });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false); setSubmitted(true);
  };

  return (
    <div style={S.page}>
      <h1 style={S.title}>◈ SUPPORT</h1>
      <p style={S.sub}>CHANGE REQUESTS · TECHNICAL ISSUES · ENQUIRIES</p>
      <div style={S.card}>
        <div style={S.sectionTitle}>SUBMIT A REQUEST</div>
        {submitted ? (
          <div style={S.success}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>✓</div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.8rem", letterSpacing: 1, marginBottom: 8 }}>REQUEST SUBMITTED</div>
            <div style={{ fontSize: "0.85rem" }}>Your request has been received. Our team will respond within 24 hours.</div>
            <button style={{ ...S.btn, marginTop: 16 }} onClick={() => { setSubmitted(false); setForm({ type: "General Enquiry", priority: "MEDIUM", subject: "", description: "" }); }}>SUBMIT ANOTHER</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={S.row}>
              <div style={S.field}><label style={S.label}>Request Type</label><select style={S.input} value={form.type} onChange={f("type")}>{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div style={S.field}><label style={S.label}>Priority</label><select style={S.input} value={form.priority} onChange={f("priority")}>{PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            </div>
            <div style={S.field}><label style={S.label}>Subject *</label><input style={S.input} value={form.subject} onChange={f("subject")} placeholder="Brief description of your request" required /></div>
            <div style={S.field}><label style={S.label}>Description *</label><textarea style={{ ...S.input, minHeight: 120, resize: "vertical" }} value={form.description} onChange={f("description")} placeholder="Please provide as much detail as possible..." required /></div>
            <button type="submit" style={S.btn} disabled={saving}>{saving ? "SUBMITTING..." : "SUBMIT REQUEST"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
