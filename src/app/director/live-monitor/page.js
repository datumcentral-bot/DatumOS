"use client";
import { useState, useEffect, useCallback } from "react";
import { useSocketContext } from "@/lib/SocketContext";

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
  if (value == null || isNaN(value)) return { color: "#4d584d", label: "NO DATA" };
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

// Map a Prisma entity name to an activity-feed colour key.
function entityToType(entity) {
  const e = (entity || "").toLowerCase();
  if (e.includes("clash")) return "clash";
  if (e.includes("invoice") || e.includes("expense") || e.includes("financial")) return "invoice";
  if (e.includes("lead") || e.includes("client")) return "lead";
  if (e.includes("iso") || e.includes("sop") || e.includes("document") || e.includes("cde") || e.includes("deliverable")) return "iso";
  if (e.includes("risk")) return "risk";
  if (e.includes("meeting")) return "meeting";
  return "task";
}

export default function LiveMonitorPage() {
  const [kpis, setKpis] = useState([]);
  const [projects, setProjects] = useState([]);
  const [leads, setLeads] = useState([]);
  const [financial, setFinancial] = useState([]);
  const [dcortex, setDcortex] = useState({ nodes: null, agents: null, revit: null, health: null });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState([]);
  const [clashes, setClashes] = useState([]);
  const [workload, setWorkload] = useState(null);
  const [drillDown, setDrillDown] = useState(null);
  const { socket, isConnected, joinModule } = useSocketContext();

  // DN021: subscribe to the embedded Socket.IO monitor feed — gateway /
  // ecosystem / revit / bridge health pushed from server.js every 15s.
  const [pushFeed, setPushFeed] = useState(null);

  useEffect(() => {
    if (!socket) return;
    joinModule("live-monitor", { name: "Director" });
    const onHealth = (feeds) => { setPushFeed(feeds); setLastUpdated(new Date()); };
    socket.on("monitor_health", onHealth);
    return () => { socket.off("monitor_health", onHealth); };
  }, [socket, joinModule]);

  const fetchData = useCallback(async () => {
    try {
      const [kpiRes, projRes, leadRes, finRes, nodeRes, agentRes, revitRes, healthRes, actRes, clashRes, wlRes] = await Promise.allSettled([
        fetch("/api/kpi").then(r => r.json()),
        fetch("/api/projects").then(r => r.json()),
        fetch("/api/leads").then(r => r.json()),
        fetch("/api/financial").then(r => r.json()),
        fetch("/api/dcortex-proxy/nodes").then(r => r.json()),
        fetch("/api/dcortex-proxy/ai/agents").then(r => r.json()),
        fetch("/api/dcortex-proxy/revit/health").then(r => r.json()),
        fetch("/api/dcortex-proxy/health").then(r => r.json()),
        fetch("/api/activity-log").then(r => r.json()),
        fetch("/api/bim/clash").then(r => r.json()),
        fetch("/api/workload").then(r => r.json()),
      ]);
      if (kpiRes.status === "fulfilled") setKpis(Array.isArray(kpiRes.value) ? kpiRes.value : kpiRes.value.kpis || []);
      if (projRes.status === "fulfilled") setProjects(Array.isArray(projRes.value) ? projRes.value : projRes.value.projects || []);
      if (leadRes.status === "fulfilled") setLeads(Array.isArray(leadRes.value) ? leadRes.value : leadRes.value.leads || []);
      if (finRes.status === "fulfilled") setFinancial(Array.isArray(finRes.value) ? finRes.value : finRes.value.entries || []);
      if (actRes.status === "fulfilled" && Array.isArray(actRes.value)) setActivityLogs(actRes.value);
      if (clashRes.status === "fulfilled" && Array.isArray(clashRes.value)) setClashes(clashRes.value);
      if (wlRes.status === "fulfilled" && wlRes.value && !wlRes.value.error) setWorkload(wlRes.value);
      const dcortexData = {};
      if (nodeRes.status === "fulfilled" && Array.isArray(nodeRes.value)) dcortexData.nodes = nodeRes.value;
      if (agentRes.status === "fulfilled" && Array.isArray(agentRes.value)) dcortexData.agents = agentRes.value;
      if (revitRes.status === "fulfilled") dcortexData.revit = revitRes.value;
      if (healthRes.status === "fulfilled") dcortexData.health = healthRes.value;
      setDcortex(dcortexData);
      setLastUpdated(new Date());
      setLoading(false);
    } catch { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // DN021: merge pushed monitor feed into the dcortex state so the gauge
  // grid + status pill reflect Socket.IO push (revit state, gateway health).
  useEffect(() => {
    if (!pushFeed) return;
    setDcortex((prev) => {
      const next = { ...prev };
      if (pushFeed.revit && pushFeed.revit.state) next.revit = pushFeed.revit;
      if (pushFeed.gateway && pushFeed.gateway.status) next.health = pushFeed.gateway;
      return next;
    });
  }, [pushFeed]);

  // DN021: show a subtle live badge when Socket.IO feed is flowing
  const pushActive = isConnected && !!pushFeed;

  const activeProjects = projects.filter(p => p.status === "ACTIVE" || p.status === "IN_PROGRESS").length;
  const wonLeads = leads.filter(l => l.stage === "WON").length;
  const totalLeads = leads.length;
  const winRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
  const totalRevenue = financial.filter(f => f.type === "INCOME").reduce((s, f) => s + (f.amount || 0), 0);
  const totalExpenses = financial.filter(f => f.type === "EXPENSE").reduce((s, f) => s + (f.amount || 0), 0);
  const dcortexAvailable = !!dcortex.health?.status;
  const revitAlive = dcortex.revit?.state === "ALIVE";
  const revitOnline = dcortex.revit?.status === "ONLINE";
  // Nodes / agents come straight from the DCORTEX gateway. When it is offline
  // (serverless deployments) we report "—" rather than inventing node counts.
  const liveNodes = dcortexAvailable ? (dcortex.nodes || []) : [];
  const onlineNodes = dcortexAvailable ? liveNodes.filter((n) => n.status === "ONLINE").length : null;
  const totalNodes = dcortexAvailable ? liveNodes.length : null;
  const liveAgents = dcortexAvailable ? (dcortex.agents || []) : [];
  const readyAgents = dcortexAvailable ? liveAgents.filter((a) => a.status === "READY").length : null;
  const activeAgents = dcortexAvailable ? liveAgents.length : null;
  // Clash counts come from the DCORTEX clash engine. When the gateway is
  // offline there is no honest count, so we show "—" instead of a fake number.
  const openClashes = clashes.length > 0
    ? clashes.filter((c) => c.status !== "RESOLVED").length
    : null;
  // Utilization = allocated hours / total team capacity, from real workload records.
  const wlUsers = workload?.users || [];
  const wlAllocs = workload?.allocations || [];
  const capacityHrs = wlUsers.reduce((s, u) => s + (Number(u.capacityHrs) || 0), 0);
  const allocatedHrs = wlAllocs.reduce((s, a) => s + (Number(a.allocatedHrs) || Number(a.hours) || 0), 0);
  const utilization = capacityHrs > 0 && wlAllocs.length > 0
    ? Math.min(100, Math.round((allocatedHrs / capacityHrs) * 100))
    : null;

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
      sparkData: [],
      color: "#60a5fa",
      icon: "◐",
      detail: utilization != null ? "Target: 85%" : "No allocation data",
    },
    {
      id: "clashes",
      label: "OPEN CLASHES",
      value: openClashes,
      max: 50,
      unit: "",
      target: 5,
      sparkData: [],
      color: "#ff9500",
      icon: "⚠",
      detail: openClashes != null ? "Target: <5 open" : "Clash engine offline",
      higherIsBetter: false,
    },
    {
      id: "kpis",
      label: "KPI SCORE",
      value: kpis.length > 0 ? Math.round(kpis.reduce((s, k) => s + Math.min(100, (k.actual / (k.target || 1)) * 100), 0) / kpis.length) : null,
      max: 100,
      unit: "%",
      target: 80,
      sparkData: [],
      color: "#a78bfa",
      icon: "◇",
      detail: kpis.length > 0 ? `${kpis.length} KPIs tracked` : "No KPIs configured",
    },
    {
      id: "nodes",
      label: "DCORTEX NODES",
      value: onlineNodes,
      max: totalNodes > 0 ? totalNodes : 30,
      unit: "",
      target: totalNodes > 0 ? totalNodes : 2,
      sparkData: [],
      color: "#60a5fa",
      icon: "◈",
      detail: onlineNodes != null ? `${onlineNodes}/${totalNodes} online` : "DCORTEX offline",
    },
    {
      id: "agents",
      label: "ACTIVE AGENTS",
      value: readyAgents,
      max: activeAgents > 0 ? activeAgents : 30,
      unit: "",
      target: activeAgents > 0 ? activeAgents : 30,
      sparkData: [],
      color: "#4ade80",
      icon: "◉",
      detail: readyAgents != null ? `${readyAgents}/${activeAgents} ready` : "DCORTEX offline",
    },
    {
      id: "revit",
      label: "REVIT BRIDGE",
      value: revitAlive ? 100 : 0,
      max: 100,
      unit: "%",
      target: 100,
      sparkData: revitAlive ? [80, 90, 100, 100, 100] : [40, 20, 0, 0, 0],
      color: revitAlive ? "#4ade80" : "#ff3b30",
      icon: revitAlive ? "⚡" : "⚡",
      detail: revitOnline ? "ALIVE · ONLINE" : "Status: " + (dcortex.revit?.state || "offline"),
    },
  ];

  // Real activity feed — every entry is an actual ActivityLog record,
  // not a canned sample.
  const activityFeed = activityLogs.slice(0, 12).map((a) => ({
    time: a.createdAt
      ? new Date(a.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : "—",
    msg: a.summary || `${a.actor || "System"} ${(a.action || "").toLowerCase()} ${a.entity || ""}`.trim(),
    type: entityToType(a.entity),
  }));

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
            <span style={{ width:7, height:7, borderRadius:"50%", background: dcortexAvailable ? "#4ade80" : "#ff3b30", boxShadow:"0 0 8px "+(dcortexAvailable ? "#4ade80" : "#ff3b30"), display:"inline-block", animation:"pulse 2s infinite" }} />
            <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.55rem", color: dcortexAvailable ? "#4ade80" : "#ff3b30", letterSpacing:"1px" }}>{dcortexAvailable ? "DCORTEX ONLINE" : "DCORTEX OFFLINE"}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background: pushActive ? "#6b8e23" : "#4d584d", boxShadow:"0 0 8px "+(pushActive ? "#6b8e23" : "transparent"), display:"inline-block" }} />
            <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.55rem", color: pushActive ? "#6b8e23" : "#4d584d", letterSpacing:"1px" }}>{pushActive ? "SOCKET.IO LIVE" : "SOCKET.IO IDLE"}</span>
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
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"1.25rem" }}>
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
                    {m.value == null ? "—" : m.value}{m.unit}
                  </div>
                  <div style={{ fontSize:"0.7rem", color:"#4d584d", marginTop:4 }}>Target: {m.target}{m.unit}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
                  <GaugeArc value={m.value == null ? 0 : m.value} max={m.max} color={status.color} size={70} />
                  <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.45rem", color:status.color, border:`1px solid ${status.color}`, borderRadius:2, padding:"2px 6px", letterSpacing:"1px" }}>
                    {status.label}
                  </span>
                </div>
              </div>
              <div style={{ marginTop:12, fontSize:"0.65rem", color:"#4d584d" }}>{m.detail}</div>
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
              const pct = m.value == null ? 0 : Math.min(100, (m.value / m.max) * 100);
              return (
                <div key={m.id} style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.5rem", color:"#4d584d", width:120, flexShrink:0 }}>{m.label}</div>
                  <div style={{ flex:1, height:8, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:status.color, borderRadius:4, transition:"width 0.5s" }} />
                  </div>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.55rem", color:status.color, width:60, textAlign:"right" }}>
                    {m.value == null ? "—" : m.value}{m.unit}
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
            {activityFeed.length === 0 && (
              <div style={{ fontSize:"0.75rem", color:"#4d584d" }}>No recent activity</div>
            )}
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
