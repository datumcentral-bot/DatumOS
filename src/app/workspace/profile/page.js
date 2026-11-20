"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const S = {
  page: { padding: 24, background: "#0d1108", minHeight: "100vh", fontFamily: "'Rajdhani', sans-serif" },
  title: { fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#a8c060", letterSpacing: 2, margin: "0 0 4px" },
  sub: { color: "#6b7a5a", fontSize: "0.75rem", letterSpacing: 1, marginBottom: 24 },
  card: { background: "#1a1f14", border: "1px solid #2a3020", borderRadius: 6, padding: 28, maxWidth: 560 },
  avatar: { width: 80, height: 80, borderRadius: "50%", background: "#4a6741", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "#d4e8a0", marginBottom: 20, border: "2px solid #5a7a50" },
  field: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 },
  label: { color: "#8a9a70", fontSize: "0.65rem", letterSpacing: 1, textTransform: "uppercase" },
  input: { background: "#0d1108", border: "1px solid #3a4a30", borderRadius: 4, padding: "8px 10px", color: "#c8d8a0", fontSize: "0.85rem", outline: "none" },
  btn: { background: "#4a6741", color: "#d4e8a0", border: "1px solid #5a7a50", borderRadius: 4, padding: "10px 24px", cursor: "pointer", fontFamily: "'Orbitron', sans-serif", fontSize: "0.7rem", letterSpacing: 1, marginTop: 8 },
  roleTag: { background: "rgba(107,142,35,0.15)", color: "#6b8e23", borderRadius: 3, padding: "4px 10px", fontSize: "0.65rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: 1, display: "inline-block", marginBottom: 16 },
};

export default function WorkspaceProfilePage() {
  const { data: session } = useSession();
  const [form, setForm] = useState({ name: "", email: "", title: "", division: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setForm(prev => ({ ...prev, name: session.user.name || "", email: session.user.email || "" }));
    }
  }, [session]);

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    await new Promise(r => setTimeout(r, 800)); // Simulate save
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = form.name ? form.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";

  return (
    <div style={S.page}>
      <h1 style={S.title}>◑ MY PROFILE</h1>
      <p style={S.sub}>PERSONAL INFORMATION · CONTACT DETAILS · PREFERENCES</p>
      <div style={S.card}>
        <div style={S.avatar}>{initials}</div>
        <div style={S.roleTag}>{session?.user?.role || "MEMBER"}</div>
        <form onSubmit={handleSave}>
          <div style={S.field}><label style={S.label}>Full Name</label><input style={S.input} value={form.name} onChange={f("name")} placeholder="Ahmed Al-Rashid" /></div>
          <div style={S.field}><label style={S.label}>Email</label><input style={S.input} value={form.email} onChange={f("email")} placeholder="ahmed@datum-bim.com" disabled /></div>
          <div style={S.field}><label style={S.label}>Job Title</label><input style={S.input} value={form.title} onChange={f("title")} placeholder="BIM Coordinator" /></div>
          <div style={S.field}><label style={S.label}>Division</label><input style={S.input} value={form.division} onChange={f("division")} placeholder="BIM Operations" /></div>
          <div style={S.field}><label style={S.label}>Phone</label><input style={S.input} value={form.phone} onChange={f("phone")} placeholder="+971 50 123 4567" /></div>
          <button type="submit" style={S.btn} disabled={saving}>{saving ? "SAVING..." : saved ? "✓ SAVED" : "SAVE PROFILE"}</button>
        </form>
      </div>
    </div>
  );
}
