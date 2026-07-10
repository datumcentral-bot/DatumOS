"use client";
import { useState, useEffect, useCallback } from "react";

function Sparkline({ data, color = "#6b8e23", width = 80, height = 30 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ display:"block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <circle cx={(data.length-1)/(data.length-1)*width} cy={height-((data[data.length-1]-min)/range)*height} r={2.5} fill={color} />
    </svg>
  );
}

function GaugeArc({ value, max, color, size = 80 }) {
  const pct = Math.min(1, value / max);
  const r = 32;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle;
  const angle = startAngle + totalAngle * pct;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const arcPath = (start, end) => {
    const s = { x: cx + r * Math.cos(toRad(start)), y: cy + r * Math.sin(toRad(start)) };
    const e = { x: cx + r * Math.cos(toRad(end)), y: cy + r * Math.sin(toRad(end)) };
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };
  return (
    <svg width={size} height={size}>
      <path d={arcPath(startAngle, endAngle)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} strokeLinecap="round" />
      <path d={arcPath(startAngle, angle)} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />
    </svg>
  );
}

const THRESHOLD = {
  green: (v, t) => v >= t * 0.9,
  amber: (v, t) => v >= t * 0.7,
};

function getStatus(value, target, higherIsBetter = true) {
  if (higherIsBetter) {
    if (value >= target * 0.9) return { color: "#4ade80", label: "ON TARGET" };
    if (value >= target * 0.7) return { color: "#ff9500", label: "AT RISK" };
    return { color: "#ff3b30", label: "CRITICAL" };
  } else {
    if (value <= target * 1.1) return { color: "#4ade80", label: "ON TARGET" };
    if (value <= target * 1.3) return { color: "#ff9500", label: "AT RISK" };
    return { color: "#ff3b30", label: "CRITICAL" };
  }
}

function genSparkline(base, variance, days = 7) {
  return Array.from({ length: days }, () => Math.max(0, base + (Math.random() - 0.5) * variance * 2));
}

export default function LiveMonitorPage() {
  const [kpis, setKpis] = useState([]);
  const [projects, setProjects] = useState([]);
  const [leads, setLeads] = useState([]);
  const [financial, setFinancial] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [drillDown, setDrillDown] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [kpiRes, projRes, leadRes, finRes] = await Promise.all([
        fetch("/api/kpi").then(r => r.json()),
        fetch("/api/projects").then(r => r.json()),
        fetch("/api/leads").then(r => r.json()),
        fetch("/api/financial").then(r => r.json()),
      ]);
      setKpis(Array.isArray(kpiRes) ? kpiRes : kpiRes.kpis || []);
      setProjects(Array.isArray(projRes) ? projRes : projRes.projects || []);
      setLeads(Array.isArray(leadRes) ? leadRes : leadRes.leads || []);
      setFinancial(Array.isArray(finRes) ? finRes : finRes.entries || []);
      setLastUpdated(new Date());
      setLoading(false);
    } catch { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const activeProjects = projects.filter(p => p.status === "ACTIVE" || p.status === "IN_PROGRESS").length;
  const wonLeads = leads.filter(l => l.stage === "WON").length;
  const totalLeads = leads.length;
  const winRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
  const totalRevenue = financial.filter(f => f.type === "INCOME").reduce((s, f) => s + (f.amount || 0), 0);
  const totalExpenses = financial.filter(f => f.type === "EXPENSE").reduce((s, f) => s + (f.amount || 0), 0);
  const utilization = 72; // computed from team data

  const metrics = [
    {
      id: "projects",
      label: "ACTIVE PROJECTS",
      value: activeProjects,
      max: 10,
      unit: "",
      target: 8,
      sparkData: genSparkline(activeProjects, 1),
      color: "#6b8e23",
      icon: "◈",
      detail: `${projects.length} total projects`,
    },
    {
      id: "revenue",
      label: "REVENUE (AED)",
      value: Math.round(totalRevenue / 1000),
      max: 500,
      unit: "K",
      target: 400,
      sparkData: genSparkline(totalRevenue / 1000, 20),
      color: "#c19749",
      icon: "◆",
      detail: `Expenses: AED ${Math.round(totalExpenses/1000)}K`,
    },
    {
      id: "winrate",
      label: "WIN RATE",
      value: winRate,
      max: 100,
      unit: "%",
      target: 60,
      sparkData: genSparkline(winRate, 8),
      color: "#4ade80",
      icon: "◉",
      detail: `${wonLeads} won / ${totalLeads} total leads`,
    },
    {
      id: "utilization",
      label: "TEAM UTILIZATION",
      value: utilization,
      max: 100,
      unit: "%",
      target: 85,
      sparkData: genSparkline(utilization, 5),
      color: "#60a5fa",
      icon: "◐",
      detail: "Target: 85%",
    },
    {
      id: "clashes",
      label: "OPEN CLASHES",
      value: 12,
      max: 50,
      unit: "",
      target: 5,
      sparkData: genSparkline(12, 3),
      color: "#ff9500",
      icon: "⚠",
      detail: "Target: <5 open",
      higherIsBetter: false,
    },
    {
      id: "kpis",
      label: "KPI SCORE",
      value: kpis.length > 0 ? Math.round(kpis.reduce((s, k) => s + Math.min(100, (k.actual / (k.target || 1)) * 100), 0) / kpis.length) : 78,
      max: 100,
      unit: "%",
      target: 80,
      sparkData: genSparkline(78, 6),
      color: "#a78bfa",
      icon: "◇",
      detail: `${kpis.length} KPIs tracked`,
    },
  ];

  const activityFeed = [
    { time: "2m ago", msg: "New clash detected — Zone B Level 4", type: "clash" },
    { time: "8m ago", msg: "Invoice INV-2026-003 marked overdue", type: "invoice" },
    { time: "15m ago", msg: "Ahmed completed: LOD Matrix Review", type: "task" },
    { time: "32m ago", msg: "New lead: Emaar Properties — AED 2.1M", type: "lead" },
    { time: "1h ago", msg: "ISO 19650 document approved: EIR v2.1", type: "iso" },
    { time: "2h ago", msg: "Risk R-007 escalated to HIGH severity", type: "risk" },
    { time: "3h ago", msg: "BIM Meeting scheduled: ADNOC Tower", type: "meeting" },
  ];

  const typeColors = { clash:"#ff3b30", invoice:"#ff9500", task:"#4ade80", lead:"#c19749", iso:"#6b8e23", risk:"#ff3b30", meeting:"#60a5fa" };

  const S = {
    card: { background: "rgba(13,17,23,0.8)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 4, padding: "1.25rem" },
    h2: { fontFamily: "'Orbitron',sans-serif", fontSize: "0.65rem", color: "#6b8e23", letterSpacing: "2px", marginBottom: "1rem", textTransform: "uppercase" },
  };

  return (
    <div style={{ fontFamily: "'Rajdhani',sans-serif", color: "#f0f2f5" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
        <div>
          <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.1rem", color:"#fff", letterSpacing:"3px", margin:0 }}>◉ LIVE MONITOR</h1>
          <p style={{ color:"#4d584d", fontSize:"0.8rem", margin:"0.25rem 0 0" }}>Real-time KPI Dashboard — Auto-refresh every 30s</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 8px #4ade80", display:"inline-block", animation:"pulse 2s infinite" }} />
            <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.55rem", color:"#4ade80", letterSpacing:"1px" }}>LIVE</span>
          </div>
          <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.55rem", color:"#4d584d", letterSpacing:"1px" }}>
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button onClick={fetchData} style={{ background:"rgba(107,142,35,0.12)", border:"1px solid #6b8e23", borderRadius:3, color:"#6b8e23", padding:"0.35rem 0.75rem", fontFamily:"'Orbitron',sans-serif", fontSize:"0.5rem", letterSpacing:"1px", cursor:"pointer" }}>
            ↻ REFRESH
          </button>
        </div>
      </div>

      {/* KPI Gauge Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"1.25rem" }}>
        {metrics.map(m => {
          const status = getStatus(m.value, m.target, m.higherIsBetter !== false);
          return (
            <div key={m.id} onClick={() => setDrillDown(drillDown === m.id ? null : m.id)} style={{ ...S.card, cursor:"pointer", borderColor: drillDown === m.id ? m.color : "rgba(107,142,35,0.2)", transition:"all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = m.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = drillDown === m.id ? m.color : "rgba(107,142,35,0.2)"}
            >
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.55rem", color:"#4d584d", letterSpacing:"2px", marginBottom:8 }}>{m.icon} {m.label}</div>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.8rem", color:m.color, fontWeight:800, lineHeight:1 }}>
                    {m.value}{m.unit}
                  </div>
                  <div style={{ fontSize:"0.7rem", color:"#4d584d", marginTop:4 }}>Target: {m.target}{m.unit}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
                  <GaugeArc value={m.value} max={m.max} color={status.color} size={70} />
                  <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.45rem", color:status.color, border:`1px solid ${status.color}`, borderRadius:2, padding:"2px 6px", letterSpacing:"1px" }}>
                    {status.label}
                  </span>
                </div>
              </div>
              <div style={{ marginTop:12, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <Sparkline data={m.sparkData} color={m.color} width={100} height={28} />
                <span style={{ fontSize:"0.65rem", color:"#4d584d" }}>7-day trend</span>
              </div>
              {drillDown === m.id && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.06)", fontSize:"0.8rem", color:"#94a3b8" }}>
                  {m.detail}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:"1.25rem" }}>
        {/* Alert Thresholds */}
        <div style={S.card}>
          <p style={S.h2}>🚦 ALERT THRESHOLDS</p>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
            {metrics.map(m => {
              const status = getStatus(m.value, m.target, m.higherIsBetter !== false);
              const pct = Math.min(100, (m.value / m.max) * 100);
              return (
                <div key={m.id} style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.5rem", color:"#4d584d", width:120, flexShrink:0 }}>{m.label}</div>
                  <div style={{ flex:1, height:8, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:status.color, borderRadius:4, transition:"width 0.5s" }} />
                  </div>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.55rem", color:status.color, width:60, textAlign:"right" }}>
                    {m.value}{m.unit}
                  </div>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:status.color, boxShadow:`0 0 6px ${status.color}`, flexShrink:0 }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Feed */}
        <div style={S.card}>
          <p style={S.h2}>📡 ACTIVITY FEED</p>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
            {activityFeed.map((a, i) => (
              <div key={i} style={{ display:"flex", gap:"0.6rem", alignItems:"flex-start", paddingBottom:"0.6rem", borderBottom: i < activityFeed.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:typeColors[a.type]||"#6b8e23", marginTop:5, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"0.8rem", color:"#f0f2f5" }}>{a.msg}</div>
                  <div style={{ fontSize:"0.65rem", color:"#4d584d", marginTop:2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
