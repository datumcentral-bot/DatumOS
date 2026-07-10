"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PORTALS = {
  DIRECTOR: [
    {
      id: "director",
      label: "DIRECTOR COMMAND",
      subtitle: "Strategic Operations Center",
      icon: "⬡",
      href: "/director",
      color: "#c19749",
      glow: "rgba(193,151,73,0.2)",
      border: "rgba(193,151,73,0.4)",
      modules: [
        "Executive Dashboard", "Project Portfolio", "CRM Pipeline",
        "Financial Control", "Team Management", "Org Chart",
        "Risk Register", "RACI Matrix", "Scope Matrix",
        "Lessons Learned", "Production Monitor", "BIM Meetings",
        "Screen Share", "Communication Hub", "Resources",
        "Delivery Schedule", "KPI & EVM", "Activity Log",
        "Pre-qualification", "Admin Panel", "Milestones",
      ],
    },
    {
      id: "workspace",
      label: "WORKSPACE PORTAL",
      subtitle: "BIM Delivery Operations",
      icon: "◈",
      href: "/workspace",
      color: "#6b8e23",
      glow: "rgba(107,142,35,0.15)",
      border: "rgba(107,142,35,0.4)",
      modules: [
        "Task Kanban", "BIM Coordination", "Document Vault",
        "Timesheets", "SOPs / How-To", "Screen Share",
      ],
    },
    {
      id: "client",
      label: "CLIENT PORTAL",
      subtitle: "Appointing Party Interface",
      icon: "◇",
      href: "/client",
      color: "#4cc9f0",
      glow: "rgba(76,201,240,0.15)",
      border: "rgba(76,201,240,0.4)",
      modules: [
        "Project Overview", "Milestone Tracker", "Document Approvals",
        "Billing & Invoices", "Document Vault",
      ],
    },
  ],
  MEMBER: [
    {
      id: "workspace",
      label: "WORKSPACE PORTAL",
      subtitle: "BIM Delivery Operations",
      icon: "◈",
      href: "/workspace",
      color: "#6b8e23",
      glow: "rgba(107,142,35,0.15)",
      border: "rgba(107,142,35,0.4)",
      modules: [
        "My Tasks", "BIM Coordination", "Document Vault",
        "Timesheets", "SOPs / How-To", "Screen Share",
      ],
    },
  ],
  CLIENT: [
    {
      id: "client",
      label: "CLIENT PORTAL",
      subtitle: "Appointing Party Interface",
      icon: "◇",
      href: "/client",
      color: "#4cc9f0",
      glow: "rgba(76,201,240,0.15)",
      border: "rgba(76,201,240,0.4)",
      modules: [
        "Project Overview", "Milestone Tracker", "Document Approvals",
        "Billing & Invoices", "Document Vault",
      ],
    },
  ],
};

export default function ConsolePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tick, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (status === "loading" || !session) {
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

  const role = session.user?.role || "MEMBER";
  const portals = PORTALS[role] || PORTALS.MEMBER;
  const now = mounted ? new Date() : new Date(0);
  const timeStr = mounted ? now.toLocaleTimeString("en-US", { hour12: false }) : "--:--:--";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0e14",
        fontFamily: "'Rajdhani', sans-serif",
        color: "#f0f2f5",
      }}
    >
      {/* Top header */}
      <header
        style={{
          height: 60,
          background: "rgba(13,17,23,0.98)",
          borderBottom: "1px solid rgba(107,142,35,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2rem",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: "rgba(107,142,35,0.15)",
                border: "1px solid rgba(107,142,35,0.4)",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                boxShadow: "0 0 10px rgba(107,142,35,0.2)",
              }}
            >
              ⬡
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "2px",
                }}
              >
                DatumOS
              </p>
              <p
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.55rem",
                  color: "#6b8e23",
                  letterSpacing: "2px",
                }}
              >
                OPERATIONS CONSOLE
              </p>
            </div>
          </div>
          <div
            style={{
              height: 24,
              width: 1,
              background: "rgba(107,142,35,0.2)",
            }}
          />
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.6rem",
              color: "#4d584d",
              letterSpacing: "1px",
            }}
          >
            ISO 19650 COMPLIANT
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.7rem",
              color: "#6b8e23",
              letterSpacing: "2px",
            }}
          >
            {timeStr}
          </span>

          {/* User info */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 4,
                background: "rgba(193,151,73,0.15)",
                border: "1px solid rgba(193,151,73,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#c19749",
              }}
            >
              {session.user?.name?.charAt(0) || "?"}
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.65rem",
                  color: "#fff",
                  letterSpacing: "1px",
                }}
              >
                {session.user?.name?.toUpperCase() || "OPERATOR"}
              </p>
              <p
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.55rem",
                  color: "#c19749",
                  letterSpacing: "1px",
                }}
              >
                {role}
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              background: "rgba(255,59,48,0.1)",
              border: "1px solid rgba(255,59,48,0.3)",
              borderRadius: 2,
              color: "#ff3b30",
              padding: "0.4rem 0.9rem",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "1px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,59,48,0.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,59,48,0.1)")}
          >
            END SESSION
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{ padding: "3rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
        {/* Welcome */}
        <div style={{ marginBottom: "3rem", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.65rem",
              color: "#6b8e23",
              letterSpacing: "4px",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            Operations Console
          </p>
          <h1
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "1.8rem",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            Command Hub
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
            Select your operational portal — access scoped to{" "}
            <span style={{ color: "#c19749", fontWeight: 600 }}>{role}</span> clearance
          </p>
        </div>

        {/* Portal cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${portals.length}, 1fr)`,
            gap: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          {portals.map((portal) => (
            <div
              key={portal.id}
              onClick={() => router.push(portal.href)}
              style={{
                background: portal.glow,
                border: `1px solid ${portal.border}`,
                borderRadius: 4,
                padding: "2rem",
                cursor: "pointer",
                transition: "all 0.3s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.5), 0 0 20px ${portal.glow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Top accent */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, transparent, ${portal.color}, transparent)`,
                }}
              />

              {/* Icon */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  background: `${portal.glow}`,
                  border: `1px solid ${portal.border}`,
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                  color: portal.color,
                  marginBottom: "1.25rem",
                  boxShadow: `0 0 15px ${portal.glow}`,
                }}
              >
                {portal.icon}
              </div>

              <h2
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: "0.4rem",
                }}
              >
                {portal.label}
              </h2>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "1.5rem" }}>
                {portal.subtitle}
              </p>

              {/* Module list */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                  marginBottom: "1.5rem",
                }}
              >
                {portal.modules.slice(0, 8).map((m) => (
                  <span
                    key={m}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 2,
                      padding: "2px 6px",
                      fontSize: "0.6rem",
                      color: "#94a3b8",
                      fontFamily: "'Orbitron', sans-serif",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {m}
                  </span>
                ))}
                {portal.modules.length > 8 && (
                  <span
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 2,
                      padding: "2px 6px",
                      fontSize: "0.6rem",
                      color: portal.color,
                      fontFamily: "'Orbitron', sans-serif",
                    }}
                  >
                    +{portal.modules.length - 8} more
                  </span>
                )}
              </div>

              <button
                style={{
                  width: "100%",
                  background: "transparent",
                  border: `1px solid ${portal.border}`,
                  borderRadius: 2,
                  color: portal.color,
                  padding: "0.6rem",
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = portal.glow;
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = portal.color;
                }}
              >
                ENTER PORTAL →
              </button>
            </div>
          ))}
        </div>

        {/* System info bar */}
        <div
          style={{
            background: "rgba(13,17,23,0.8)",
            border: "1px solid rgba(107,142,35,0.1)",
            borderRadius: 4,
            padding: "1rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            {[
              { label: "PLATFORM", value: "DatumOS v9" },
              { label: "STANDARD", value: "ISO 19650" },
              { label: "OPERATOR", value: session.user?.name || "—" },
              { label: "CLEARANCE", value: role },
            ].map((item) => (
              <div key={item.label}>
                <p
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.55rem",
                    color: "#4d584d",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.7rem",
                    color: "#6b8e23",
                    letterSpacing: "1px",
                    marginTop: 2,
                  }}
                >
                  {item.value}
                </p>
              </div>
            ))}
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
              ALL SYSTEMS NOMINAL
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
