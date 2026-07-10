"use client";
import { useState, useEffect } from "react";

export default function MemberKnowledgePage() {
  const [articles, setArticles] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchArticles(); }, []);

  async function fetchArticles(q = "") {
    setLoading(true);
    try {
      const res = await fetch(`/api/knowledge${q ? `?search=${encodeURIComponent(q)}` : ""}`);
      const data = await res.json();
      setArticles(data.articles || []);
      setGrouped(data.grouped || {});
      if ((data.articles || []).length > 0 && !selected) setSelected(data.articles[0]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const categories = Object.keys(grouped);

  return (
    <div style={{ padding: "1.5rem", fontFamily: "'Rajdhani', sans-serif", color: "#f0f2f5" }}>
      <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#fff", letterSpacing: "2px", marginBottom: "0.25rem" }}>📚 KNOWLEDGE BASE</h1>
      <p style={{ fontSize: "0.8rem", color: "#6b8e23", letterSpacing: "1px", marginBottom: "1rem" }}>BIM STANDARDS · PROCEDURES · GUIDES</p>

      <input
        style={{ width: "100%", maxWidth: 400, background: "rgba(13,17,23,0.8)", border: "1px solid rgba(107,142,35,0.3)", borderRadius: 4, padding: "0.6rem 1rem", color: "#f0f2f5", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.85rem", outline: "none", marginBottom: "1rem", boxSizing: "border-box" }}
        placeholder="🔍 Search knowledge base..."
        value={search}
        onChange={e => { setSearch(e.target.value); if (e.target.value.length === 0 || e.target.value.length >= 2) fetchArticles(e.target.value); }}
      />

      <div style={{ display: "flex", gap: "1rem", height: "calc(100vh - 220px)" }}>
        {/* Left: Category + Article list */}
        <div style={{ width: 280, background: "rgba(13,17,23,0.8)", border: "1px solid rgba(107,142,35,0.15)", borderRadius: 4, overflowY: "auto", padding: "0.5rem" }}>
          {loading ? <div style={{ color: "#6b8e23", padding: "1rem", fontSize: "0.8rem" }}>Loading...</div> :
            categories.map(cat => (
              <div key={cat}>
                <div style={{ padding: "0.4rem 0.75rem", fontSize: "0.68rem", color: "#6b8e23", fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px", marginTop: "0.5rem" }}>
                  {cat.replace(/_/g, " ")}
                </div>
                {(grouped[cat] || []).map(a => (
                  <div
                    key={a.id}
                    onClick={() => setSelected(a)}
                    style={{ padding: "0.5rem 0.75rem", borderRadius: 3, cursor: "pointer", marginBottom: "1px", background: selected?.id === a.id ? "rgba(107,142,35,0.1)" : "transparent", color: selected?.id === a.id ? "#a2d033" : "#94a3b8", fontSize: "0.8rem", transition: "all 0.15s" }}
                    onMouseEnter={e => { if (selected?.id !== a.id) e.currentTarget.style.background = "rgba(107,142,35,0.05)"; }}
                    onMouseLeave={e => { if (selected?.id !== a.id) e.currentTarget.style.background = "transparent"; }}
                  >
                    {a.title}
                  </div>
                ))}
              </div>
            ))
          }
        </div>

        {/* Right: Article viewer */}
        <div style={{ flex: 1, background: "rgba(13,17,23,0.8)", border: "1px solid rgba(107,142,35,0.15)", borderRadius: 4, overflowY: "auto", padding: "1.5rem" }}>
          {selected ? (
            <>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", color: "#6b8e23", letterSpacing: "1px", marginBottom: "0.5rem" }}>{selected.category}</div>
              <h2 style={{ fontSize: "1.1rem", color: "#fff", fontWeight: 600, marginBottom: "0.75rem" }}>{selected.title}</h2>
              {selected.tags && (
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                  {selected.tags.split(",").map(t => (
                    <span key={t} style={{ fontSize: "0.68rem", padding: "0.15rem 0.5rem", borderRadius: 2, background: "rgba(107,142,35,0.08)", color: "#6b8e23", border: "1px solid rgba(107,142,35,0.15)" }}>#{t.trim()}</span>
                  ))}
                </div>
              )}
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
