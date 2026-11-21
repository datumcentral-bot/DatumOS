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

export default function RevitMacrosPage() {
  const { data: session } = useSession();
  const [macros, setMacros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(null);

  const fetchMacros = async () => {
    try {
      const res = await fetch("/api/revit/macros");
      const data = await res.json();
      setMacros(data.macros || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const executeMacro = async (scriptId) => {
    setLoading(true);
    try {
      const res = await fetch("/api/revit/macros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scriptId }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMacros();
  }, []);

  const categories = [...new Set(macros.map((m) => m.category))];

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
        <span style={{ fontSize: "1.5rem" }}>⬢</span>
        <div>
          <h1 style={{ fontFamily: MIL.head, fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            REVIT MACROS
          </h1>
          <p style={{ fontSize: "0.7rem", color: MIL.dim, margin: 0 }}>Revit macro library - 108 scripts across categories</p>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem" }}>Filter by Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setMacros(macros.filter((m) => m.category === cat))}
              style={{
                padding: "0.3rem 0.6rem",
                background: "rgba(107,142,35,0.1)",
                border: "1px solid rgba(107,142,35,0.3)",
                borderRadius: 3,
                color: MIL.green,
                fontFamily: MIL.head,
                fontSize: "0.6rem",
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => fetchMacros()}
            style={{
              padding: "0.3rem 0.6rem",
              background: "rgba(16,20,26,0.8)",
              border: `1px solid ${MIL.border}`,
              borderRadius: 3,
              color: MIL.text,
              fontFamily: MIL.head,
              fontSize: "0.6rem",
              cursor: "pointer",
            }}
          >
            ALL
          </button>
        </div>
      </div>

      {/* Macros Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
        {loading ? (
          <div style={{ gridColumn: "1 / -1", padding: "2rem", textAlign: "center", color: MIL.green, fontFamily: MIL.head, fontSize: "0.7rem" }}>
            Loading macros...
          </div>
        ) : macros.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", padding: "2rem", textAlign: "center", color: MIL.dim, fontFamily: MIL.font, fontSize: "0.7rem" }}>
            No macros found
          </div>
        ) : (
          macros.map((m) => (
            <div
              key={m.id}
              style={{
                background: "rgba(16,20,26,0.8)",
                border: `1px solid ${MIL.border}`,
                borderRadius: 4,
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ fontFamily: MIL.head, fontSize: "0.75rem", fontWeight: 700, color: "#fff" }}>{m.name}</div>
                <span
                  style={{
                    fontSize: "0.55rem",
                    color: "#cbd5e1",
                    padding: "0.1rem 0.4rem",
                    background: "rgba(107,142,35,0.1)",
                    border: "1px solid rgba(107,142,35,0.2)",
                    borderRadius: 3,
                  }}
                >
                  {m.category}
                </span>
              </div>
              <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontFamily: MIL.font, lineHeight: 1.4, marginBottom: "0.5rem" }}>{m.description}</div>
              <div style={{ fontSize: "0.6rem", color: "#4d584d", fontFamily: MIL.font, marginBottom: "0.5rem" }}>
                <div style={{ marginBottom: "0.15rem" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.55rem" }}>Dynamo:</span>{" "}
                  <span style={{ color: "#cbd5e1" }}>{m.dynamoFile}</span>
                </div>
                <div style={{ marginBottom: "0.15rem" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.55rem" }}>PyRevit:</span>{" "}
                  <span style={{ color: "#cbd5e1" }}>{m.pyrevitFile}</span>
                </div>
                <div style={{ marginBottom: "0.15rem" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.55rem" }}>Macro:</span>{" "}
                  <span style={{ color: "#cbd5e1" }}>{m.macroFile}</span>
                </div>
                <div>
                  <span style={{ color: "#94a3b8", fontSize: "0.55rem" }}>Python:</span>{" "}
                  <span style={{ color: "#cbd5e1" }}>{m.pythonFile}</span>
                </div>
              </div>
              <button
                onClick={() => executeMacro(m.id)}
                disabled={loading}
                style={{
                  padding: "0.5rem",
                  background: "rgba(107,142,35,0.1)",
                  border: "1px solid rgba(107,142,35,0.3)",
                  borderRadius: 3,
                  color: MIL.green,
                  fontFamily: MIL.head,
                  fontSize: "0.6rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                EXECUTE MACRO
              </button>
            </div>
          ))}
        )}
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
            EXECUTION RESULT
          </div>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.65rem", lineHeight: 1.5 }}>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
