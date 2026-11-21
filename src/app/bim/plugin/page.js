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

export default function BIMPluginPage() {
  const { data: session } = useSession();
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/bim/plugin?action=plugins");
      const data = await res.json();
      setPlugins(data.plugins || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createContainer = async (containerId, name, discipline, phase, metadata) => {
    setLoading(true);
    try {
      const res = await fetch("/api/bim/plugin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_container", containerId, name, discipline, phase, metadata }),
      });
      const data = await res.json();
      setResponse(data);
      setLoading(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ padding: "1.5rem", maxWidth: "900px", margin: "0 auto", fontFamily: MIL.font, color: MIL.text }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          paddingBottom: "1rem",
          borderBottom: `1px solid ${MIL.border}`,
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>⬢</span>
        <div>
          <h1 style={{ fontFamily: MIL.head, fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            BIM PLUGIN
          </h1>
          <p style={{ fontSize: "0.7rem", color: MIL.dim, margin: 0 }}">BIM Plugin - ISO 19650 Information Container Management</p>
        </div>
      </div>

      {/* Plugin Info */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ background: "rgba(16,20,26,0.8)", border: `1px solid ${MIL.border}`, borderRadius: 4, padding: "1rem" }}>
          <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
            PLUGIN INFORMATION
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", marginBottom: "0.25rem" }}>Name</div>
              <div style={{ color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>BIM Plugin</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", marginBottom: "0.25rem" }}>Version</div>
              <div style={{ color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>1.0.0</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", marginBottom: "0.25rem" }}>Description</div>
              <div style={{ color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>BIM Operations - ISO 19650 Compliance</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", marginBottom: "0.25rem" }}>Status</div>
              <div style={{ color: MIL.green, fontFamily: MIL.font, fontSize: "0.7rem", fontWeight: 600 }}>ACTIVE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Tools */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
          AVAILABLE TOOLS
        </div>
        <div style={{ background: "rgba(16,20,26,0.8)", border: `1px solid ${MIL.border}`, borderRadius: 4, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
            <thead>
              <tr>
                <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Tool Name</th>
                <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Description</th>
                <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Parameters</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "iso19650_compliance", description: "Check ISO 19650 compliance for a container", params: "container_id" },
                { name: "create_container", description: "Create new ISO 19650 information container", params: "name, discipline, phase, metadata" },
                { name: "audit_trail", description: "Get audit trail for a container", params: "container_id" },
              ].map((t) => (
                <tr key={t.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{t.name}</td>
                  <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{t.description}</td>
                  <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{t.params}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Container */}
      <div>
        <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
          CREATE INFORMATION CONTAINER
        </div>
        <div style={{ background: "rgba(16,20,26,0.6)", border: `1px solid ${MIL.border}`, borderRadius: 4, padding: "1rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: "0.25rem" }}>Container ID</label>
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
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: "0.25rem" }}>Name</label>
            <input
              type="text"
              placeholder="e.g., Architectural Model"
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
            <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: "0.25rem" }}>Discipline</label>
            <input
              type="text"
              placeholder="e.g., Architecture"
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
            <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: "0.25rem" }}>Phase</label>
            <input
              type="text"
              placeholder="e.g., P1"
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
            <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: "0.25rem" }}>Metadata (JSON)</label>
            <input
              type="text"
              placeholder='e.g., {"client": "XYZ Corp", "location": "Karachi"}'
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
            CREATE CONTAINER
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
