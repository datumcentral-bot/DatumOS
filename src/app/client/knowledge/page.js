"use client";
import { useState, useEffect } from "react";

export default function ClientKnowledgePage() {
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/knowledge");
        const data = await res.json();
        // Client sees only ALL visibility articles
        const clientArticles = (data.articles || []).filter(a => a.visibility === "ALL");
        setArticles(clientArticles);
        if (clientArticles.length > 0) setSelected(clientArticles[0]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div style={{ padding: "1.5rem", fontFamily: "'Rajdhani', sans-serif", color: "#f0f2f5" }}>
      <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#fff", letterSpacing: "2px", marginBottom: "0.25rem" }}>📚 KNOWLEDGE BASE</h1>
      <p style={{ fontSize: "0.8rem", color: "#6b8e23", letterSpacing: "1px", marginBottom: "1.5rem" }}>BIM STANDARDS & REFERENCE LIBRARY</p>

      <div style={{ display: "flex", gap: "1rem", height: "calc(100vh - 200px)" }}>
        <div style={{ width: 260, background: "rgba(13,17,23,0.8)", border: "1px solid rgba(107,142,35,0.15)", borderRadius: 4, overflowY: "auto", padding: "0.5rem" }}>
          {loading ? <div style={{ color: "#6b8e23", padding: "1rem", fontSize: "0.8rem" }}>Loading...</div> :
            articles.map(a => (
              <div
                key={a.id}
                onClick={() => setSelected(a)}
                style={{ padding: "0.65rem 0.75rem", borderRadius: 3, cursor: "pointer", marginBottom: "1px", background: selected?.id === a.id ? "rgba(107,142,35,0.1)" : "transparent", color: selected?.id === a.id ? "#a2d033" : "#94a3b8", fontSize: "0.8rem", transition: "all 0.15s" }}
                onMouseEnter={e => { if (selected?.id !== a.id) e.currentTarget.style.background = "rgba(107,142,35,0.05)"; }}
                onMouseLeave={e => { if (selected?.id !== a.id) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ fontWeight: 500 }}>{a.title}</div>
                <div style={{ fontSize: "0.7rem", color: "#6b8e23", marginTop: "0.15rem" }}>{a.subcategory || a.category.replace(/_/g, " ")}</div>
              </div>
            ))
          }
        </div>

        <div style={{ flex: 1, background: "rgba(13,17,23,0.8)", border: "1px solid rgba(107,142,35,0.15)", borderRadius: 4, overflowY: "auto", padding: "1.5rem" }}>
          {selected ? (
            <>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", color: "#6b8e23", letterSpacing: "1px", marginBottom: "0.5rem" }}>{selected.category.replace(/_/g, " ")}</div>
              <h2 style={{ fontSize: "1.1rem", color: "#fff", fontWeight: 600, marginBottom: "1rem" }}>{selected.title}</h2>
              <div style={{ fontSize: "0.85rem", color: "#cbd5e1", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{selected.content}</div>
            </>
          ) : (
            <div style={{ color: "#4d584d", textAlign: "center", marginTop: "3rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📖</div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.7rem", letterSpacing: "2px" }}>SELECT AN ARTICLE</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
