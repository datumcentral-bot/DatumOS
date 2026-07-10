"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/lib/useSocket";
import LiveToast from "@/components/LiveToast";

const QUICK_ACTIONS = [
  { label: "NEW PROJECT", href: "/director/portfolio", icon: "◈" },
  { label: "OPEN CRM", href: "/director/crm", icon: "◇" },
  { label: "RISK REGISTER", href: "/director/risks", icon: "⚠" },
  { label: "COMMAND CHANNEL", href: "/director/communication", icon: "◉" },
];

export default function DirectorDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState({ projects: [], tasks: [], risks: [], clients: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [liveEvents, setLiveEvents] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time: refresh dashboard stats when any module changes
  const handleLiveEvent = useCallback((ev) => {
    setLiveEvents(prev => [...prev, { ...ev, id: Date.now() + Math.random() }]);
    // Re-fetch the relevant data slice
    if (ev.module === 'tasks') {
      fetch('/api/tasks').then(r => r.json()).then(d => {
        const toArr = (d, key) => Array.isArray(d) ? d : Array.isArray(d?.[key]) ? d[key] : [];
        setData(prev => ({ ...prev, tasks: toArr(d, 'tasks') }));
      }).catch(() => {});
    } else if (ev.module === 'leads') {
      // leads count shown on dashboard — no direct field but triggers a visual refresh
    }
  }, []);

  // Join the 'dashboard' room to receive cross-module events
  const { isConnected, onlineUsers, emitCrud } = useSocket('tasks', session?.user, handleLiveEvent);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, tRes, rRes, cRes, uRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/tasks"),
          fetch("/api/risks"),
          fetch("/api/admin/data?collection=clients"),
          fetch("/api/admin/data?collection=users"),
        ]);
        const [projects, tasks, risks, clients, users] = await Promise.all([
          pRes.json(), tRes.json(), rRes.json(), cRes.json(), uRes.json(),
        ]);
        const toArr = (d, key) => Array.isArray(d) ? d : Array.isArray(d?.[key]) ? d[key] : [];
        setData({
          projects: toArr(projects, "projects"),
          tasks:    toArr(tasks,    "tasks"),
          risks:    toArr(risks,    "risks"),
          clients:  toArr(clients,  "clients"),
          users:    toArr(users,    "users"),
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const now = mounted ? new Date() : new Date(0);
  const timeStr = mounted ? now.toLocaleTimeString("en-US", { hour12: false }) : "--:--:--";
  const dateStr = mounted ? now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "Loading...";

  const openTasks    = data.tasks.filter((t) => t.status !== "COMPLETE" && t.status !== "VERIFIED").length;
  const criticalRisks = data.risks.filter((r) => r.impact === "Critical" || r.impact === "High" || r.severity === "CRITICAL" || r.severity === "HIGH").length;
  const activeProjects = data.projects.filter((p) => p.status !== "COMPLETE" && p.status !== "CLOSED").length;
  const deliveryVelocity = data.tasks.length > 0
    ? Math.round((data.tasks.filter((t) => t.status === "COMPLETE" || t.status === "VERIFIED").length / data.tasks.length) * 100)
    : 84;

  const KPIS = [
    {
      label: "ACTIVE PROJECTS",
      value: loading ? "—" : activeProjects,
      trend: "STABLE",
      trendDir: "neutral",
      color: "#4cc9f0",
      glow: "rgba(76,201,240,0.12)",
      border: "rgba(76,201,240,0.25)",
      icon: "◈",
    },
    {
      label: "DELIVERY VELOCITY",
      value: loading ? "—" : `${deliveryVelocity}%`,
      trend: `+${Math.max(0, deliveryVelocity - 80)}% vs TARGET`,
      trendDir: deliveryVelocity >= 80 ? "positive" : "negative",
      color: "#6b8e23",
      glow: "rgba(107,142,35,0.12)",
      border: "rgba(107,142,35,0.25)",
      icon: "◆",
    },
    {
      label: "OPEN DELIVERABLES",
      value: loading ? "—" : openTasks,
      trend: openTasks > 10 ? "ACTION REQUIRED" : "WITHIN THRESHOLD",
      trendDir: openTasks > 10 ? "negative" : "neutral",
      color: "#c19749",
      glow: "rgba(193,151,73,0.12)",
      border: "rgba(193,151,73,0.25)",
      icon: "◉",
    },
    {
      label: "CRITICAL RISKS",
      value: loading ? "—" : criticalRisks,
      trend: criticalRisks > 0 ? "ATTENTION REQ" : "NOMINAL",
      trendDir: criticalRisks > 0 ? "negative" : "positive",
      color: criticalRisks > 0 ? "#ff3b30" : "#28a745",
      glow: criticalRisks > 0 ? "rgba(255,59,48,0.12)" : "rgba(40,167,69,0.12)",
      border: criticalRisks > 0 ? "rgba(255,59,48,0.25)" : "rgba(40,167,69,0.25)",
      icon: "⚠",
      accentLeft: criticalRisks > 0,
    },
  ];

  const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Page title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "1rem",
          borderBottom: "1px solid rgba(107,142,35,0.15)",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "1rem",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            BIM OPERATIONAL COMMAND HUB
          </h1>
          <p style={{ fontSize: "0.75rem", color: "#4d584d", marginTop: 4 }}>{dateStr}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#a2d033",
              boxShadow: "0 0 6px #a2d033",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.6rem",
              color: "#a2d033",
              letterSpacing: "1px",
            }}
          >
            LIVE · {timeStr}
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
        }}
      >
        {KPIS.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: kpi.glow,
              border: `1px solid ${kpi.border}`,
              borderLeft: kpi.accentLeft ? `3px solid ${kpi.color}` : `1px solid ${kpi.border}`,
              borderRadius: 4,
              padding: "1.25rem",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s",
            }}
          >
            {/* Corner brackets */}
            <div style={{ position: "absolute", top: 0, left: 0, width: 12, height: 12, borderTop: `1px solid ${kpi.color}`, borderLeft: `1px solid ${kpi.color}`, opacity: 0.5 }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderBottom: `1px solid ${kpi.color}`, borderRight: `1px solid ${kpi.color}`, opacity: 0.5 }} />

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    color: "#94a3b8",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  {kpi.label}
                </p>
                <p
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: kpi.color,
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {loading ? (
                    <span style={{ fontSize: "1rem", color: "#4d584d" }}>LOADING...</span>
                  ) : (
                    kpi.value
                  )}
                </p>
                <p
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    color:
                      kpi.trendDir === "positive" ? "#28a745" :
                      kpi.trendDir === "negative" ? "#ff3b30" : "#94a3b8",
                  }}
                >
                  {kpi.trend}
                </p>
              </div>
              <span style={{ fontSize: "1.4rem", color: kpi.color, opacity: 0.6 }}>{kpi.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Master Delivery Timeline (Gantt) */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(107,142,35,0.15)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1rem 1.5rem",
            background: "rgba(255,255,255,0.02)",
            borderBottom: "1px solid rgba(107,142,35,0.15)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "1px",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span style={{ color: "#6b8e23" }}>◆</span>
            MASTER DELIVERY TIMELINE
          </h3>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.6rem", color: "#4d584d" }}>
            FY26 Q1–Q2 VIEW
          </span>
        </div>
        <div style={{ padding: "1.25rem", overflowX: "auto" }}>
          <div style={{ minWidth: 700 }}>
            {/* Month headers */}
            <div
              style={{
                display: "flex",
                marginBottom: "0.75rem",
                paddingBottom: "0.5rem",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div
                style={{
                  width: 220,
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.6rem",
                  color: "#4d584d",
                  letterSpacing: "1px",
                }}
              >
                PROJECT / MILESTONE
              </div>
              <div style={{ flex: 1, display: "flex" }}>
                {MONTHS.map((m) => (
                  <div
                    key={m}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: "0.6rem",
                      color: "#4d584d",
                      borderLeft: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    {m}
                  </div>
                ))}
              </div>
            </div>

            {/* Project rows */}
            {loading ? (
              <div style={{ height: 80, background: "rgba(107,142,35,0.05)", borderRadius: 4 }} />
            ) : data.projects.length === 0 ? (
              <p style={{ color: "#4d584d", fontSize: "0.8rem", textAlign: "center", padding: "2rem" }}>
                No projects found
              </p>
            ) : (
              data.projects.slice(0, 6).map((p, i) => {
                const startPct = (i * 8) % 40;
                const widthPct = 30 + (i * 7) % 35;
                return (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "0.65rem",
                    }}
                  >
                    <div
                      style={{
                        width: 220,
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "#fff",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        paddingRight: "0.5rem",
                      }}
                    >
                      {(p.name || p.code || "PROJECT").toUpperCase()}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        position: "relative",
                        height: 10,
                        background: "rgba(255,255,255,0.04)",
                        borderRadius: 2,
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: `${startPct}%`,
                          width: `${widthPct}%`,
                          height: "100%",
                          background: `linear-gradient(90deg, #6b8e23, #4cc9f0)`,
                          borderRadius: 2,
                          boxShadow: "0 0 8px rgba(107,142,35,0.3)",
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom row: Activity + Quick Ops */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
        {/* Recent CDE Activity */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(107,142,35,0.15)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "1rem 1.5rem",
              borderBottom: "1px solid rgba(107,142,35,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span style={{ color: "#6b8e23" }}>◉</span>
            <h3
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              RECENT CDE ACTIVITY
            </h3>
          </div>
          <div>
            {loading ? (
              <div style={{ padding: "1rem" }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: 48,
                      background: "rgba(107,142,35,0.04)",
                      borderRadius: 2,
                      marginBottom: 8,
                    }}
                  />
                ))}
              </div>
            ) : (
              [
                { dot: "#6b8e23", title: "OIR_Park_V1.pdf", sub: "ISO 19650 Compliance Signed", time: "10:45 AM" },
                { dot: "#c19749", title: "Clash Report — Tower A", sub: "3 new clashes detected", time: "09:30 AM" },
                { dot: "#4cc9f0", title: "MIDP Updated — BAGC", sub: "Revision 4 submitted", time: "08:15 AM" },
                { dot: "#28a745", title: "QA Gate Passed — Level 3", sub: "All checks verified", time: "Yesterday" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.85rem 1.5rem",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: item.dot,
                      boxShadow: `0 0 6px ${item.dot}`,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#fff" }}>{item.title}</p>
                    <p style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{item.sub}</p>
                  </div>
                  <span
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: "0.6rem",
                      color: "#4d584d",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Ops */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(107,142,35,0.15)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "1rem 1.5rem",
              borderBottom: "1px solid rgba(107,142,35,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span style={{ color: "#6b8e23" }}>◆</span>
            <h3
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              QUICK OPS
            </h3>
          </div>
          <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {QUICK_ACTIONS.map((action) => (
              <a
                key={action.href}
                href={action.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.65rem 0.9rem",
                  background: "rgba(107,142,35,0.06)",
                  border: "1px solid rgba(107,142,35,0.2)",
                  borderRadius: 2,
                  color: "#fff",
                  textDecoration: "none",
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(107,142,35,0.12)";
                  e.currentTarget.style.borderColor = "rgba(107,142,35,0.4)";
                  e.currentTarget.style.boxShadow = "0 0 12px rgba(107,142,35,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(107,142,35,0.06)";
                  e.currentTarget.style.borderColor = "rgba(107,142,35,0.2)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span style={{ color: "#6b8e23" }}>{action.icon}</span>
                {action.label}
              </a>
            ))}

            {/* System stats */}
            <div
              style={{
                marginTop: "0.5rem",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 2,
              }}
            >
              {[
                { label: "PROJECTS", value: loading ? "—" : data.projects.length },
                { label: "TEAM",     value: loading ? "—" : data.users.length },
                { label: "CLIENTS",  value: loading ? "—" : data.clients.length },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.3rem 0",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: "0.55rem",
                      color: "#4d584d",
                      letterSpacing: "1px",
                    }}
                  >
                    {s.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: "0.75rem",
                      color: "#6b8e23",
                      fontWeight: 700,
                    }}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}