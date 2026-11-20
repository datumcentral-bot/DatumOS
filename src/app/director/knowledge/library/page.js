"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const DBC_CATEGORIES = [
  { code: "01_BIM_Standards", label: "BIM Standards", icon: "📋" },
  { code: "02_BIM_Execution_Plans", label: "BIM Execution Plans", icon: "📄" },
  { code: "03_Information_Requirements", label: "Information Requirements", icon: "📊" },
  { code: "04_CDE_Common_Data_Environment", label: "CDE / Common Data Env", icon: "🗄️" },
  { code: "05_Model_Production", label: "Model Production", icon: "🏗️" },
  { code: "06_Clash_Detection", label: "Clash Detection", icon: "⚠️" },
  { code: "07_COBie_Data", label: "COBie Data", icon: "📦" },
  { code: "08_Digital_Twin", label: "Digital Twin", icon: "🔮" },
  { code: "09_Classification_Systems", label: "Classification Systems", icon: "🏷️" },
  { code: "10_Software_Guides", label: "Software Guides", icon: "💻" },
  { code: "11_Project_Templates", label: "Project Templates", icon: "📁" },
  { code: "12_Quality_Assurance", label: "Quality Assurance", icon: "✅" },
  { code: "13_Health_Safety_BIM", label: "Health & Safety BIM", icon: "🦺" },
  { code: "14_Sustainability_BIM", label: "Sustainability BIM", icon: "🌱" },
  { code: "15_Legal_Contractual", label: "Legal & Contractual", icon: "⚖️" },
];

function renderMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/^### (.+)$/gm, '<h3 style="color:#a2d033;font-family:Orbitron,sans-serif;font-size:0.75rem;letter-spacing:1px;margin:1.25rem 0 0.5rem">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:#fff;font-family:Orbitron,sans-serif;font-size:0.9rem;letter-spacing:1.5px;margin:1.5rem 0 0.75rem;border-bottom:1px solid rgba(107,142,35,0.3);padding-bottom:0.5rem">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color:#fff;font-family:Orbitron,sans-serif;font-size:1.1rem;letter-spacing:2px;margin:0 0 1rem">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#c19749">$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(107,142,35,0.15);color:#a2d033;padding:0.1rem 0.4rem;border-radius:2px;font-family:monospace;font-size:0.85em">$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.4);border:1px solid rgba(107,142,35,0.2);border-radius:4px;padding:1rem;overflow-x:auto;font-family:monospace;font-size:0.8rem;color:#a2d033;margin:0.75rem 0">$1</pre>')
    .replace(/^\| (.+) \|$/gm, (match) => {
      const cells = match.split("|").filter(c => c.trim());
      return '<tr>' + cells.map(c => `<td style="padding:0.4rem 0.75rem;border:1px solid rgba(107,142,35,0.15);font-size:0.82rem">${c.trim()}</td>`).join('') + '</tr>';
    })
    .replace(/(<tr>.*<\/tr>\n?)+/gs, (match) => `<table style="width:100%;border-collapse:collapse;margin:0.75rem 0">${match}</table>`)
    .replace(/^- \[ \] (.+)$/gm, '<div style="display:flex;align-items:center;gap:0.5rem;margin:0.25rem 0"><input type="checkbox" style="accent-color:#6b8e23"> <span style="font-size:0.85rem">$1</span></div>')
    .replace(/^- (.+)$/gm, '<li style="margin:0.2rem 0;font-size:0.85rem;color:#cbd5e1">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/gs, (match) => `<ul style="padding-left:1.25rem;margin:0.5rem 0">${match}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:0.2rem 0;font-size:0.85rem;color:#cbd5e1">$1</li>')
    .replace(/^(?!<[h|t|u|l|p|d|c|i|p]).+$/gm, (line) => line.trim() ? `<p style="margin:0.4rem 0;font-size:0.85rem;color:#cbd5e1;line-height:1.6">${line}</p>` : '')
    .replace(/\n\n/g, '<br>');
}

function LibraryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", category: "", subcategory: "", content: "", tags: "", visibility: "ALL" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedCats, setExpandedCats] = useState({});

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchArticles = useCallback(async (cat = selectedCategory, q = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat) params.set("category", cat);
      if (q) params.set("search", q);
      const res = await fetch(`/api/knowledge?${params}`);
      const data = await res.json();
      setArticles(data.articles || []);
      setGrouped(data.grouped || {});

      // Auto-select article from URL
      const articleId = searchParams.get("article");
      if (articleId) {
        const found = (data.articles || []).find(a => a.id === articleId);
        if (found) setSelectedArticle(found);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search, searchParams]);

  useEffect(() => { fetchArticles(); }, []);

  function handleCategoryClick(code) {
    setSelectedCategory(code === selectedCategory ? "" : code);
    setExpandedCats(prev => ({ ...prev, [code]: !prev[code] }));
    fetchArticles(code === selectedCategory ? "" : code, search);
  }

  function handleSearch(e) {
    const val = e.target.value;
    setSearch(val);
    if (val.length === 0 || val.length >= 2) fetchArticles(selectedCategory, val);
  }

  async function handleSave() {
    if (!form.title || !form.category || !form.content) {
      showToast("Title, category, and content are required", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      showToast("Article created successfully!");
      setShowModal(false);
      setForm({ title: "", category: "", subcategory: "", content: "", tags: "", visibility: "ALL" });
      fetchArticles();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this article?")) return;
    try {
      await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
      showToast("Article deleted");
      setSelectedArticle(null);
      fetchArticles();
    } catch (e) {
      showToast("Delete failed", "error");
    }
  }

  const displayArticles = selectedCategory
    ? (grouped[selectedCategory] || [])
    : articles;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 120px)", gap: "1rem", fontFamily: "'Rajdhani', sans-serif", color: "#f0f2f5" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 9999, background: toast.type === "error" ? "rgba(255,59,48,0.9)" : "rgba(107,142,35,0.9)", color: "#fff", padding: "0.75rem 1.25rem", borderRadius: 4, fontFamily: "'Orbitron', sans-serif", fontSize: "0.7rem", letterSpacing: "1px" }}>
          {toast.msg}
        </div>
      )}

      {/* LEFT: Folder Tree */}
      <div style={{ width: 260, flexShrink: 0, background: "rgba(13,17,23,0.8)", border: "1px solid rgba(107,142,35,0.15)", borderRadius: 4, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid rgba(107,142,35,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.6rem", color: "#6b8e23", letterSpacing: "1.5px" }}>DBC FOLDERS</span>
          <button onClick={() => setShowModal(true)} style={{ background: "rgba(107,142,35,0.15)", border: "1px solid rgba(107,142,35,0.3)", borderRadius: 2, color: "#a2d033", padding: "0.2rem 0.5rem", cursor: "pointer", fontSize: "0.7rem", fontFamily: "'Orbitron', sans-serif" }}>+ NEW</button>
        </div>
        <div style={{ overflowY: "auto", flex: 1, padding: "0.5rem" }}>
          <div
            onClick={() => { setSelectedCategory(""); fetchArticles("", search); }}
            style={{ padding: "0.5rem 0.75rem", borderRadius: 3, cursor: "pointer", marginBottom: "0.25rem", background: !selectedCategory ? "rgba(107,142,35,0.1)" : "transparent", color: !selectedCategory ? "#a2d033" : "#94a3b8", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            📚 All Articles ({articles.length})
          </div>
          {DBC_CATEGORIES.map((cat) => {
            const count = (grouped[cat.code] || []).length;
            const isActive = selectedCategory === cat.code;
            return (
              <div key={cat.code}>
                <div
                  onClick={() => handleCategoryClick(cat.code)}
                  style={{ padding: "0.45rem 0.75rem", borderRadius: 3, cursor: "pointer", marginBottom: "1px", background: isActive ? "rgba(107,142,35,0.1)" : "transparent", color: isActive ? "#a2d033" : "#94a3b8", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "0.4rem", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(107,142,35,0.05)"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <span>{cat.icon}</span>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.label}</span>
                  <span style={{ fontSize: "0.7rem", color: "#4d584d", flexShrink: 0 }}>{count}</span>
                </div>
                {/* Sub-articles when expanded */}
                {isActive && (grouped[cat.code] || []).map(a => (
                  <div
                    key={a.id}
                    onClick={() => setSelectedArticle(a)}
                    style={{ padding: "0.35rem 0.75rem 0.35rem 2rem", cursor: "pointer", fontSize: "0.75rem", color: selectedArticle?.id === a.id ? "#c19749" : "#64748b", background: selectedArticle?.id === a.id ? "rgba(193,151,73,0.08)" : "transparent", borderLeft: selectedArticle?.id === a.id ? "2px solid #c19749" : "2px solid transparent", marginLeft: "0.5rem", transition: "all 0.15s" }}
                    onMouseEnter={(e) => { if (selectedArticle?.id !== a.id) e.currentTarget.style.color = "#94a3b8"; }}
                    onMouseLeave={(e) => { if (selectedArticle?.id !== a.id) e.currentTarget.style.color = "#64748b"; }}
                  >
                    {a.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* MIDDLE: Article List */}
      <div style={{ width: 300, flexShrink: 0, background: "rgba(13,17,23,0.8)", border: "1px solid rgba(107,142,35,0.15)", borderRadius: 4, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid rgba(107,142,35,0.15)" }}>
          <input
            style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, padding: "0.5rem 0.75rem", color: "#f0f2f5", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.82rem", outline: "none", boxSizing: "border-box" }}
            placeholder="🔍 Search articles..."
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div style={{ overflowY: "auto", flex: 1, padding: "0.5rem" }}>
          {loading ? (
            <div style={{ padding: "1rem", color: "#6b8e23", fontSize: "0.8rem", textAlign: "center" }}>Loading...</div>
          ) : displayArticles.length === 0 ? (
            <div style={{ padding: "1rem", color: "#4d584d", fontSize: "0.8rem", textAlign: "center" }}>No articles found</div>
          ) : displayArticles.map((a) => (
            <div
              key={a.id}
              onClick={() => setSelectedArticle(a)}
              style={{ padding: "0.75rem", borderRadius: 3, cursor: "pointer", marginBottom: "0.25rem", background: selectedArticle?.id === a.id ? "rgba(107,142,35,0.1)" : "transparent", border: `1px solid ${selectedArticle?.id === a.id ? "rgba(107,142,35,0.3)" : "transparent"}`, transition: "all 0.15s" }}
              onMouseEnter={(e) => { if (selectedArticle?.id !== a.id) e.currentTarget.style.background = "rgba(107,142,35,0.05)"; }}
              onMouseLeave={(e) => { if (selectedArticle?.id !== a.id) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ fontSize: "0.85rem", color: selectedArticle?.id === a.id ? "#a2d033" : "#f0f2f5", fontWeight: 500, marginBottom: "0.2rem" }}>{a.title}</div>
              <div style={{ fontSize: "0.72rem", color: "#6b8e23" }}>{a.subcategory || a.category}</div>
              {a.tags && <div style={{ fontSize: "0.68rem", color: "#4d584d", marginTop: "0.2rem" }}>{a.tags.split(",").slice(0, 3).map(t => `#${t.trim()}`).join(" ")}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Article Viewer */}
      <div style={{ flex: 1, background: "rgba(13,17,23,0.8)", border: "1px solid rgba(107,142,35,0.15)", borderRadius: 4, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {selectedArticle ? (
          <>
            <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid rgba(107,142,35,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", color: "#6b8e23", letterSpacing: "1px", marginBottom: "0.2rem" }}>
                  {selectedArticle.category} {selectedArticle.subcategory ? `› ${selectedArticle.subcategory}` : ""}
                </div>
                <div style={{ fontSize: "1rem", color: "#fff", fontWeight: 600 }}>{selectedArticle.title}</div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.65rem", padding: "0.2rem 0.5rem", borderRadius: 2, background: "rgba(107,142,35,0.1)", color: "#6b8e23", border: "1px solid rgba(107,142,35,0.2)", fontFamily: "'Orbitron', sans-serif" }}>
                  {selectedArticle.visibility}
                </span>
                <button
                  onClick={() => handleDelete(selectedArticle.id)}
                  style={{ background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.2)", borderRadius: 2, color: "#ff3b30", padding: "0.2rem 0.5rem", cursor: "pointer", fontSize: "0.7rem" }}
                >
                  DELETE
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
              {selectedArticle.tags && (
                <div style={{ marginBottom: "1rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  {selectedArticle.tags.split(",").map(t => (
                    <span key={t} style={{ fontSize: "0.68rem", padding: "0.15rem 0.5rem", borderRadius: 2, background: "rgba(107,142,35,0.08)", color: "#6b8e23", border: "1px solid rgba(107,142,35,0.15)" }}>
                      #{t.trim()}
                    </span>
                  ))}
                </div>
              )}
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedArticle.content) }} />
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem", color: "#4d584d" }}>
            <div style={{ fontSize: "3rem" }}>📖</div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.7rem", letterSpacing: "2px" }}>SELECT AN ARTICLE TO READ</div>
          </div>
        )}
      </div>

      {/* Add Article Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#0d1117", border: "1px solid rgba(107,142,35,0.3)", borderRadius: 6, padding: "1.5rem", width: 600, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.8rem", color: "#a2d033", letterSpacing: "2px", marginBottom: "1.25rem" }}>NEW KNOWLEDGE ARTICLE</div>
            {[
              { label: "Title *", key: "title", type: "text" },
              { label: "Subcategory", key: "subcategory", type: "text" },
              { label: "Tags (comma-separated)", key: "tags", type: "text" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "0.75rem" }}>
                <label style={{ fontSize: "0.72rem", color: "#6b8e23", display: "block", marginBottom: "0.25rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px" }}>{f.label}</label>
                <input
                  style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, padding: "0.5rem 0.75rem", color: "#f0f2f5", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                />
              </div>
            ))}
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ fontSize: "0.72rem", color: "#6b8e23", display: "block", marginBottom: "0.25rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px" }}>Category *</label>
              <select
                style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, padding: "0.5rem 0.75rem", color: "#f0f2f5", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.85rem", outline: "none" }}
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              >
                <option value="">Select category...</option>
                {DBC_CATEGORIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.label}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ fontSize: "0.72rem", color: "#6b8e23", display: "block", marginBottom: "0.25rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px" }}>Visibility</label>
              <select
                style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, padding: "0.5rem 0.75rem", color: "#f0f2f5", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.85rem", outline: "none" }}
                value={form.visibility}
                onChange={e => setForm(p => ({ ...p, visibility: e.target.value }))}
              >
                <option value="ALL">ALL (Director + Member + Client)</option>
                <option value="MEMBER">MEMBER (Director + Member)</option>
                <option value="DIRECTOR">DIRECTOR only</option>
              </select>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.72rem", color: "#6b8e23", display: "block", marginBottom: "0.25rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px" }}>Content * (Markdown supported)</label>
              <textarea
                style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, padding: "0.5rem 0.75rem", color: "#f0f2f5", fontFamily: "monospace", fontSize: "0.82rem", outline: "none", minHeight: 200, resize: "vertical", boxSizing: "border-box" }}
                value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                placeholder="## Title&#10;&#10;Content in Markdown format..."
              />
            </div>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, color: "#94a3b8", padding: "0.5rem 1rem", cursor: "pointer", fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem" }}>CANCEL</button>
              <button onClick={handleSave} disabled={saving} style={{ background: "rgba(107,142,35,0.2)", border: "1px solid rgba(107,142,35,0.4)", borderRadius: 3, color: "#a2d033", padding: "0.5rem 1.25rem", cursor: "pointer", fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", letterSpacing: "1px" }}>
                {saving ? "SAVING..." : "SAVE ARTICLE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div style={{ color: "#6b8e23", padding: "2rem", fontFamily: "'Orbitron', sans-serif", fontSize: "0.8rem" }}>LOADING LIBRARY...</div>}>
      <LibraryContent />
    </Suspense>
  );
}
