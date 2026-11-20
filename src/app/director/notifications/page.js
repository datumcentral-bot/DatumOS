"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const TYPE_ICONS = {
  task_assigned: "⊤",
  invoice_overdue: "◆",
  risk_escalated: "⚠",
  meeting_reminder: "◇",
  clash_new: "✕",
  general: "◉",
};

const TYPE_COLORS = {
  task_assigned: "#6b8e23",
  invoice_overdue: "#ff9500",
  risk_escalated: "#ff3b30",
  meeting_reminder: "#60a5fa",
  clash_new: "#ff3b30",
  general: "#c19749",
};

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return <div style={{ position:"fixed", bottom:24, right:24, background:"#1a2a1a", border:"1px solid #6b8e23", borderRadius:4, padding:"0.75rem 1.25rem", color:"#a2d033", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem", zIndex:9999 }}>✓ {msg}</div>;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [toast, setToast] = useState(null);

  const load = async () => {
    try {
      const r = await fetch("/api/notifications");
      const data = await r.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      setToast("All notifications marked as read");
    } catch {}
  };

  const deleteNotif = async (id) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      setNotifications(prev => prev.filter(n => n.id !== id));
      setToast("Notification dismissed");
    } catch {}
  };

  const filtered = notifications.filter(n => {
    if (filter === "UNREAD") return !n.read;
    if (filter === "READ") return n.read;
    return true;
  });

  const S = {
    card: { background:"rgba(13,17,23,0.8)", border:"1px solid rgba(107,142,35,0.2)", borderRadius:4, padding:"1.25rem" },
    h2: { fontFamily:"'Orbitron',sans-serif", fontSize:"0.65rem", color:"#6b8e23", letterSpacing:"2px", marginBottom:"1rem", textTransform:"uppercase" },
    btn: (c="#6b8e23") => ({ background:`rgba(107,142,35,0.12)`, border:`1px solid ${c}`, borderRadius:3, color:c, padding:"0.4rem 0.9rem", fontFamily:"'Orbitron',sans-serif", fontSize:"0.55rem", letterSpacing:"1px", cursor:"pointer" }),
  };

  return (
    <div style={{ fontFamily:"'Rajdhani',sans-serif", color:"#f0f2f5" }}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
        <div>
          <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.1rem", color:"#fff", letterSpacing:"3px", margin:0 }}>🔔 NOTIFICATIONS CENTER</h1>
          <p style={{ color:"#4d584d", fontSize:"0.8rem", margin:"0.25rem 0 0" }}>System alerts and activity notifications</p>
        </div>
        <div style={{ display:"flex", gap:"0.5rem", alignItems:"center" }}>
          {unreadCount > 0 && (
            <span style={{ background:"#ff3b30", color:"#fff", borderRadius:"50%", width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Orbitron',sans-serif", fontSize:"0.55rem", fontWeight:800 }}>{unreadCount}</span>
          )}
          <button onClick={markAllRead} style={S.btn()}>✓ MARK ALL READ</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.75rem", marginBottom:"1.25rem" }}>
        {[
          { label:"TOTAL", value:notifications.length, color:"#6b8e23" },
          { label:"UNREAD", value:unreadCount, color:"#ff3b30" },
          { label:"CRITICAL", value:notifications.filter(n=>n.type==="risk_escalated"||n.type==="clash_new").length, color:"#ff9500" },
          { label:"TODAY", value:notifications.filter(n=>new Date(n.createdAt).toDateString()===new Date().toDateString()).length, color:"#c19749" },
        ].map(s => (
          <div key={s.label} style={{ ...S.card, textAlign:"center" }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.5rem", color:s.color, fontWeight:800 }}>{s.value}</div>
            <div style={{ fontSize:"0.65rem", color:"#4d584d", letterSpacing:"1px", marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1rem" }}>
        {["ALL","UNREAD","READ"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ ...S.btn(filter===f ? "#6b8e23" : "#4d584d"), padding:"0.3rem 0.7rem", fontSize:"0.5rem" }}>{f}</button>
        ))}
      </div>

      {/* Notification List */}
      <div style={S.card}>
        {loading ? (
          <div style={{ textAlign:"center", padding:"2rem", color:"#4d584d" }}>LOADING...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"2rem", color:"#4d584d", fontSize:"0.85rem" }}>No notifications</div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
            {filtered.map(n => {
              const color = TYPE_COLORS[n.type] || "#6b8e23";
              const icon = TYPE_ICONS[n.type] || "◉";
              return (
                <div key={n.id} onClick={() => !n.read && markRead(n.id)} style={{ display:"flex", alignItems:"flex-start", gap:"1rem", padding:"0.9rem", background: n.read ? "rgba(255,255,255,0.01)" : `${color}08`, border:`1px solid ${n.read ? "rgba(255,255,255,0.04)" : `${color}30`}`, borderRadius:3, cursor: n.read ? "default" : "pointer", transition:"all 0.2s" }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:`${color}15`, border:`1px solid ${color}40`, display:"flex", alignItems:"center", justifyContent:"center", color, fontSize:"0.8rem", flexShrink:0 }}>{icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:4 }}>
                      <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", color: n.read ? "#4d584d" : "#f0f2f5", letterSpacing:"1px", fontWeight: n.read ? 400 : 700 }}>{n.title}</span>
                      {!n.read && <span style={{ width:6, height:6, borderRadius:"50%", background:color, flexShrink:0 }} />}
                    </div>
                    <div style={{ fontSize:"0.8rem", color:"#94a3b8", lineHeight:1.4 }}>{n.message}</div>
                    <div style={{ fontSize:"0.65rem", color:"#4d584d", marginTop:4 }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : "Just now"}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                    {n.link && (
                      <Link href={n.link} style={{ background:"rgba(107,142,35,0.1)", border:"1px solid rgba(107,142,35,0.2)", borderRadius:2, color:"#6b8e23", padding:"3px 8px", fontSize:"0.65rem", textDecoration:"none" }}>→</Link>
                    )}
                    <button onClick={e => { e.stopPropagation(); deleteNotif(n.id); }} style={{ background:"none", border:"1px solid rgba(255,59,48,0.2)", borderRadius:2, color:"#ff3b30", padding:"3px 8px", cursor:"pointer", fontSize:"0.65rem" }}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
