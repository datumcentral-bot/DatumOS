"use client";

import { useState, useEffect, useCallback } from "react";
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
  red: "#ff3b30",
  font: "'Rajdhani', sans-serif",
  head: "'Orbitron', sans-serif",
};

export default function RevitMCPPage() {
  const { data: session } = useSession();
  const [serverState, setServerState] = useState({
    status: "STOPPED",
    port: 8081,
    host: "localhost",
    startedAt: null,
    clientId: null,
  });
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(null);

  const fetchState = async () => {
    try {
      const res = await fetch("/api/revit/mcp?action=status");
      const data = await res.json();
      setServerState(data.server || data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const controlServer = async (action) => {
    try {
      const res = await fetch(`/api/revit/mcp?action=${action}`, { method: "POST" });
      const data = await res.json();
      setResponse(data);
      setServerState(data.server || data);
    } catch (e) {
      console.error(e);
    }
  };

  const connectClient = async () => {
    try {
      const res = await fetch(`/api/revit/mcp?action=connect`, { method: "POST" });
      const data = await res.json();
      setResponse(data);
      setServerState((prev) => ({ ...prev, clientId: data.clientId }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchState();
    const iv = setInterval(fetchState, 10000);
    return () => clearInterval(iv);
  }, []);

  const statusColor = serverState.status === "RUNNING" ? MIL.green : serverState.status === "STARTING" ? MIL.gold : MIL.red;

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
        <span style={{ fontSize: "1.5rem" }}>◈</span>
        <div>
          <h1 style={{ fontFamily: MIL.head, fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            REVIT MCP SERVER
          </h1>
          <p style={{ fontSize: "0.7rem", color: MIL.dim, margin: 0 }}>Revit Bridge Control Portal</p>
        </div>
      </div>

      {/* Server Status */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: serverState.status === "RUNNING" ? MIL.green : serverState.status === "STARTING" ? MIL.gold : MIL.red,
              boxShadow: `0 0 8px ${serverState.status === "RUNNING" ? MIL.green : MIL.red}`,
            }}
          />
          <span style={{ fontFamily: MIL.head, fontSize: "0.75rem", fontWeight: 700, color: "#fff" }}>
            MCP SERVER {serverState.status === "RUNNING" ? "ONLINE" : serverState.status === "STARTING" ? "STARTING" : "OFFLINE"}
          </span>
        </div>
        <div style={{ marginTop: "0.5rem", fontSize: "0.65rem", color: MIL.dim }}>
          Host: {serverState.host} &nbsp;|&nbsp; Port: {serverState.port} &nbsp;|&nbsp; Client: {serverState.clientId || "None"} &nbsp;|&nbsp;
          Started: {serverState.startedAt ? new Date(serverState.startedAt).toLocaleTimeString() : "—"}
        </div>
      </div>

      {/* Controls */}
      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          onClick={() => controlServer("start")}
          disabled={serverState.status === "RUNNING"}
          style={{
            padding: "0.6rem 1rem",
            background: serverState.status === "RUNNING" ? "rgba(107,142,35,0.2)" : MIL.green,
            border: `1px solid ${MIL.green}`,
            borderRadius: 3,
            color: "#fff",
            fontFamily: MIL.head,
            fontSize: "0.7rem",
            fontWeight: 700,
            cursor: serverState.status === "RUNNING" ? "not-allowed" : "pointer",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          START MCP SERVER
        </button>
        <button
          onClick={() => controlServer("stop")}
          disabled={serverState.status !== "RUNNING"}
          style={{
            padding: "0.6rem 1rem",
            background: serverState.status === "STOPPED" ? "rgba(255,59,48,0.2)" : MIL.red,
            border: `1px solid ${MIL.red}`,
            borderRadius: 3,
            color: "#fff",
            fontFamily: MIL.head,
            fontSize: "0.7rem",
            fontWeight: 700,
            cursor: serverState.status !== "RUNNING" ? "not-allowed" : "pointer",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          STOP MCP SERVER
        </button>
        <button
          onClick={connectClient}
          disabled={serverState.status !== "RUNNING"}
          style={{
            padding: "0.6rem 1rem",
            background: "rgba(76,201,240,0.1)",
            border: "1px solid #4cc9f0",
            borderRadius: 3,
            color: "#4cc9f0",
            fontFamily: MIL.head,
            fontSize: "0.7rem",
            fontWeight: 700,
            cursor: serverState.status !== "RUNNING" ? "not-allowed" : "pointer",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          CONNECT CLIENT
        </button>
        <button
          onClick={() => setResponse(null)}
          style={{
            padding: "0.6rem 1rem",
            background: "rgba(16,20,26,0.8)",
            border: `1px solid ${MIL.border}`,
            borderRadius: 3,
            color: MIL.text,
            fontFamily: MIL.head,
            fontSize: "0.7rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          CLEAR
        </button>
      </div>

      {/* Response */}
      {response && (
        <div
          style={{
            background: "rgba(16,20,26,0.8)",
            border: `1px solid ${MIL.border}`,
            borderRadius: 4,
            padding: "1rem",
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

      {/* Endpoint Documentation */}
      <div style={{ marginTop: "1.5rem", background: "rgba(16,20,26,0.6)", border: `1px solid ${MIL.border}`, borderRadius: 4, padding: "1rem" }}>
        <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>API ENDPOINTS</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "0.3rem", color: "#94a3b8" }}>METHOD</th>
              <th style={{ textAlign: "left", padding: "0.3rem", color: "#94a3b8" }}>ENDPOINT</th>
              <th style={{ textAlign: "left", padding: "0.3rem", color: "#94a3b8" }}>DESCRIPTION</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "0.3rem", color: "#4cc9f0" }}>GET</td>
              <td style={{ padding: "0.3rem", fontFamily: MIL.font, color: "#cbd5e1" }}>/api/revit/mcp?action=status</td>
              <td style={{ padding: "0.3rem", color: "#94a3b8" }}>Get MCP server status</td>
            </tr>
            <tr>
              <td style={{ padding: "0.3rem", color: "#6b8e23" }}>POST</td>
              <td style={{ padding: "0.3rem", fontFamily: MIL.font, color: "#cbd5e1" }}>/api/revit/mcp?action=start</td>
              <td style={{ padding: "0.3rem", color: "#94a3b8" }}>Start MCP server</td>
            </tr>
            <tr>
              <td style={{ padding: "0.3rem", color: "#ff3b30" }}>POST</td>
              <td style={{ padding: "0.3rem", fontFamily: MIL.font, color: "#cbd5e1" }}>/api/revit/mcp?action=stop</td>
              <td style={{ padding: "0.3rem", color: "#94a3b8" }}>Stop MCP server</td>
            </tr>
            <tr>
              <td style={{ padding: "0.3rem", color: "#4cc9f0" }}>POST</td>
              <td style={{ padding: "0.3rem", fontFamily: MIL.font, color: "#cbd5e1" }}>/api/revit/mcp?action=connect</td>
              <td style={{ padding: "0.3rem", color: "#94a3b8" }}>Connect web client</td>
            </tr>
            <tr>
              <td style={{ padding: "0.3rem", color: "#ff3b30" }}>POST</td>
              <td style={{ padding: "0.3rem", fontFamily: MIL.font, color: "#cbd5e1" }}>/api/revit/mcp?action=disconnect</td>
              <td style={{ padding: "0.3rem", color: "#94a3b8" }}>Disconnect web client</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
