"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/console";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(urlError ? "ACCESS DENIED — INVALID CREDENTIALS" : "");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const now = mounted ? new Date() : null;
  const timeStr = now ? now.toLocaleTimeString("en-US", { hour12: false }) : "--:--:--";
  const dateStr = now ? now.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" }) : "Loading...";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Let NextAuth perform a native server-side redirect (302). This is the most
    // reliable path behind a Cloudflare tunnel — it does not depend on the client
    // resolving its own base URL for a follow-up getSession() fetch (which can
    // throw on non-localhost hosts and previously showed "SYSTEM ERROR").
    await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: callbackUrl || "/console",
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0e14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Rajdhani', sans-serif",
      }}
    >
      {/* Grid overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(107,142,35,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(107,142,35,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      {/* Radial vignette */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Corner decorations */}
      {[
        { top: 20, left: 20, borderTop: true, borderLeft: true },
        { top: 20, right: 20, borderTop: true, borderRight: true },
        { bottom: 20, left: 20, borderBottom: true, borderLeft: true },
        { bottom: 20, right: 20, borderBottom: true, borderRight: true },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "fixed",
            width: 40,
            height: 40,
            ...pos,
            borderTop: pos.borderTop ? "1px solid rgba(107,142,35,0.4)" : "none",
            borderLeft: pos.borderLeft ? "1px solid rgba(107,142,35,0.4)" : "none",
            borderBottom: pos.borderBottom ? "1px solid rgba(107,142,35,0.4)" : "none",
            borderRight: pos.borderRight ? "1px solid rgba(107,142,35,0.4)" : "none",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Top status bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 40,
          background: "rgba(10,14,20,0.9)",
          borderBottom: "1px solid rgba(107,142,35,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2rem",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.65rem",
              color: "#6b8e23",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            DatumOS
          </span>
          <span style={{ color: "rgba(107,142,35,0.3)", fontSize: "0.7rem" }}>|</span>
          <span style={{ fontSize: "0.65rem", color: "#4d584d", letterSpacing: "1px" }}>
            ISO 19650 COMPLIANT
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.65rem",
              color: "#4d584d",
              letterSpacing: "1px",
            }}
          >
            {dateStr}
          </span>
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
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#a2d033",
                boxShadow: "0 0 6px #a2d033",
                display: "inline-block",
                animation: "blink-dot 1.5s ease-in-out infinite",
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
              SYSTEM: ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* Main login card */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          width: "100%",
          maxWidth: 440,
          padding: "0 1.5rem",
        }}
      >
        {/* Logo / Brand */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          {/* Back to website link */}
          <div style={{ marginBottom: "1.5rem" }}>
            <Link href="/" style={{ color: "rgba(107,142,35,0.7)", fontSize: "12px", letterSpacing: "2px", textDecoration: "none", fontFamily: "monospace", display: "inline-flex", alignItems: "center", gap: "6px", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#6b8e23"}
              onMouseLeave={e => e.target.style.color = "rgba(107,142,35,0.7)"}>
              ← BACK TO WEBSITE
            </Link>
          </div>
          {/* Hex logo placeholder */}
          <div
            style={{
              width: 72,
              height: 72,
              margin: "0 auto 1.25rem",
              background: "rgba(107,142,35,0.1)",
              border: "1px solid rgba(107,142,35,0.4)",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(107,142,35,0.2)",
              position: "relative",
            }}
          >
            {/* Corner brackets */}
            {[
              { top: -1, left: -1, borderTop: "2px solid #6b8e23", borderLeft: "2px solid #6b8e23" },
              { top: -1, right: -1, borderTop: "2px solid #6b8e23", borderRight: "2px solid #6b8e23" },
              { bottom: -1, left: -1, borderBottom: "2px solid #6b8e23", borderLeft: "2px solid #6b8e23" },
              { bottom: -1, right: -1, borderBottom: "2px solid #6b8e23", borderRight: "2px solid #6b8e23" },
            ].map((s, i) => (
              <div key={i} style={{ position: "absolute", width: 10, height: 10, ...s }} />
            ))}
            <span style={{ fontSize: "2rem" }}>⬡</span>
          </div>

          <h1
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "1.4rem",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "4px",
              textTransform: "uppercase",
              marginBottom: "0.4rem",
            }}
          >
            DatumOS
          </h1>
          <p
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.6rem",
              color: "#6b8e23",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            BIM Operations Command
          </p>
        </div>

        {/* Login form panel */}
        <div
          style={{
            background: "rgba(13,17,23,0.98)",
            border: "1px solid rgba(107,142,35,0.3)",
            borderRadius: 4,
            padding: "2rem",
            position: "relative",
            boxShadow: "0 0 40px rgba(0,0,0,0.6), 0 0 20px rgba(107,142,35,0.05)",
          }}
        >
          {/* Top accent line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: "linear-gradient(90deg, transparent, #6b8e23, transparent)",
            }}
          />

          {/* Panel header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.75rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid rgba(107,142,35,0.15)",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.7rem",
                  color: "#fff",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                }}
              >
                AUTHENTICATION REQUIRED
              </p>
              <p style={{ fontSize: "0.72rem", color: "#4d584d", marginTop: 2 }}>
                Authorized personnel only
              </p>
            </div>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#a2d033",
                boxShadow: "0 0 8px #a2d033",
              }}
            />
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.6rem",
                  color: "#94a3b8",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Operator ID (Email)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="operator@datum-bim.com"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(107,142,35,0.2)",
                  borderRadius: 2,
                  color: "#f0f2f5",
                  padding: "0.65rem 0.9rem",
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "0.95rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6b8e23")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(107,142,35,0.2)")}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "1.75rem" }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.6rem",
                  color: "#94a3b8",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Access Code
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(107,142,35,0.2)",
                  borderRadius: 2,
                  color: "#f0f2f5",
                  padding: "0.65rem 0.9rem",
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "0.95rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6b8e23")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(107,142,35,0.2)")}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "rgba(255,59,48,0.1)",
                  border: "1px solid rgba(255,59,48,0.3)",
                  borderRadius: 2,
                  padding: "0.65rem 0.9rem",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ color: "#ff3b30", fontSize: "0.75rem" }}>⚠</span>
                <span
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.65rem",
                    color: "#ff3b30",
                    letterSpacing: "1px",
                  }}
                >
                  {error}
                </span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "rgba(85,107,47,0.5)" : "#556b2f",
                border: "1px solid #6b8e23",
                borderRadius: 2,
                color: "#fff",
                padding: "0.75rem",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = "#6b8e23";
                  e.target.style.boxShadow = "0 0 20px rgba(107,142,35,0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.background = "#556b2f";
                  e.target.style.boxShadow = "none";
                }
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  AUTHENTICATING...
                </>
              ) : (
                "INITIATE SESSION"
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid rgba(107,142,35,0.1)",
            }}
          >
            <p
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "0.55rem",
                color: "#4d584d",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "0.75rem",
                textAlign: "center",
              }}
            >
              Demo Access Credentials
            </p>
            {[
              { role: "DIRECTOR", email: "director@datumbim.com", pass: "DatumDir2026!" },
              { role: "MEMBER",   email: "ahmed@datum-bim.com",   pass: "Member@2026!" },
              { role: "CLIENT",   email: "khalid@bagc.ae",        pass: "Client@2026!" },
            ].map((c) => (
              <button
                key={c.role}
                onClick={() => { setEmail(c.email); setPassword(c.pass); }}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(107,142,35,0.1)",
                  borderRadius: 2,
                  padding: "0.5rem 0.75rem",
                  marginBottom: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(107,142,35,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
              >
                <span
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.6rem",
                    color: "#6b8e23",
                    letterSpacing: "1px",
                  }}
                >
                  {c.role}
                </span>
                <span style={{ fontSize: "0.72rem", color: "#4d584d" }}>{c.email}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "0.55rem",
            color: "#4d584d",
            letterSpacing: "1.5px",
          }}
        >
          DATUM STUDIOS ENGINEERING CONSULTANCY · ISO 19650 COMPLIANT
        </p>
      </div>

      <style>{`
        @keyframes blink-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}