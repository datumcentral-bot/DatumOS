"use client";
import { useState, useEffect } from "react";

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return <div style={{ position:"fixed", bottom:24, right:24, background:"#1a2a1a", border:"1px solid #6b8e23", borderRadius:4, padding:"0.75rem 1.25rem", color:"#a2d033", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem", zIndex:9999 }}>✓ {msg}</div>;
}

const TABS = ["COMPANY", "BIM STANDARDS", "NOTIFICATIONS", "SYSTEM", "USERS"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("COMPANY");
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => { setSettings(d.map || {}); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setToast("Settings saved successfully");
    } catch { setToast("Failed to save settings"); }
    setSaving(false);
  };

  const set = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const S = {
    card: { background:"rgba(13,17,23,0.8)", border:"1px solid rgba(107,142,35,0.2)", borderRadius:4, padding:"1.5rem", marginBottom:"1rem" },
    h2: { fontFamily:"'Orbitron',sans-serif", fontSize:"0.65rem", color:"#6b8e23", letterSpacing:"2px", marginBottom:"1.25rem", textTransform:"uppercase" },
    label: { fontSize:"0.7rem", color:"#4d584d", display:"block", marginBottom:4 },
    input: { width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(107,142,35,0.2)", borderRadius:3, color:"#f0f2f5", padding:"0.5rem 0.75rem", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem", boxSizing:"border-box" },
    btn: (c="#6b8e23") => ({ background:`rgba(107,142,35,0.12)`, border:`1px solid ${c}`, borderRadius:3, color:c, padding:"0.4rem 0.9rem", fontFamily:"'Orbitron',sans-serif", fontSize:"0.55rem", letterSpacing:"1px", cursor:"pointer" }),
    row: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem" },
  };

  const COMPANY_FIELDS = [
    { key:"company_name", label:"Company Name" },
    { key:"company_tagline", label:"Tagline" },
    { key:"company_email", label:"Email" },
    { key:"company_phone", label:"Phone" },
    { key:"company_address", label:"Address" },
    { key:"company_website", label:"Website" },
    { key:"company_currency", label:"Currency" },
    { key:"company_timezone", label:"Timezone" },
  ];

  const BIM_FIELDS = [
    { key:"bim_standard", label:"BIM Standard" },
    { key:"cde_platform", label:"CDE Platform" },
    { key:"default_lod", label:"Default LOD" },
    { key:"clash_tolerance", label:"Clash Tolerance" },
  ];

  const SYSTEM_FIELDS = [
    { key:"kpi_refresh_interval", label:"KPI Refresh Interval (seconds)" },
    { key:"max_file_size_mb", label:"Max File Size (MB)" },
    { key:"session_timeout_min", label:"Session Timeout (minutes)" },
  ];

  return (
    <div style={{ fontFamily:"'Rajdhani',sans-serif", color:"#f0f2f5" }}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
        <div>
          <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.1rem", color:"#fff", letterSpacing:"3px", margin:0 }}>⚙ SYSTEM SETTINGS</h1>
          <p style={{ color:"#4d584d", fontSize:"0.8rem", margin:"0.25rem 0 0" }}>Company profile, BIM standards, and system configuration</p>
        </div>
        <button onClick={save} disabled={saving} style={{ ...S.btn(), background:"rgba(107,142,35,0.2)", opacity: saving ? 0.6 : 1 }}>
          {saving ? "SAVING..." : "💾 SAVE SETTINGS"}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.5rem", borderBottom:"1px solid rgba(107,142,35,0.15)", paddingBottom:"0.75rem" }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...S.btn(activeTab===tab ? "#6b8e23" : "#4d584d"), background: activeTab===tab ? "rgba(107,142,35,0.2)" : "transparent", padding:"0.4rem 0.9rem", fontSize:"0.5rem" }}>{tab}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:"3rem", color:"#4d584d" }}>LOADING SETTINGS...</div>
      ) : (
        <>
          {activeTab === "COMPANY" && (
            <div style={S.card}>
              <p style={S.h2}>🏢 COMPANY PROFILE</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                {COMPANY_FIELDS.map(f => (
                  <div key={f.key}>
                    <label style={S.label}>{f.label.toUpperCase()}</label>
                    <input value={settings[f.key] || ""} onChange={e => set(f.key, e.target.value)} style={S.input} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop:"1.5rem", padding:"1rem", background:"rgba(107,142,35,0.05)", border:"1px solid rgba(107,142,35,0.15)", borderRadius:3 }}>
                <p style={{ ...S.h2, marginBottom:"0.5rem" }}>🎨 BRANDING</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"1rem" }}>
                  {[
                    { label:"Primary Color", value:"#6b8e23" },
                    { label:"Accent Color", value:"#c19749" },
                    { label:"Alert Color", value:"#ff3b30" },
                  ].map(c => (
                    <div key={c.label}>
                      <label style={S.label}>{c.label.toUpperCase()}</label>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <div style={{ width:32, height:32, borderRadius:3, background:c.value, border:"1px solid rgba(255,255,255,0.1)" }} />
                        <input value={c.value} readOnly style={{ ...S.input, flex:1 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "BIM STANDARDS" && (
            <div style={S.card}>
              <p style={S.h2}>🏗️ BIM STANDARDS CONFIGURATION</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                {BIM_FIELDS.map(f => (
                  <div key={f.key}>
                    <label style={S.label}>{f.label.toUpperCase()}</label>
                    <input value={settings[f.key] || ""} onChange={e => set(f.key, e.target.value)} style={S.input} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop:"1.5rem" }}>
                <p style={{ ...S.h2, marginBottom:"0.75rem" }}>📋 ACTIVE STANDARDS</p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.75rem" }}>
                  {["ISO 19650-1","ISO 19650-2","ISO 19650-3","PAS 1192-2","BS EN 17412","Uniclass 2015"].map(std => (
                    <div key={std} style={{ display:"flex", alignItems:"center", gap:8, padding:"0.6rem 0.75rem", background:"rgba(107,142,35,0.08)", border:"1px solid rgba(107,142,35,0.2)", borderRadius:3 }}>
                      <span style={{ color:"#4ade80", fontSize:"0.8rem" }}>✓</span>
                      <span style={{ fontSize:"0.8rem", color:"#f0f2f5" }}>{std}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "NOTIFICATIONS" && (
            <div style={S.card}>
              <p style={S.h2}>🔔 NOTIFICATION PREFERENCES</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                {[
                  { key:"notification_email", label:"Email Notifications", desc:"Send email alerts for critical events" },
                  { key:"notification_overdue", label:"Overdue Alerts", desc:"Alert when invoices or tasks are overdue" },
                  { key:"notification_clash", label:"Clash Alerts", desc:"Notify when new clashes are detected" },
                  { key:"notification_meeting", label:"Meeting Reminders", desc:"30-minute reminder before meetings" },
                  { key:"notification_risk", label:"Risk Escalations", desc:"Alert when risks are escalated to HIGH/CRITICAL" },
                ].map(n => (
                  <div key={n.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0.75rem", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:3 }}>
                    <div>
                      <div style={{ fontSize:"0.85rem", color:"#f0f2f5", fontWeight:600 }}>{n.label}</div>
                      <div style={{ fontSize:"0.7rem", color:"#4d584d", marginTop:2 }}>{n.desc}</div>
                    </div>
                    <button onClick={() => set(n.key, settings[n.key] === "true" ? "false" : "true")} style={{ width:44, height:24, borderRadius:12, background: settings[n.key] === "true" ? "#6b8e23" : "rgba(255,255,255,0.1)", border:"none", cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
                      <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left: settings[n.key] === "true" ? 23 : 3, transition:"left 0.2s" }} />
                    </button>
                  </div>
                ))}
                <div>
                  <label style={S.label}>OVERDUE THRESHOLD (DAYS)</label>
                  <input type="number" value={settings.notification_overdue_days || "7"} onChange={e => set("notification_overdue_days", e.target.value)} style={{ ...S.input, width:120 }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "SYSTEM" && (
            <div style={S.card}>
              <p style={S.h2}>⚙ SYSTEM CONFIGURATION</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                {SYSTEM_FIELDS.map(f => (
                  <div key={f.key}>
                    <label style={S.label}>{f.label.toUpperCase()}</label>
                    <input type="number" value={settings[f.key] || ""} onChange={e => set(f.key, e.target.value)} style={S.input} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop:"1.5rem", padding:"1rem", background:"rgba(255,59,48,0.05)", border:"1px solid rgba(255,59,48,0.15)", borderRadius:3 }}>
                <p style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", color:"#ff3b30", letterSpacing:"2px", marginBottom:"0.75rem" }}>⚠ DANGER ZONE</p>
                <div style={{ display:"flex", gap:"0.75rem" }}>
                  <button style={{ ...S.btn("#ff9500"), fontSize:"0.5rem" }}>CLEAR CACHE</button>
                  <button style={{ ...S.btn("#ff3b30"), fontSize:"0.5rem" }}>RESET DATABASE</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "USERS" && (
            <div style={S.card}>
              <p style={S.h2}>👥 USER MANAGEMENT</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                {[
                  { name:"Director Admin", email:"director@datumbim.com", role:"DIRECTOR", status:"ACTIVE" },
                  { name:"Ahmed Al-Rashid", email:"ahmed@datum-bim.com", role:"MEMBER", status:"ACTIVE" },
                  { name:"Khalid Al-Mansouri", email:"khalid@bagc.ae", role:"CLIENT", status:"ACTIVE" },
                ].map(u => (
                  <div key={u.email} style={{ display:"flex", alignItems:"center", gap:"1rem", padding:"0.75rem", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:3 }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(107,142,35,0.15)", border:"1px solid rgba(107,142,35,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Orbitron',sans-serif", fontSize:"0.7rem", color:"#6b8e23" }}>{u.name.charAt(0)}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"0.85rem", color:"#f0f2f5", fontWeight:600 }}>{u.name}</div>
                      <div style={{ fontSize:"0.7rem", color:"#4d584d" }}>{u.email}</div>
                    </div>
                    <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.45rem", color: u.role==="DIRECTOR" ? "#c19749" : u.role==="MEMBER" ? "#6b8e23" : "#60a5fa", border:`1px solid ${u.role==="DIRECTOR" ? "#c19749" : u.role==="MEMBER" ? "#6b8e23" : "#60a5fa"}`, borderRadius:2, padding:"2px 6px" }}>{u.role}</span>
                    <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.45rem", color:"#4ade80", border:"1px solid #4ade80", borderRadius:2, padding:"2px 6px" }}>{u.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
