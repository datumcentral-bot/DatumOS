"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const TEMPLATE_CATEGORIES = ["02_BIM_Execution_Plans", "11_Project_Templates", "07_COBie_Data"];

export default function TemplatesPage() {
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/knowledge");
        const data = await res.json();
        const filtered = (data.articles || []).filter(a => TEMPLATE_CATEGORIES.includes(a.category));
        setArticles(filtered);
        if (filtered.length > 0) setSelected(filtered[0]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const S = {
    page: { padding: "1.5rem", fontFamily: "'Rajdhani', sans-serif", color: "#f0f2f5" },
    title: { fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#fff", letterSpacing: "2px", marginBottom: "0.25rem" },
    sub: { fontSize: "0.8rem", color: "#6b8e23", letterSpacing: "1px", marginBottom: "1.5rem" },
    layout: { display: "flex", gap: "1rem", height: "calc(100vh - 180px)" },
    list: { width: 280, background: "rgba(13,17,23,0.8)", border: "1px solid rgba(107,142,35,0.15)", borderRadius: 4, overflowY: "auto", padding: "0.5rem" },
    item: (active) => ({ padding: "0.75rem", borderRadius: 3, cursor: "pointer", marginBottom: "0.25rem", background: active ? "rgba(107,142,35,0.1)" : "transparent", border: `1px solid ${active ? "rgba(107,142,35,0.3)" : "transparent"}`, transition: "all 0.15s" }),
    viewer: { flex: 1, background: "rgba(13,17,23,0.8)", border: "1px solid rgba(107,142,35,0.15)", borderRadius: 4, overflowY: "auto", padding: "1.5rem" },
  };

  return (
    <div style={S.page}>
      <h1 style={S.title}>📝 TEMPLATES & FORMS</h1>
      <p style={S.sub}>BIM EXECUTION PLANS · PROJECT TEMPLATES · COBIE DATA</p>
      <div style={S.layout}>
        <div style={S.list}>
          {loading ? <div style={{ color: "#6b8e23", padding: "1rem", fontSize: "0.8rem" }}>Loading...</div> :
            articles.map(a => (
              <div key={a.id} onClick={() => setSelected(a)} style={S.item(selected?.id === a.id)}>
                <div style={{ fontSize: "0.85rem", color: selected?.id === a.id ? "#a2d033" : "#f0f2f5", fontWeight: 500 }}>{a.title}</div>
                <div style={{ fontSize: "0.72rem", color: "#6b8e23", marginTop: "0.2rem" }}>{a.subcategory || a.category}</div>
              </div>
            ))
          }
        </div>
        <div style={S.viewer}>
          {selected ? (
            <>
              <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.9rem", color: "#fff", letterSpacing: "1.5px", marginBottom: "0.5rem" }}>{selected.title}</h2>
              <div style={{ fontSize: "0.72rem", color: "#6b8e23", marginBottom: "1rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px" }}>{selected.category}</div>
              <div style={{ fontSize: "0.85rem", color: "#cbd5e1", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{selected.content}</div>
            </>
          ) : <div style={{ color: "#4d584d", textAlign: "center", marginTop: "3rem" }}>Select a template</div>}
        </div>
      </div>
    </div>
  );
}
