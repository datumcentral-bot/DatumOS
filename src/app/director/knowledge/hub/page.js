"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const DBC_CATEGORIES = [
  { code: "01_BIM_Standards", label: "BIM Standards", icon: "📋", color: "#6b8e23" },
  { code: "02_BIM_Execution_Plans", label: "BIM Execution Plans", icon: "📄", color: "#c19749" },
  { code: "03_Information_Requirements", label: "Information Requirements", icon: "📊", color: "#4a9eff" },
  { code: "04_CDE_Common_Data_Environment", label: "CDE / Common Data Env", icon: "🗄️", color: "#9b59b6" },
  { code: "05_Model_Production", label: "Model Production", icon: "🏗️", color: "#e67e22" },
  { code: "06_Clash_Detection", label: "Clash Detection", icon: "⚠️", color: "#e74c3c" },
  { code: "07_COBie_Data", label: "COBie Data", icon: "📦", color: "#1abc9c" },
  { code: "08_Digital_Twin", label: "Digital Twin", icon: "🔮", color: "#3498db" },
  { code: "09_Classification_Systems", label: "Classification Systems", icon: "🏷️", color: "#f39c12" },
  { code: "10_Software_Guides", label: "Software Guides", icon: "💻", color: "#2ecc71" },
  { code: "11_Project_Templates", label: "Project Templates", icon: "📁", color: "#e91e63" },
  { code: "12_Quality_Assurance", label: "Quality Assurance", icon: "✅", color: "#00bcd4" },
  { code: "13_Health_Safety_BIM", label: "Health & Safety BIM", icon: "🦺", color: "#ff5722" },
  { code: "14_Sustainability_BIM", label: "Sustainability BIM", icon: "🌱", color: "#4caf50" },
  { code: "15_Legal_Contractual", label: "Legal & Contractual", icon: "⚖️", color: "#607d8b" },
];

const S = {
  page: { padding: "1.5rem", fontFamily: "'Rajdhani', sans-serif", color: "#f0f2f5" },
  header: { marginBottom: "1.5rem" },
  title: { fontFamily: "'Orbitron', sans-serif", fontSize: "1.2rem", color: "#fff", letterSpacing: "2px", marginBottom: "0.25rem" },
  subtitle: { fontSize: "0.85rem", color: "#6b8e23", letterSpacing: "1px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" },
  statCard: { background: "rgba(13,17,23,0.8)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 4, padding: "1rem", textAlign: "center" },
  statNum: { fontFamily: "'Orbitron', sans-serif", fontSize: "1.8rem", color: "#a2d033", fontWeight: 700 },
  statLabel: { fontSize: "0.7rem", color: "#6b8e23", letterSpacing: "1px", marginTop: "0.25rem" },
  searchBar: { display: "flex", gap: "0.75rem", marginBottom: "1.5rem" },
  searchInput: { flex: 1, background: "rgba(13,17,23,0.8)", border: "1px solid rgba(107,142,35,0.3)", borderRadius: 4, padding: "0.65rem 1rem", color: "#f0f2f5", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.9rem", outline: "none" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" },
  catCard: { background: "rgba(13,17,23,0.8)", border: "1px solid rgba(107,142,35,0.15)", borderRadius: 4, padding: "1.25rem", cursor: "pointer", transition: "all 0.2s", textDecoration: "none", display: "block" },
  catIcon: { fontSize: "1.8rem", marginBottom: "0.5rem" },
  catLabel: { fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", letterSpacing: "1.5px", marginBottom: "0.5rem" },
  catCount: { fontSize: "0.8rem", color: "#94a3b8" },
  recentSection: { marginTop: "2rem" },
  sectionTitle: { fontFamily: "'Orbitron', sans-serif", fontSize: "0.7rem", color: "#6b8e23", letterSpacing: "2px", marginBottom: "1rem", borderBottom: "1px solid rgba(107,142,35,0.2)", paddingBottom: "0.5rem" },
  articleList: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  articleItem: { background: "rgba(13,17,23,0.6)", border: "1px solid rgba(107,142,35,0.1)", borderRadius: 3, padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textDecoration: "none", transition: "all 0.15s" },
  articleTitle: { fontSize: "0.9rem", color: "#f0f2f5", fontWeight: 500 },
  articleMeta: { fontSize: "0.75rem", color: "#6b8e23", marginTop: "0.2rem" },
  badge: { fontSize: "0.65rem", padding: "0.2rem 0.5rem", borderRadius: 2, fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px" },
};

export default function KnowledgeHubPage() {
  const [articles, setArticles] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, categories: 0, recent: 0 });

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles(q = "") {
    setLoading(true);
    try {
      const res = await fetch(`/api/knowledge${q ? `?search=${encodeURIComponent(q)}` : ""}`);
      const data = await res.json();
      setArticles(data.articles || []);
      setGrouped(data.grouped || {});
      setStats({
        total: data.total || 0,
        categories: Object.keys(data.grouped || {}).length,
        recent: (data.articles || []).slice(0, 5).length,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    const val = e.target.value;
    setSearch(val);
    if (val.length === 0 || val.length >= 2) fetchArticles(val);
  }

  const recentArticles = articles.slice(0, 8);

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>📚 KNOWLEDGE BASE</h1>
        <p style={S.subtitle}>DIGITAL BUILDING COUNCIL — DBC MASTER FOLDER STRUCTURE</p>
      </div>

      {/* Stats */}
      <div style={S.statsRow}>
        <div style={S.statCard}>
          <div style={S.statNum}>{stats.total}</div>
          <div style={S.statLabel}>TOTAL ARTICLES</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum}>{stats.categories}</div>
          <div style={S.statLabel}>CATEGORIES</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum}>15</div>
          <div style={S.statLabel}>DBC FOLDERS</div>
        </div>
        <div style={S.statCard}>
          <div style={{ ...S.statNum, color: "#c19749" }}>ISO</div>
          <div style={S.statLabel}>19650 ALIGNED</div>
        </div>
      </div>

      {/* Search */}
      <div style={S.searchBar}>
        <input
          style={S.searchInput}
          placeholder="🔍  Search articles, standards, procedures..."
          value={search}
          onChange={handleSearch}
        />
        <Link
          href="/director/knowledge/library"
          style={{ background: "rgba(107,142,35,0.15)", border: "1px solid rgba(107,142,35,0.4)", borderRadius: 4, padding: "0.65rem 1.25rem", color: "#a2d033", fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", letterSpacing: "1px", textDecoration: "none", whiteSpace: "nowrap", display: "flex", alignItems: "center" }}
        >
          BROWSE ALL
        </Link>
      </div>

      {/* Category Grid */}
      <div style={S.sectionTitle}>DBC MASTER FOLDER STRUCTURE</div>
      <div style={S.grid}>
        {DBC_CATEGORIES.map((cat) => {
          const count = (grouped[cat.code] || []).length;
          return (
            <Link
              key={cat.code}
              href={`/director/knowledge/library?category=${encodeURIComponent(cat.code)}`}
              style={S.catCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = cat.color + "60";
                e.currentTarget.style.background = "rgba(13,17,23,0.95)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(107,142,35,0.15)";
                e.currentTarget.style.background = "rgba(13,17,23,0.8)";
              }}
            >
              <div style={S.catIcon}>{cat.icon}</div>
              <div style={{ ...S.catLabel, color: cat.color }}>{cat.code}</div>
              <div style={{ fontSize: "0.85rem", color: "#fff", fontWeight: 600, marginBottom: "0.25rem" }}>{cat.label}</div>
              <div style={S.catCount}>{count} article{count !== 1 ? "s" : ""}</div>
            </Link>
          );
        })}
      </div>

      {/* Recent Articles */}
      <div style={S.recentSection}>
        <div style={S.sectionTitle}>RECENT ARTICLES</div>
        <div style={S.articleList}>
          {loading ? (
            <div style={{ color: "#6b8e23", fontSize: "0.8rem" }}>Loading...</div>
          ) : recentArticles.map((a) => (
            <Link
              key={a.id}
              href={`/director/knowledge/library?article=${a.id}`}
              style={S.articleItem}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(107,142,35,0.3)"; e.currentTarget.style.background = "rgba(13,17,23,0.9)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(107,142,35,0.1)"; e.currentTarget.style.background = "rgba(13,17,23,0.6)"; }}
            >
              <div>
                <div style={S.articleTitle}>{a.title}</div>
                <div style={S.articleMeta}>{a.category} {a.subcategory ? `› ${a.subcategory}` : ""}</div>
              </div>
              <span style={{ ...S.badge, background: "rgba(107,142,35,0.1)", color: "#6b8e23", border: "1px solid rgba(107,142,35,0.2)" }}>
                {a.visibility}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
        {[
          { href: "/director/knowledge/templates", label: "Templates & Forms", icon: "📝" },
          { href: "/director/knowledge/sops", label: "SOPs & Procedures", icon: "📋" },
          { href: "/director/knowledge/training", label: "Training Resources", icon: "🎓" },
          { href: "/director/knowledge/references", label: "External References", icon: "🔗" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{ background: "rgba(13,17,23,0.6)", border: "1px solid rgba(107,142,35,0.15)", borderRadius: 4, padding: "1rem", textAlign: "center", textDecoration: "none", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(107,142,35,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(107,142,35,0.15)"; }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{link.icon}</div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.6rem", color: "#6b8e23", letterSpacing: "1px" }}>{link.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
