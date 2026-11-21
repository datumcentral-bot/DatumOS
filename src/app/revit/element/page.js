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

export default function RevitElementInspector() {
  const { data: session } = useSession();
  const [elementId, setElementId] = useState("");
  const [elementData, setElementData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchElement = async () => {
    if (!elementId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/revit/element?elementId=${encodeURIComponent(elementId)}`);
      const data = await res.json();
      setElementData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateElement = async (parameterName, parameterValue) => {
    try {
      const res = await fetch("/api/revit/element", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elementId, parameterName, parameterValue }),
      });
      const data = await res.json();
      alert(data.message || "Element updated successfully");
    } catch (e) {
      alert(e.message || "Update failed");
    }
  };

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
            REVIT ELEMENT INSPECTOR
          </h1>
          <p style={{ fontSize: "0.7rem", color: MIL.dim, margin: 0 }}>Inspect and modify Revit element properties</p>
        </div>
      </div>

      {/* Element Lookup */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Enter Element ID (e.g., 12345)"
            value={elementId}
            onChange={(e) => setElementId(e.target.value)}
            style={{
              flex: 1,
              padding: "0.6rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(107,142,35,0.2)",
              borderRadius: 3,
              color: MIL.text,
              fontFamily: MIL.font,
              fontSize: "0.75rem",
            }}
          />
          <button
            onClick={fetchElement}
            disabled={loading || !elementId}
            style={{
              padding: "0.6rem 1rem",
              background: MIL.green,
              border: "none",
              borderRadius: 3,
              color: "#fff",
              fontFamily: MIL.head,
              fontSize: "0.7rem",
              fontWeight: 700,
              cursor: loading || !elementId ? "not-allowed" : "pointer",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            INSPECT
          </button>
        </div>
        {loading && <div style={{ marginTop: "0.5rem", fontSize: "0.65rem", color: MIL.green }}>Loading element data...</div>}
        {error && <div style={{ marginTop: "0.5rem", fontSize: "0.65rem", color: MIL.red }}>{error}</div>}
      </div>

      {/* Element Details */}
      {elementData && (
        <div
          style={{
            background: "rgba(16,20,26,0.8)",
            border: `1px solid ${MIL.border}`,
            borderRadius: 4,
            padding: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
            ELEMENT DETAILS
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
            <tbody>
              <tr>
                <td style={{ padding: "0.3rem", color: "#94a3b8", width: "30%" }}>Element ID</td>
                <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font }}>{elementData.id}</td>
              </tr>
              <tr>
                <td style={{ padding: "0.3rem", color: "#94a3b8" }}>Category</td>
                <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font }}>{elementData.category}</td>
              </tr>
              <tr>
                <td style={{ padding: "0.3rem", color: "#94a3b8" }}>Name</td>
                <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font }}>{elementData.name}</td>
              </tr>
              <tr>
                <td style={{ padding: "0.3rem", color: "#94a3b8" }}>Level</td>
                <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font }}>{elementData.level}</td>
              </tr>
              <tr>
                <td style={{ padding: "0.3rem", color: "#94a3b8" }}>Family</td>
                <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font }}>{elementData.family}</td>
              </tr>
              <tr>
                <td style={{ padding: "0.3rem", color: "#94a3b8" }}>Type</td>
                <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font }}>{elementData.type}</td>
              </tr>
              <tr>
                <td style={{ padding: "0.3rem", color: "#94a3b8" }}>Material</td>
                <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font }}>{elementData.material}</td>
              </tr>
              <tr>
                <td style={{ padding: "0.3rem", color: "#94a3b8" }}>Phase</td>
                <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font }}>{elementData.phase}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: "1rem" }}>
            <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
              PARAMETERS
            </div>
            {Object.entries(elementData.parameters || {}).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  padding: "0.2rem 0",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                }}
              >
                <span style={{ width: "40%", color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem" }}>{key}</span>
                <span style={{ flex: 1, color: "#cbd5e1", fontFamily: MIL.font, fontSize: "0.65rem" }}>{value}</span>
                <button
                  onClick={() => updateElement(key, prompt(`New value for ${key}:`, value))}
                  style={{
                    padding: "0.2rem 0.4rem",
                    background: "rgba(107,142,35,0.1)",
                    border: "1px solid rgba(107,142,35,0.3)",
                    borderRadius: 2,
                    color: MIL.green,
                    fontFamily: MIL.head,
                    fontSize: "0.6rem",
                    cursor: "pointer",
                  }}
                >
                  EDIT
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "1rem" }}>
            <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
              GEOMETRY
            </div>
            {elementData.geometry && (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "0.3rem", color: "#94a3b8" }}>Area</td>
                    <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font }}>{elementData.geometry.area} sq ft</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "0.3rem", color: "#94a3b8" }}>Volume</td>
                    <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font }}>{elementData.geometry.volume} cu ft</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "0.3rem", color: "#94a3b8" }}>Perimeter</td>
                    <td style={{ padding: "0.3rem", color: "#cbd5e1", fontFamily: MIL.font }}>{elementData.geometry.perimeter} ft</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Manual Element Update */}
      <div
        style={{
          background: "rgba(16,20,26,0.6)",
          border: `1px solid ${MIL.border}`,
          borderRadius: 4,
          padding: "1rem",
        }}
      >
        <div style={{ fontFamily: MIL.head, fontSize: "0.6rem", color: MIL.green, marginBottom: "0.5rem" }}>
          MANUAL PARAMETER UPDATE
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Parameter Name"
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
            placeholder="Value"
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
          <button
            onClick={() => alert("Enter Element ID above first")}
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
            UPDATE PARAMETER
          </button>
        </div>
      </div>
    </div>
  );
}
