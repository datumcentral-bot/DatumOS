"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const SERVICES = [
  { icon: "◈", title: "BIM Coordination", desc: "ISO 19650 compliant 3D coordination, clash detection, and model management across all disciplines." },
  { icon: "◆", title: "Structural BIM", desc: "Detailed structural modeling with LOD 350-500 deliverables for complex engineering projects." },
  { icon: "◉", title: "MEP Coordination", desc: "Mechanical, Electrical & Plumbing coordination with full clash resolution workflows." },
  { icon: "◇", title: "CDE Management", desc: "Common Data Environment setup and management per ISO 19650 information management standards." },
  { icon: "⊞", title: "QA/QC Gate", desc: "Rigorous quality assurance and control processes ensuring deliverable compliance at every stage." },
  { icon: "⊕", title: "Digital Twin", desc: "Asset information models and digital twin delivery for facilities management and operations." },
];

const STATS = [
  { value: "150+", label: "PROJECTS DELIVERED" },
  { value: "12+", label: "YEARS EXPERIENCE" },
  { value: "ISO 19650", label: "CERTIFIED STANDARD" },
  { value: "99.2%", label: "CLIENT SATISFACTION" },
];

export default function HomePage() {
  const [tick, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const now = mounted ? new Date() : new Date(0);
  const timeStr = mounted ? now.toLocaleTimeString("en-US", { hour12: false }) : "--:--:--";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e14", color: "#f0f2f5", fontFamily: "'Rajdhani', sans-serif" }}>
      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, height: 64, background: "rgba(10,14,20,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(107,142,35,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 3rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 36, height: 36, background: "rgba(107,142,35,0.15)", border: "1px solid rgba(107,142,35,0.4)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", boxShadow: "0 0 10px rgba(107,142,35,0.2)" }}>⬡</div>
          <div>
            <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.9rem", fontWeight: 800, color: "#fff", letterSpacing: "2px" }}>DATUM BIM</p>
            <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.5rem", color: "#6b8e23", letterSpacing: "2px" }}>ISO 19650 COMPLIANT</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          {[["About", "/about"], ["Services", "/services"], ["Projects", "/projects"], ["Contact", "/contact"]].map(([label, href]) => (
            <Link key={href} href={href} style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", color: "#94a3b8", letterSpacing: "1.5px", textDecoration: "none", textTransform: "uppercase", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#6b8e23"}
              onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
            >{label}</Link>
          ))}
          <Link href="/login" style={{ background: "rgba(107,142,35,0.15)", border: "1px solid rgba(107,142,35,0.4)", borderRadius: 2, color: "#fff", padding: "0.45rem 1rem", fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "1.5px", textDecoration: "none", textTransform: "uppercase", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(107,142,35,0.25)"; e.currentTarget.style.boxShadow = "0 0 15px rgba(107,142,35,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(107,142,35,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
          >PORTAL ACCESS</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "4rem 3rem" }}>
        {/* Radial glow */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(107,142,35,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Corner brackets */}
        {[{top:40,left:40,bt:true,bl:true},{top:40,right:40,bt:true,br:true},{bottom:40,left:40,bb:true,bl:true},{bottom:40,right:40,bb:true,br:true}].map((pos,i) => (
          <div key={i} style={{ position: "absolute", width: 50, height: 50, ...pos, borderTop: pos.bt ? "1px solid rgba(107,142,35,0.3)" : "none", borderLeft: pos.bl ? "1px solid rgba(107,142,35,0.3)" : "none", borderBottom: pos.bb ? "1px solid rgba(107,142,35,0.3)" : "none", borderRight: pos.br ? "1px solid rgba(107,142,35,0.3)" : "none", pointerEvents: "none" }} />
        ))}

        <div style={{ textAlign: "center", maxWidth: 900, position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(107,142,35,0.1)", border: "1px solid rgba(107,142,35,0.3)", borderRadius: 2, padding: "0.4rem 1rem", marginBottom: "2rem" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a2d033", boxShadow: "0 0 6px #a2d033", display: "inline-block" }} />
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.6rem", color: "#a2d033", letterSpacing: "2px" }}>ISO 19650 CERTIFIED · SYSTEM ONLINE · {timeStr}</span>
          </div>

          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, color: "#fff", letterSpacing: "4px", textTransform: "uppercase", lineHeight: 1.1, marginBottom: "1.5rem" }}>
            DATUM BIM<br />
            <span style={{ color: "#6b8e23" }}>ENGINEERING</span>
          </h1>

          <p style={{ fontSize: "1.1rem", color: "#94a3b8", maxWidth: 600, margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
            ISO 19650 compliant BIM management platform for engineering consultancy. 
            Precision-engineered for complex infrastructure and building projects.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login" style={{ background: "#556b2f", border: "1px solid #6b8e23", borderRadius: 2, color: "#fff", padding: "0.85rem 2rem", fontFamily: "'Orbitron', sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "2px", textDecoration: "none", textTransform: "uppercase", transition: "all 0.3s", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#6b8e23"; e.currentTarget.style.boxShadow = "0 0 25px rgba(107,142,35,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#556b2f"; e.currentTarget.style.boxShadow = "none"; }}
            >◈ ACCESS PORTAL</Link>
            <Link href="/services" style={{ background: "transparent", border: "1px solid rgba(107,142,35,0.3)", borderRadius: 2, color: "#94a3b8", padding: "0.85rem 2rem", fontFamily: "'Orbitron', sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "2px", textDecoration: "none", textTransform: "uppercase", transition: "all 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(107,142,35,0.6)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(107,142,35,0.3)"; e.currentTarget.style.color = "#94a3b8"; }}
            >VIEW CAPABILITIES</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "3rem", borderTop: "1px solid rgba(107,142,35,0.15)", borderBottom: "1px solid rgba(107,142,35,0.15)", background: "rgba(107,142,35,0.03)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem" }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "2rem", fontWeight: 900, color: "#6b8e23", letterSpacing: "2px", marginBottom: "0.5rem" }}>{s.value}</p>
              <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.6rem", color: "#4d584d", letterSpacing: "2px", textTransform: "uppercase" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section style={{ padding: "5rem 3rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.6rem", color: "#6b8e23", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "0.75rem" }}>CAPABILITIES</p>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "#fff", letterSpacing: "3px", textTransform: "uppercase" }}>BIM SERVICES</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {SERVICES.map(s => (
              <div key={s.title} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(107,142,35,0.15)", borderRadius: 4, padding: "1.75rem", transition: "all 0.3s", position: "relative" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(107,142,35,0.4)"; e.currentTarget.style.background = "rgba(107,142,35,0.05)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(107,142,35,0.15)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, width: 12, height: 12, borderTop: "1px solid #6b8e23", borderLeft: "1px solid #6b8e23", opacity: 0.5 }} />
                <div style={{ fontSize: "1.5rem", color: "#6b8e23", marginBottom: "1rem" }}>{s.icon}</div>
                <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.8rem", fontWeight: 700, color: "#fff", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "0.75rem" }}>{s.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "5rem 3rem", background: "rgba(107,142,35,0.04)", borderTop: "1px solid rgba(107,142,35,0.15)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "#fff", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "1rem" }}>READY TO DEPLOY?</h2>
          <p style={{ fontSize: "0.95rem", color: "#94a3b8", marginBottom: "2rem", lineHeight: 1.7 }}>Access the DatumOS platform to manage your BIM projects with military-grade precision.</p>
          <Link href="/login" style={{ background: "#556b2f", border: "1px solid #6b8e23", borderRadius: 2, color: "#fff", padding: "0.85rem 2.5rem", fontFamily: "'Orbitron', sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "2px", textDecoration: "none", textTransform: "uppercase", transition: "all 0.3s", display: "inline-block" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#6b8e23"; e.currentTarget.style.boxShadow = "0 0 25px rgba(107,142,35,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#556b2f"; e.currentTarget.style.boxShadow = "none"; }}
          >INITIATE SESSION →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "2rem 3rem", borderTop: "1px solid rgba(107,142,35,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.55rem", color: "#4d584d", letterSpacing: "1.5px" }}>DATUM STUDIOS ENGINEERING CONSULTANCY · ISO 19650 COMPLIANT</p>
        <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.55rem", color: "#4d584d", letterSpacing: "1px" }}>DatumOS v9 · {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
