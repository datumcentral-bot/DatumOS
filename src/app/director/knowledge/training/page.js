"use client";
import { useState, useEffect } from "react";

const TRAINING_CATEGORIES = ["10_Software_Guides", "05_Model_Production", "09_Classification_Systems"];

const EXTERNAL_COURSES = [
  { title: "ISO 19650 Foundation", provider: "BRE Academy", url: "https://www.bregroup.com", level: "Foundation", duration: "1 day" },
  { title: "Autodesk Revit Essentials", provider: "Autodesk", url: "https://www.autodesk.com/training", level: "Beginner", duration: "3 days" },
  { title: "Navisworks Manage", provider: "Autodesk", url: "https://www.autodesk.com/training", level: "Intermediate", duration: "2 days" },
  { title: "BIM Level 2 Practitioner", provider: "CIOB", url: "https://www.ciob.org", level: "Practitioner", duration: "2 days" },
  { title: "Uniclass 2015 Classification", provider: "NBS", url: "https://www.thenbs.com", level: "Foundation", duration: "Half day" },
  { title: "COBie Data Management", provider: "BIM Academy", url: "https://www.bimacademy.ac.uk", level: "Intermediate", duration: "1 day" },
];

export default function TrainingPage() {
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("guides");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/knowledge");
        const data = await res.json();
        const filtered = (data.articles || []).filter(a => TRAINING_CATEGORIES.includes(a.category));
        setArticles(filtered);
        if (filtered.length > 0) setSelected(filtered[0]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div style={{ padding: "1.5rem", fontFamily: "'Rajdhani', sans-serif", color: "#f0f2f5" }}>
      <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#fff", letterSpacing: "2px", marginBottom: "0.25rem" }}>🎓 TRAINING RESOURCES</h1>
      <p style={{ fontSize: "0.8rem", color: "#6b8e23", letterSpacing: "1px", marginBottom: "1rem" }}>SOFTWARE GUIDES · MODELING STANDARDS · EXTERNAL COURSES</p>
      
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {["guides", "courses"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? "rgba(107,142,35,0.2)" : "transparent", border: `1px solid ${tab === t ? "rgba(107,142,35,0.4)" : "rgba(107,142,35,0.15)"}`, borderRadius: 3, color: tab === t ? "#a2d033" : "#94a3b8", padding: "0.4rem 1rem", cursor: "pointer", fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", letterSpacing: "1px" }}>
            {t === "guides" ? "SOFTWARE GUIDES" : "EXTERNAL COURSES"}
          </button>
        ))}
      </div>

      {tab === "guides" ? (
        <div style={{ display: "flex", gap: "1rem", height: "calc(100vh - 230px)" }}>
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
                <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.9rem", color: "#fff", letterSpacing: "1.5px", marginBottom: "1rem" }}>{selected.title}</h2>
                <div style={{ fontSize: "0.85rem", color: "#cbd5e1", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{selected.content}</div>
              </>
            ) : <div style={{ color: "#4d584d", textAlign: "center", marginTop: "3rem" }}>Select a guide</div>}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {EXTERNAL_COURSES.map((c, i) => (
            <div key={i} style={{ background: "rgba(13,17,23,0.8)", border: "1px solid rgba(107,142,35,0.15)", borderRadius: 4, padding: "1.25rem" }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", color: "#6b8e23", letterSpacing: "1px", marginBottom: "0.5rem" }}>{c.provider}</div>
              <div style={{ fontSize: "0.95rem", color: "#fff", fontWeight: 600, marginBottom: "0.75rem" }}>{c.title}</div>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderRadius: 2, background: "rgba(107,142,35,0.1)", color: "#6b8e23", border: "1px solid rgba(107,142,35,0.2)" }}>{c.level}</span>
                <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderRadius: 2, background: "rgba(193,151,73,0.1)", color: "#c19749", border: "1px solid rgba(193,151,73,0.2)" }}>{c.duration}</span>
              </div>
              <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "#4a9eff", textDecoration: "none" }}>Visit Provider →</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
