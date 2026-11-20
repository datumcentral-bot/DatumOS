"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSocketContext } from "@/lib/SocketContext";

function getActiveSectionLabel(navSections, pathname) {
  for (const section of navSections) {
    if (section.items && section.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"))) {
      return section.label;
    }
  }
  return navSections[0]?.label || null;
}

export default function PortalShell({ navSections, portalLabel, portalColor = "#6b8e23", children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { isConnected } = useSocketContext();
  const [collapsed, setCollapsed] = useState(false);
  const [openSection, setOpenSection] = useState(() => getActiveSectionLabel(navSections, pathname || ""));
  const [tick, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);
  // Track previous pathname to detect cross-section navigation
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Only auto-expand when navigating to a DIFFERENT section — never collapse current
  useEffect(() => {
    const prev = prevPathnameRef.current;
    prevPathnameRef.current = pathname;
    if (prev === pathname) return; // same page, no change needed

    const activeLabel = getActiveSectionLabel(navSections, pathname || "");
    if (!activeLabel) return;

    setOpenSection((current) => {
      // If the active link is inside the currently open section, keep it open
      const currentSection = navSections.find((s) => s.label === current);
      if (currentSection && currentSection.items && currentSection.items.some(
        (item) => pathname === item.href || pathname.startsWith(item.href + "/")
      )) {
        return current; // stay open — link is inside current group
      }
      // Otherwise open the section that contains the active link
      return activeLabel;
    });
  }, [pathname, navSections]);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0e14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Orbitron', sans-serif", color: "#6b8e23", fontSize: "0.8rem", letterSpacing: "2px" }}>
        SYNCHRONIZING...
      </div>
    );
  }

  const now = mounted ? new Date() : new Date(0);
  const timeStr = mounted ? now.toLocaleTimeString("en-US", { hour12: false }) : "--:--:--";
  const glowColor = portalColor;
  const glowBg = `${portalColor}18`;
  const glowBorder = `${portalColor}40`;

  // Toggle: clicking header opens/closes that section (accordion — only one open at a time)
  const toggleSection = (label) => {
    if (collapsed) return;
    setOpenSection((prev) => (prev === label ? null : label));
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: "#0a0e14", fontFamily: "'Rajdhani', sans-serif", color: "#f0f2f5" }}>
      {/* Sidebar */}
      <aside style={{ width: collapsed ? 56 : 260, background: "rgba(13,17,23,0.98)", borderRight: "1px solid rgba(107,142,35,0.15)", display: "flex", flexDirection: "column", zIndex: 100, flexShrink: 0, transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: collapsed ? "1rem 0.5rem" : "1.25rem 1.25rem", borderBottom: "1px solid rgba(107,142,35,0.15)", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between" }}>
          {!collapsed && (
            <div>
              <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.75rem", fontWeight: 800, color: "#fff", letterSpacing: "2px" }}>DatumBIM</p>
              <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.5rem", color: glowColor, letterSpacing: "1.5px", marginTop: 2 }}>{portalLabel}</p>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: "none", border: "none", color: "#4d584d", cursor: "pointer", fontSize: "0.8rem", padding: 4, flexShrink: 0 }}>
            {collapsed ? "▶" : "◀"}
          </button>
        </div>

        {/* Nav — accordion */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "0.5rem 0.4rem" }}>
          {navSections.map((section) => {
            const isOpen = !collapsed && openSection === section.label;
            const hasActive = section.items && section.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
            const isSingleSection = navSections.length === 1;

            return (
              <div key={section.label} style={{ marginBottom: "2px" }}>
                {/* Section header — clickable toggle */}
                {!isSingleSection ? (
                  <button
                    onClick={() => toggleSection(section.label)}
                    title={collapsed ? section.label : undefined}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", padding: collapsed ? "0.6rem" : "0.5rem 0.6rem", background: hasActive ? `${glowColor}10` : "transparent", border: "none", borderRadius: 3, cursor: collapsed ? "default" : "pointer", transition: "background 0.2s", gap: "0.4rem" }}
                  >
                    {collapsed ? (
                      <span style={{ fontSize: "0.7rem", color: hasActive ? glowColor : "#4d584d" }}>{section.label.charAt(0)}</span>
                    ) : (
                      <>
                        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.5rem", color: hasActive ? glowColor : "#4d584d", textTransform: "uppercase", letterSpacing: "2px", fontWeight: 700, textAlign: "left" }}>{section.label}</span>
                        <span style={{ fontSize: "0.55rem", color: hasActive ? glowColor : "#4d584d", transition: "transform 0.25s", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", flexShrink: 0 }}>▶</span>
                      </>
                    )}
                  </button>
                ) : (
                  !collapsed && (
                    <p style={{ padding: "0.5rem 0.6rem 0.25rem", fontFamily: "'Orbitron', sans-serif", fontSize: "0.5rem", color: "#4d584d", textTransform: "uppercase", letterSpacing: "2px", fontWeight: 700 }}>
                      {section.label}
                    </p>
                  )
                )}

                {/* Items — animated for multi-section, always visible for single */}
                <div style={{
                  overflow: "hidden",
                  maxHeight: isSingleSection || isOpen || collapsed ? `${(section.items?.length || 0) * 44}px` : "0px",
                  transition: isSingleSection ? "none" : "max-height 0.3s cubic-bezier(0.4,0,0.2,1)",
                  opacity: isSingleSection || isOpen || collapsed ? 1 : 0,
                }}>
                  {(section.items || []).map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6rem",
                          padding: collapsed ? "0.6rem" : isSingleSection ? "0.55rem 0.7rem" : "0.5rem 0.7rem 0.5rem 1.1rem",
                          justifyContent: collapsed ? "center" : "flex-start",
                          color: isActive ? glowColor : "#94a3b8",
                          textDecoration: "none",
                          borderRadius: 2,
                          marginBottom: 1,
                          background: isActive ? glowBg : "transparent",
                          boxShadow: isActive ? `inset 3px 0 0 ${glowColor}` : "none",
                          transition: "all 0.15s",
                          fontSize: "0.8rem",
                          fontFamily: "'Rajdhani', sans-serif",
                          fontWeight: isActive ? 600 : 400,
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = glowBg; e.currentTarget.style.color = "#fff"; } }}
                        onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; } }}
                        title={collapsed ? item.label : undefined}
                      >
                        <span style={{ fontSize: "0.8rem", flexShrink: 0, filter: isActive ? `drop-shadow(0 0 4px ${glowColor})` : "none" }}>{item.icon}</span>
                        {!collapsed && item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: collapsed ? "0.75rem 0.4rem" : "0.75rem 0.75rem", borderTop: "1px solid rgba(107,142,35,0.15)" }}>
          {!collapsed && session && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
              <div style={{ width: 26, height: 26, borderRadius: 2, background: glowBg, border: `1px solid ${glowBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Orbitron', sans-serif", fontSize: "0.6rem", color: glowColor, flexShrink: 0 }}>
                {session.user?.name?.charAt(0) || "?"}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.55rem", color: "#fff", letterSpacing: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {session.user?.name?.toUpperCase() || "OPERATOR"}
                </p>
                <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.45rem", color: glowColor, letterSpacing: "1px" }}>
                  {session.user?.role || "MEMBER"}
                </p>
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: "4px" }}>
            <Link href="/console" style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2, color: "#94a3b8", padding: "0.4rem", fontFamily: "'Orbitron', sans-serif", fontSize: "0.55rem", letterSpacing: "1px", cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }} title="Console">
              ⬡
            </Link>
            <button onClick={() => signOut({ callbackUrl: "/login" })} style={{ flex: 1, background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.2)", borderRadius: 2, color: "#ff3b30", padding: "0.4rem", fontFamily: "'Orbitron', sans-serif", fontSize: "0.55rem", letterSpacing: "1px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="End Session">
              ⏻
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <header style={{ height: 56, background: "rgba(10,14,20,0.9)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(107,142,35,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", flexShrink: 0, position: "relative" }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${glowColor}40, transparent)` }} />
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link href="/console" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.55rem", color: "#4d584d", letterSpacing: "1px", textDecoration: "none" }}>CONSOLE</Link>
            <span style={{ color: "rgba(107,142,35,0.3)" }}>›</span>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", color: "#fff", letterSpacing: "1px" }}>{portalLabel}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.6rem", color: glowColor, letterSpacing: "2px" }}>{timeStr}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#a2d033", boxShadow: "0 0 5px #a2d033", display: "inline-block" }} />
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.5rem", color: "#a2d033", letterSpacing: "1px" }}>ONLINE</span>
            </div>
            {session && (
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.6rem", color: glowColor, letterSpacing: "1px" }}>
                {session.user?.name?.split(" ")[0]?.toUpperCase() || "USER"}
              </span>
            )}
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
