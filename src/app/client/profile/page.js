"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const S = {
  page: { padding: 24, background: "#0a0e14", minHeight: "100vh", fontFamily: "'Rajdhani', sans-serif" },
  title: { fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#4cc9f0", letterSpacing: 2, margin: "0 0 4px" },
  sub: { color: "#4a6a7a", fontSize: "0.75rem", letterSpacing: 1, marginBottom: 24 },
  card: { background: "#111820", border: "1px solid #1a2a3a", borderRadius: 6, padding: 28, maxWidth: 560 },
  avatar: { width: 80, height: 80, borderRadius: "50%", background: "#1a4a6a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "#4cc9f0", marginBottom: 20, border: "2px solid #2a6a8a" },
  roleTag: { background: "rgba(76,201,240,0.15)", color: "#4cc9f0", borderRadius: 3, padding: "4px 10px", fontSize: "0.65rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: 1, display: "inline-block", marginBottom: 16 },
  field: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 },
  label: { color: "#4a6a7a", fontSize: "0.65rem", letterSpacing: 1, textTransform: "uppercase" },
  input: { background: "#0a0e14", border: "1px solid #1a2a3a", borderRadius: 4, padding: "8px 10px", color: "#c8e8f0", fontSize: "0.85rem", outline: "none" },
  btn: { background: "#1a4a6a", color: "#4cc9f0", border: "1px solid #2a6a8a", borderRadius: 4, padding: "10px 24px", cursor: "pointer", fontFamily: "'Orbitron', sans-serif", fontSize: "0.7rem", letterSpacing: 1, marginTop: 8 },
};

export default function ClientProfilePage() {
  const { data: session } = useSession();
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", country: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (session?.user) setForm(p => ({ ...p, name: session.user.name || "", email: session.user.email || "" }));
  }, [session]);

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = form.name ? form.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";

  return (
    <div style={S.page}>
      <h1 style={S.title}>◑ MY PROFILE</h1>
      <p style={S.sub}>COMPANY INFORMATION · CONTACT DETAILS</p>
      <div style={S.card}>
        <div style={S.avatar}>{initials}</div>
        <div style={S.roleTag}>CLIENT</div>
        <form onSubmit={handleSave}>
          <div style={S.field}><label style={S.label}>Full Name</label><input style={S.input} value={form.name} onChange={f("name")} placeholder="Khalid Al-Rashid" /></div>
          <div style={S.field}><label style={S.label}>Email</label><input style={S.input} value={form.email} onChange={f("email")} disabled /></div>
          <div style={S.field}><label style={S.label}>Company</label><input style={S.input} value={form.company} onChange={f("company")} placeholder="BAGC Engineering" /></div>
          <div style={S.field}><label style={S.label}>Phone</label><input style={S.input} value={form.phone} onChange={f("phone")} placeholder="+971 50 123 4567" /></div>
          <div style={S.field}><label style={S.label}>Country</label><input style={S.input} value={form.country} onChange={f("country")} placeholder="UAE" /></div>
          <button type="submit" style={S.btn} disabled={saving}>{saving ? "SAVING..." : saved ? "✓ SAVED" : "SAVE PROFILE"}</button>
        </form>
      </div>
    </div>
  );
}
