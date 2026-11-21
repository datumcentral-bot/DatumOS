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

const STAGES = ["WIP", "Shared", "Published", "Archived"];

export default function BIMProcessorPage() {
  const { data: session } = useSession();
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(null);
  const [newContainer, setNewContainer] = useState({ containerId: "", name: "", stage: "WIP", projectCode: "", author: "", description: "" });
  const [transition, setTransition] = useState({ containerId: "", newStage: "Shared", user: "", reason: "" });

  const fetchData = async () => {
    try {
      const res = await fetch("/api/iso19650");
      const data = await res.json();
      setContainers(data.containers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createContainer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/iso19650", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContainer),
      });
      const data = await res.json();
      setResponse(data);
      setNewContainer({ containerId: "", name: "", stage: "WIP", projectCode: "", author: "", description: "" });
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const transitionStage = async (containerId, newStage, user, reason) => {
    setLoading(true);
    try {
      const res = await fetch("/api/iso19650", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ containerId, newStage, user, reason }),
      });
      const data = await res.json();
      setResponse(data);
      fetchData();
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
        <span style={{ fontSize: "1.5rem" }}>◎</span>
        <div>
          <h1 style={{ fontFamily: MIL.head, fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            ISO 19650 COMPLIANCE
          </h1>
          <p style={{ fontSize: "0.7rem", color: MIL.dim, margin: 0 }}>Information container management per ISO 19650</p>
        </div>
      </div>

      {/* Create Container */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
          CREATE INFORMATION CONTAINER
        </div>
        <form onSubmit={createContainer} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Container ID (e.g., BIM-001)"
            value={newContainer.containerId}
            onChange={(e) => setNewContainer({ ...newContainer, containerId: e.target.value })}
            style={{
              padding: "0.6rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(107,142,35,0.2)",
              borderRadius: 3,
              color: MIL.text,
              fontFamily: MIL.font,
              fontSize: "0.7rem",
            }}
          />
          <input
            type="text"
            placeholder="Container Name"
            value={newContainer.name}
            onChange={(e) => setNewContainer({ ...newContainer, name: e.target.value })}
            style={{
              flex: 1,
              padding: "0.6rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(107,142,35,0.2)",
              borderRadius: 3,
              color: MIL.text,
              fontFamily: MIL.font,
              fontSize: "0.7rem",
            }}
          />
          <select
            value={newContainer.stage}
            onChange={(e) => setNewContainer({ ...newContainer, stage: e.target.value })}
            style={{
              padding: "0.6rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(107,142,35,0.2)",
              borderRadius: 3,
              color: MIL.text,
              fontFamily: MIL.font,
              fontSize: "0.7rem",
            }}
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s} - {s === "WIP" ? "Work in Progress" : s === "Shared" ? "Shared (Coordination)" : s === "Published" ? "Published (For Approval)" : "Archived"}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Project Code"
            value={newContainer.projectCode}
            onChange={(e) => setNewContainer({ ...newContainer, projectCode: e.target.value })}
            style={{
              padding: "0.6rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(107,142,35,0.2)",
              borderRadius: 3,
              color: MIL.text,
              fontFamily: MIL.font,
              fontSize: "0.7rem",
            }}
          />
          <input
            type="text"
            placeholder="Author Email"
            value={newContainer.author}
            onChange={(e) => setNewContainer({ ...newContainer, author: e.target.value })}
            style={{
              padding: "0.6rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(107,142,35,0.2)",
              borderRadius: 3,
              color: MIL.text,
              fontFamily: MIL.font,
              fontSize: "0.7rem",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.6rem 1rem",
              background: MIL.green,
              border: "none",
              borderRadius: 3,
              color: "#fff",
              fontFamily: MIL.head,
              fontSize: "0.7rem",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            CREATE CONTAINER
          </button>
        </form>
      </div>

      {/* Containers List */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
          INFORMATION CONTAINERS
        </div>
        <div style={{ background: "rgba(16,20,26,0.8)", border: `1px solid ${MIL.border}`, borderRadius: 4, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "1rem", color: MIL.green, fontFamily: MIL.head, fontSize: "0.7rem" }}>
              Loading containers...
            </div>
          ) : containers.length === 0 ? (
            <div style={{ padding: "1rem", color: MIL.dim, fontFamily: MIL.font, fontSize: "0.7rem" }}>
              No containers found
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
              <thead>
                <tr>
                  <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Container ID</th>
                  <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Name</th>
                  <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Stage</th>
                  <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Discipline</th>
                  <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Project Code</th>
                  <th style={{ padding: "0.3rem", textAlign: "left", color: "#94a3b8" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {containers.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{c.id}</td>
                    <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{c.name}</td>
                    <td style={{ padding: "0.3rem", textAlign: "center", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{c.stage}</td>
                    <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{c.discipline || "—"}</td>
                    <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.7rem" }}>{c.projectCode}</td>
                    <td style={{ padding: "0.3rem", textAlign: "center" }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: c.active ? MIL.green : MIL.red,
                          display: "inline-block",
                          marginRight: "0.5rem",
                        }}
                      />
                      {c.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Transition Stage */}
      <div>
        <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
          STAGE TRANSITION
        </div>
        <div style={{ background: "rgba(16,20,26,0.6)", border: `1px solid ${MIL.border}`, borderRadius: 4, padding: "1rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: "0.25rem" }}>Container ID</label>
            <input
              type="text"
              placeholder="e.g., BIM-001"
              value={transition.containerId}
              onChange={(e) => setTransition({ ...transition, containerId: e.target.value })}
              style={{
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
          <div style={{ marginBottom: "0.5rem", display: "flex", gap: "0.5rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: "0.25rem" }}>New Stage</label>
              <select
                value={transition.newStage}
                onChange={(e) => setTransition({ ...transition, newStage: e.target.value })}
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
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: "0.25rem" }}>User</label>
              <input
                type="text"
                placeholder="user@datum.com"
                value={transition.user}
                onChange={(e) => setTransition({ ...transition, user: e.target.value })}
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
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: "0.25rem" }}>Reason</label>
            <input
              type="text"
              placeholder="Reason for stage change"
              value={transition.reason}
              onChange={(e) => setTransition({ ...transition, reason: e.target.value })}
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
            onClick={() => transitionStage(transition.containerId, transition.newStage, transition.user, transition.reason)}
            disabled={loading || !transition.containerId || !transition.user}
            style={{
              padding: "0.6rem 1rem",
              background: MIL.green,
              border: "none",
              borderRadius: 3,
              color: "#fff",
              fontFamily: MIL.head,
              fontSize: "0.7rem",
              fontWeight: 700,
              cursor: loading || !transition.containerId || !transition.user ? "not-allowed" : "pointer",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            TRANSITION STAGE
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
