"use client";
import { useState, useEffect } from "react";

const SOP_CATEGORIES = ["12_Quality_Assurance", "06_Clash_Detection", "04_CDE_Common_Data_Environment"];

export default function SOPsPage() {
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/knowledge");
        const data = await res.json();
        const filtered = (data.articles || []).filter(a => SOP_CATEGORIES.includes(a.category));
        setArticles(filtered);
        if (filtered.length > 0) setSelected(filtered[0]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div style={{ padding: "1.5rem", fontFamily: "'Rajdhani', sans-serif", color: "#f0f2f5" }}>
      <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#fff", letterSpacing: "2px", marginBottom: "0.25rem" }}>📋 SOPs & PROCEDURES</h1>
      <p style={{ fontSize: "0.8rem", color: "#6b8e23", letterSpacing: "1px", marginBottom: "1.5rem" }}>QUALITY ASSURANCE · CLASH DETECTION · CDE WORKFLOWS</p>
      <div style={{ display: "flex", gap: "1rem", height: "calc(100vh - 180px)" }}>
        <div style={{ width: 280, background: "rgba(13,17,23,0.8)", border: "1px solid rgba(107,142,35,0.15)", borderRadius: 4, overflowY: "auto", padding: "0.5rem" }}>
          {loading ? <div style={{ color: "#6b8e23", padding: "1rem", fontSize: "0.8rem" }}>Loading...</div> :
            articles.map(a => (
              <div key={a.id} onClick={() => setSelected(a)} style={{ padding: "0.75rem", borderRadius: 3, cursor: "pointer", marginBottom: "0.25rem", background: selected?.id === a.id ? "rgba(107,142,35,0.1)" : "transparent", border: `1px solid ${selected?.id === a.id ? "rgba(107,142,35,0.3)" : "transparent"}` }}>
                <div style={{ fontSize: "0.85rem", color: selected?.id === a.id ? "#a2d033" : "#f0f2f5", fontWeight: 500 }}>{a.title}</div>
                <div style={{ fontSize: "0.72rem", color: "#6b8e23", marginTop: "0.2rem" }}>{a.subcategory || a.category}</div>
              </div>
            ))
          }
        </div>
        <div style={{ flex: 1, background: "rgba(13,17,23,0.8)", border: "1px solid rgba(107,142,35,0.15)", borderRadius: 4, overflowY: "auto", padding: "1.5rem" }}>
          {selected ? (
            <>
              <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.9rem", color: "#fff", letterSpacing: "1.5px", marginBottom: "0.5rem" }}>{selected.title}</h2>
              <div style={{ fontSize: "0.72rem", color: "#6b8e23", marginBottom: "1rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px" }}>{selected.category}</div>
              <div style={{ fontSize: "0.85rem", color: "#cbd5e1", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{selected.content}</div>
            </>
          ) : <div style={{ color: "#4d584d", textAlign: "center", marginTop: "3rem" }}>Select a procedure</div>}
        </div>
      </div>
    </div>
  );
}
