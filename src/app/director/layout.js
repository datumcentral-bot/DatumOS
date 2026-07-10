"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSocketContext } from "@/lib/SocketContext";

// Full nav from hub.html + app-commander.js analysis
const NAV_SECTIONS = [
  {
    label: "⚡ LAUNCH ENGINE",
    key: "launch",
    items: [
      { href: "/director",              icon: "⬡", label: "Executive Summary" },
      { href: "/director/war-room",     icon: "⚔", label: "War Room", accent: "danger" },
      { href: "/director/live-monitor", icon: "◉", label: "Live Monitor", accent: "gold" },
      { href: "/director/funding",      icon: "◈", label: "Funding Tracker", accent: "gold" },
      { href: "/director/portfolio",    icon: "◈", label: "Project Portfolio" },
      { href: "/director/kpi",          icon: "◆", label: "Management Insights" },
    ],
  },
  {
    label: "🎯 SELL ENGINE",
    key: "sell",
    items: [
      { href: "/director/crm",          icon: "◇", label: "CRM Kanban", accent: "gold" },
      { href: "/director/sales-pool",   icon: "◈", label: "Sales Pool", accent: "gold" },
      { href: "/director/prospects",    icon: "◈", label: "CRM Database" },
      { href: "/director/outreach",     icon: "✉", label: "Outreach Sequences" },
      { href: "/director/social-library",icon:"◈", label: "Social Library" },
      { href: "/director/prequal",      icon: "◈", label: "Pre-Qualification" },
      { href: "/director/conversations",icon: "💬", label: "Unified Inbox" },
      { href: "/director/campaigns",    icon: "📣", label: "Campaigns" },
      { href: "/director/forms",        icon: "📋", label: "Forms & Surveys" },
    ],
  },
  {
    label: "🔧 CONTROL ENGINE",
    key: "control",
    items: [
      { href: "/director/risks",        icon: "⚠", label: "Project Risks",      accent: "danger" },
      { href: "/director/resources",    icon: "◐", label: "Mobilization" },
      { href: "/director/org-chart",    icon: "⊞", label: "Enterprise Org Chart" },
      { href: "/director/communication",icon: "◈", label: "Tactical Chat" },
      { href: "/director/monitoring",   icon: "◉", label: "Sub-con Monitoring" },
      { href: "/director/raci",         icon: "⊕", label: "RACI Matrix" },
      { href: "/director/finance",      icon: "◇", label: "Financial Control" },
      { href: "/director/admin",        icon: "⊕", label: "Admin Panel" },
      { href: "/director/calendar",     icon: "📅", label: "Calendar" },
      { href: "/director/automations",  icon: "⚡", label: "Automations" },
    ],
  },
  {
    label: "📈 PROGRESS ENGINE",
    key: "progress",
    items: [
      { href: "/director/tasks",        icon: "⊤", label: "Task Board" },
      { href: "/director/milestones",   icon: "◎", label: "MIDP / TIDP Logs" },
      { href: "/director/coordination", icon: "⊕", label: "Coordination Hub" },
      { href: "/director/meetings",     icon: "◇", label: "BIM Meetings" },
      { href: "/director/lessons",      icon: "◎", label: "Lessons Learned" },
      { href: "/director/reports",      icon: "◆", label: "Reports & Analytics" },
      { href: "/director/reviews",      icon: "⭐", label: "Reputation & Reviews" },
      { href: "/director/workload",     icon: "◈", label: "Workload View" },
      { href: "/director/activity",     icon: "◉", label: "Activity Log" },
    ],
  },
  {
    label: "BIM OPERATIONS",
    key: "bim",
    items: [
      { href: "/director/bim/bep",                  icon: "◈", label: "BIM Exec Plans", accent: "gold" },
      { href: "/director/bim/cde",                  icon: "⊞", label: "CDE Documents", accent: "gold" },
      { href: "/director/bim/midp",                 icon: "◉", label: "MIDP", accent: "gold" },
      { href: "/director/bim/tidp",                 icon: "◈", label: "TIDP", accent: "gold" },
      { href: "/director/bim/eir",                  icon: "◆", label: "EIR", accent: "gold" },
      { href: "/director/bim/air",                  icon: "◇", label: "AIR", accent: "gold" },
      { href: "/director/bim/lod",                  icon: "◉", label: "LOD Matrix", accent: "gold" },
      { href: "/director/bim/clash",                icon: "⚠", label: "Clash Detection", accent: "danger" },
      { href: "/director/bim/responsibility-matrix",icon: "◎", label: "Responsibility Matrix" },
      { href: "/director/bim/naming-convention",    icon: "◆", label: "Naming Conventions" },
      { href: "/director/bim/model-production",     icon: "⊕", label: "Model Production" },
      { href: "/director/bim/coord-schedule",       icon: "◈", label: "Coord Schedule" },
      { href: "/director/bim/delivery-milestones",  icon: "◎", label: "Delivery Milestones" },
      { href: "/director/sop",        icon: "◈", label: "SOP / How-To" },
      { href: "/director/scope",      icon: "⊞", label: "BIM Scope" },
      { href: "/director/verify",     icon: "◉", label: "BIM Verify" },
      { href: "/director/documents",  icon: "◎", label: "File Manager" },
      { href: "/director/schedule",   icon: "◆", label: "Delivery Schedule" },
      { href: "/director/screen",     icon: "◈", label: "Screen Share" },
    ],
  },
  {
    label: "CLIENT DELIVERY",
    key: "client",
    items: [
      { href: "/director/clients",       icon: "◈", label: "Clients", accent: "gold" },
      { href: "/director/client-projects",icon:"◧", label: "Client Projects", accent: "gold" },
      { href: "/director/iso19650",      icon: "⊞", label: "ISO 19650" },
      { href: "/director/subcontractors",icon: "◍", label: "Subcontractors" },
      { href: "/director/team",          icon: "◉", label: "Project Team" },
    ],
  },
  {
    label: "KNOWLEDGE BASE",
    key: "knowledge",
    items: [],
  },
  {
    label: "📚 KNOWLEDGE BASE",
    key: "knowledge",
    items: [
      { href: "/director/knowledge/hub",        icon: "🏠", label: "Knowledge Hub", accent: "gold" },
      { href: "/director/knowledge/library",    icon: "📖", label: "DBC Standards Library" },
      { href: "/director/knowledge/templates",  icon: "📝", label: "Templates & Forms" },
      { href: "/director/knowledge/sops",       icon: "📋", label: "SOPs & Procedures" },
      { href: "/director/knowledge/training",   icon: "🎓", label: "Training Resources" },
      { href: "/director/knowledge/references", icon: "🔗", label: "External References" },
    ],
  },
  {
    label: "TOOLS",
    key: "tools",
    items: [
      { href: "/director/search",        icon: "⌕", label: "Global Search", accent: "gold" },
      { href: "/director/notifications", icon: "🔔", label: "Notifications", accent: "danger" },
      { href: "/director/settings",      icon: "⚙", label: "Settings" },
      { href: "/director/activity",      icon: "◉", label: "Activity Log" },
      { href: "/director/integrations",  icon: "🔗", label: "Integrations" },
      { href: "/director/ai-settings",   icon: "🤖", label: "AI Command Center", accent: "info" },
    ],
  },
];

const ACCENT_COLORS = {
  danger:  { color: "#ff3b30", bg: "rgba(255,59,48,0.08)" },
  warning: { color: "#ffb100", bg: "rgba(255,177,0,0.08)" },
  gold:    { color: "#c19749", bg: "rgba(193,151,73,0.08)" },
};

function getActiveSection(pathname) {
  for (const section of NAV_SECTIONS) {
    if (section.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"))) {
      return section.key;
    }
  }
  return "launch";
}

export default function DirectorLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openSection, setOpenSection] = useState(() => getActiveSection(pathname || ""));
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useSocketContext();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session?.user?.role === "CLIENT") {
      router.push("/client");
    }
  }, [status, session, router]);

  // Smart auto-expand: only switch section when navigating to a DIFFERENT section
  useEffect(() => {
    const prev = prevPathnameRef.current;
    prevPathnameRef.current = pathname;
    if (prev === pathname) return;

    const activeKey = getActiveSection(pathname || "");
    setOpenSection((current) => {
      // If the active link is inside the currently open section, keep it open
      const currentSection = NAV_SECTIONS.find((s) => s.key === current);
      if (currentSection && currentSection.items.some(
        (item) => pathname === item.href || pathname.startsWith(item.href + "/")
      )) {
        return current;
      }
      return activeKey;
    });
  }, [pathname]);

  const toggleSection = (key) => {
    if (collapsed) return;
    setOpenSection((prev) => (prev === key ? null : key));
  };

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0e14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Orbitron', sans-serif",
          color: "#6b8e23",
          fontSize: "0.8rem",
          letterSpacing: "2px",
        }}
      >
        SYNCHRONIZING...
      </div>
    );
  }

  const now = new Date();
  const timeStr = mounted ? now.toLocaleTimeString("en-US", { hour12: false }) : "--:--:--";

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "#0a0e14",
        fontFamily: "'Rajdhani', sans-serif",
        color: "#f0f2f5",
      }}
    >
      {/* ── SIDEBAR ── */}
      <aside
        style={{
          width: collapsed ? 60 : 270,
          background: "rgba(13,17,23,0.98)",
          borderRight: "1px solid rgba(107,142,35,0.15)",
          display: "flex",
          flexDirection: "column",
          zIndex: 100,
          flexShrink: 0,
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
        }}
      >
        {/* Sidebar header */}
        <div
          style={{
            padding: collapsed ? "1.25rem 0.75rem" : "1.25rem 1.5rem",
            borderBottom: "1px solid rgba(107,142,35,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            gap: "0.75rem",
          }}
        >
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/datum-emblem-light.png"
                alt="Datum BIM"
                width={52}
                height={52}
                style={{ objectFit: "contain", flexShrink: 0 }}
              />
              <div>
                <p
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.95rem",
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                  }}
                >
                  DatumBIM
                </p>
                <p
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.55rem",
                    color: "#6b8e23",
                    letterSpacing: "2px",
                    marginTop: 2,
                  }}
                >
                  ISO 19650 COMPLIANT
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "none",
              border: "none",
              color: "#4d584d",
              cursor: "pointer",
              fontSize: "0.9rem",
              padding: 4,
              flexShrink: 0,
            }}
          >
            {collapsed ? "▶" : "◀"}
          </button>
        </div>

        {/* Nav — accordion */}
        <nav
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0.75rem 0.5rem",
          }}
        >
          {NAV_SECTIONS.map((section) => {
            const isOpen = !collapsed && openSection === section.key;
            const hasActive = section.items.some(
              (item) => pathname === item.href || pathname.startsWith(item.href + "/")
            );
            return (
              <div key={section.key} style={{ marginBottom: "2px" }}>
                {/* Accordion header button */}
                <button
                  onClick={() => !collapsed && toggleSection(section.key)}
                  title={collapsed ? section.label : undefined}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed ? "center" : "space-between",
                    padding: collapsed ? "0.65rem" : "0.55rem 0.75rem",
                    background: hasActive ? "rgba(107,142,35,0.06)" : "transparent",
                    border: "none",
                    borderRadius: 3,
                    cursor: collapsed ? "default" : "pointer",
                    transition: "background 0.2s",
                    gap: "0.5rem",
                  }}
                >
                  {collapsed ? (
                    <span style={{ fontSize: "0.75rem", color: hasActive ? "#6b8e23" : "#4d584d" }}>
                      {section.label.split(" ")[0]}
                    </span>
                  ) : (
                    <>
                      <span
                        style={{
                          fontFamily: "'Orbitron', sans-serif",
                          fontSize: "0.52rem",
                          color: hasActive ? "#a2d033" : "#4d584d",
                          textTransform: "uppercase",
                          letterSpacing: "1.5px",
                          fontWeight: 700,
                          textAlign: "left",
                        }}
                      >
                        {section.label}
                      </span>
                      <span
                        style={{
                          fontSize: "0.6rem",
                          color: hasActive ? "#6b8e23" : "#4d584d",
                          transition: "transform 0.25s",
                          transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                          flexShrink: 0,
                        }}
                      >
                        ▶
                      </span>
                    </>
                  )}
                </button>

                {/* Animated items panel */}
                <div
                  style={{
                    overflow: "hidden",
                    maxHeight: isOpen || collapsed ? `${section.items.length * 44}px` : "0px",
                    transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1)",
                    opacity: isOpen || collapsed ? 1 : 0,
                  }}
                >
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const accentStyle = item.accent ? ACCENT_COLORS[item.accent] : null;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.65rem",
                          padding: collapsed ? "0.65rem" : "0.5rem 0.75rem 0.5rem 1.25rem",
                          justifyContent: collapsed ? "center" : "flex-start",
                          color: isActive
                            ? accentStyle?.color || "#a2d033"
                            : accentStyle?.color || "#94a3b8",
                          textDecoration: "none",
                          borderRadius: 2,
                          marginBottom: 1,
                          background: isActive
                            ? accentStyle?.bg || "rgba(107,142,35,0.1)"
                            : "transparent",
                          boxShadow: isActive
                            ? `inset 3px 0 0 ${accentStyle?.color || "#6b8e23"}`
                            : "none",
                          transition: "all 0.15s",
                          fontSize: "0.82rem",
                          fontFamily: "'Rajdhani', sans-serif",
                          fontWeight: isActive ? 600 : 400,
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = accentStyle?.bg || "rgba(107,142,35,0.06)";
                            e.currentTarget.style.color = accentStyle?.color || "#fff";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = accentStyle?.color || "#94a3b8";
                          }
                        }}
                        title={collapsed ? item.label : undefined}
                      >
                        <span
                          style={{
                            fontSize: "0.85rem",
                            flexShrink: 0,
                            filter: isActive ? `drop-shadow(0 0 4px ${accentStyle?.color || "#6b8e23"})` : "none",
                          }}
                        >
                          {item.icon}
                        </span>
                        {!collapsed && item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div
          style={{
            padding: collapsed ? "1rem 0.5rem" : "1rem 1rem",
            borderTop: "1px solid rgba(107,142,35,0.15)",
          }}
        >
          {!collapsed && session && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 2,
                  background: "rgba(193,151,73,0.15)",
                  border: "1px solid rgba(193,151,73,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.65rem",
                  color: "#c19749",
                  flexShrink: 0,
                }}
              >
                {session.user?.name?.charAt(0) || "?"}
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.6rem",
                    color: "#fff",
                    letterSpacing: "1px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {session.user?.name?.toUpperCase() || "OPERATOR"}
                </p>
                <p
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.5rem",
                    color: "#c19749",
                    letterSpacing: "1px",
                  }}
                >
                  {session.user?.role || "DIRECTOR"}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              width: "100%",
              background: "rgba(255,59,48,0.08)",
              border: "1px solid rgba(255,59,48,0.2)",
              borderRadius: 2,
              color: "#ff3b30",
              padding: collapsed ? "0.5rem" : "0.5rem 0.75rem",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "1px",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,59,48,0.15)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,59,48,0.08)")}
          >
            ⏻ {!collapsed && "END SESSION"}
          </button>
        </div>
      </aside>

      {/* ── MAIN VIEWPORT ── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Top header */}
        <header
          style={{
            height: 60,
            background: "rgba(10,14,20,0.9)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(107,142,35,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1.5rem",
            flexShrink: 0,
            position: "relative",
          }}
        >
          {/* Bottom accent line */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(107,142,35,0.3), transparent)",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link
              href="/console"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "0.6rem",
                color: "#4d584d",
                letterSpacing: "1px",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#6b8e23")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#4d584d")}
            >
              CONSOLE
            </Link>
            <span style={{ color: "rgba(107,142,35,0.3)" }}>›</span>
            <span
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "0.7rem",
                color: "#fff",
                letterSpacing: "1px",
              }}
            >
              DIRECTOR COMMAND
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <span
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "0.65rem",
                color: "#6b8e23",
                letterSpacing: "2px",
              }}
            >
              {timeStr}
            </span>
            {/* ── LIVE WebSocket badge ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: isConnected ? "#4ade80" : "#f87171",
                  boxShadow: isConnected ? "0 0 8px #4ade80" : "0 0 8px #f87171",
                  display: "inline-block",
                  animation: isConnected ? "pulse 2s infinite" : "none",
                }}
              />
              <span
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.55rem",
                  color: isConnected ? "#4ade80" : "#f87171",
                  letterSpacing: "1px",
                  fontWeight: 700,
                }}
              >
                {isConnected ? "LIVE" : "OFFLINE"}
              </span>
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
                  fontSize: "0.55rem",
                  color: "#a2d033",
                  letterSpacing: "1px",
                }}
              >
                SYSTEM: ONLINE
              </span>
            </div>
            {session && (
              <span
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.65rem",
                  color: "#c19749",
                  letterSpacing: "1px",
                }}
              >
                OP-{session.user?.name?.split(" ")[0]?.toUpperCase() || "DIRECTOR"}
              </span>
            )}
            {/* Notification Bell */}
            <Link href="/director/notifications" style={{ position:"relative", textDecoration:"none", display:"flex", alignItems:"center" }}>
              <span style={{ fontSize:"1rem", color:"#4d584d", transition:"color 0.2s" }} onMouseEnter={e=>e.currentTarget.style.color="#c19749"} onMouseLeave={e=>e.currentTarget.style.color="#4d584d"}>🔔</span>
              <span style={{ position:"absolute", top:-4, right:-4, background:"#ff3b30", color:"#fff", borderRadius:"50%", width:14, height:14, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Orbitron',sans-serif", fontSize:"0.4rem", fontWeight:800 }}>5</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.5rem",
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}