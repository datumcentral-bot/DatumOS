"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

/**
 * Shared shell for the /live chat + meeting suite (available to EVERY role).
 * Slim top bar only — the room components render their own full-page styling.
 * The DIRECTOR portal keeps its own /director/live copy inside its sidebar.
 */
export default function LiveLayout({ children }) {
  const { data: session } = useSession();
  const role = session?.user?.role || "";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#0a0e14",
        fontFamily: "'Rajdhani', sans-serif",
        color: "#f0f2f5",
      }}
    >
      {/* Top bar */}
      <header
        style={{
          height: 56,
          flexShrink: 0,
          background: "rgba(13,17,23,0.98)",
          borderBottom: "1px solid rgba(107,142,35,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: "rgba(107,142,35,0.15)",
              border: "1px solid rgba(107,142,35,0.4)",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
              color: "#a2d033",
            }}
          >
            ▶
          </div>
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.6rem",
              color: "#4d584d",
              letterSpacing: "1px",
            }}
          >
            <Link href="/console" style={{ color: "#4d584d", textDecoration: "none" }}>
              CONSOLE
            </Link>
          </span>
          <span style={{ color: "rgba(107,142,35,0.3)" }}>›</span>
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.68rem",
              color: "#fff",
              letterSpacing: "1.5px",
            }}
          >
            LIVE ROOM — CHAT + MEETING
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {session && (
            <>
              <span
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.6rem",
                  color: "#c19749",
                  letterSpacing: "1px",
                }}
              >
                {session.user?.name?.toUpperCase() || "OPERATOR"}
              </span>
              <span
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.55rem",
                  color: "#6b8e23",
                  letterSpacing: "1px",
                  border: "1px solid rgba(107,142,35,0.3)",
                  borderRadius: 2,
                  padding: "0.15rem 0.45rem",
                }}
              >
                {role}
              </span>
            </>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              background: "rgba(255,59,48,0.1)",
              border: "1px solid rgba(255,59,48,0.3)",
              borderRadius: 2,
              color: "#ff3b30",
              padding: "0.35rem 0.75rem",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.55rem",
              letterSpacing: "1px",
              cursor: "pointer",
            }}
          >
            END SESSION
          </button>
        </div>
      </header>

      {/* Page content */}
      <div style={{ flex: 1, overflowY: "auto" }}>{children}</div>
    </div>
  );
}
