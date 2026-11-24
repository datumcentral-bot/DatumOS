"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const MIL = {
  bg: "#0a0e14",
  panel: "rgba(10,14,20,0.97)",
  border: "rgba(107,142,35,0.3)",
  green: "#6b8e23",
  gold: "#c19749",
  text: "#f0f2f5",
  dim: "#8a9bb0",
  blue: "#4a9eff",
  font: "'Rajdhani', sans-serif",
  head: "'Orbitron', sans-serif",
};

export default function AuditTrailPage() {
  const { data: session } = useSession();
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/audit/trail");
      const data = await res.json();
      setAudit(data.audit || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (action, user, details, containerId) => {
    setLoading(true);
    try {
      const res = await fetch("/api/audit/trail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, user, details, containerId }),
      });
      const data = await res.json();
      setResponse(data);
      setAudit([data.audit, ...setAudit]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 30000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1000px", margin: "0 auto", fontFamily: MIL.font, color: MIL.text }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          paddingBottom: "1rem",
          borderBottom: `1px solid ${MIL.border}`,
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>⌗</span>
        <div>
          <h1 style={{ fontFamily: MIL.head, fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            AUDIT TRAIL
          </h1>
          <p style={{ fontSize: "0.7rem", color: MIL.dim, margin: 0 }}>BIM Action History & Event Log</p>
        </div>
      </div>

      {/* Action Log */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
          AUDIT LOG ENTRIES
        </div>
        <div style={{ background: "rgba(16,20,26,0.8)", border: `1px solid ${MIL.border}`, borderRadius: 4, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "1rem", color: MIL.green, fontFamily: MIL.head, fontSize: "0.7rem" }}>
              Loading audit trail...
            </div>
          ) : audit.length === 0 ? (
            <div style={{ padding: "1rem", color: MIL.dim, fontFamily: MIL.font, fontSize: "0.7rem" }}>
              No audit records found
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
              <thead>
                <tr>
                  <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Timestamp</th>
                  <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Action</th>
                  <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>User</th>
                  <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((a) => (
                  <tr key={a.timestamp} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{new Date(a.timestamp).toLocaleString()}</td>
                    <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{a.action}</td>
                    <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{a.user}</td>
                    <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{a.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Audit Entry */}
      <div>
        <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
          ADD AUDIT ENTRY
        </div>
        <div style={{ background: "rgba(16,20,26,0.6)", border: `1px solid ${MIL.border}`, borderRadius: 4, padding: "1rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: "0.25rem" }}>Action</label>
            <input
              type="text"
              placeholder="e.g., create_container, transition, publish_container"
              style={{
                width: "100%",
                padding: "0.6rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(107,142,35,0.2)",
                borderRadius: 3,
                color: MIL.text,
                fontFamily: MIL.font,
                fontSize: "0.7rem",
              }}
            />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: "0.25rem" }}>User</label>
            <input
              type="text"
              placeholder="e.g., director@datumbim.com"
              style={{
                width: "100%",
                padding: "0.6rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(107,142,35,0.2)",
                borderRadius: 3,
                color: MIL.text,
                fontFamily: MIL.font,
                fontSize: "0.7rem",
              }}
            />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: "0.25rem" }}>Details</label>
            <input
              type="text"
              placeholder="e.g., Container BIM-001 created at stage WIP"
              style={{
                width: "100%",
                padding: "0.6rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(107,142,35,0.2)",
                borderRadius: 3,
                color: MIL.text,
                fontFamily: MIL.font,
                fontSize: "0.7rem",
              }}
            />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: "0.25rem" }}>Container ID (optional)</label>
            <input
              type="text"
              placeholder="e.g., BIM-001"
              style={{
                width: "100%",
                padding: "0.6rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(107,142,35,0.2)",
                borderRadius: 3,
                color: MIL.text,
                fontFamily: MIL.font,
                fontSize: "0.7rem",
              }}
            />
          </div>
          <button
            style={{
              padding: "0.6rem 1rem",
              background: MIL.green,
              border: "none",
              borderRadius: 3,
              color: "#fff",
              fontFamily: MIL.head,
              fontSize: "0.7rem",
              fontWeight: 700,
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            LOG AUDIT ENTRY
          </button>
        </div>
      </div>

      {response && (
        <div
          style={{
            background: "rgba(16,20,26,0.8)",
            border: `1px solid ${MIL.border}`,
            borderRadius: 4,
            padding: "1rem",
            marginTop: "1.5rem",
            fontFamily: MIL.font,
            fontSize: "0.7rem",
            color: MIL.text,
          }}
        >
          <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
            RESPONSE
          </div>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.65rem", lineHeight: 1.5 }}>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
