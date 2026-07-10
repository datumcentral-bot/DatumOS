"use client";
import { useState } from "react";

const PLATFORMS = ["ALL", "LINKEDIN", "INSTAGRAM", "TWITTER", "FACEBOOK"];
const PLATFORM_COLORS = { LINKEDIN:"#0077b5", INSTAGRAM:"#e1306c", TWITTER:"#1da1f2", FACEBOOK:"#1877f2" };
const PLATFORM_LIMITS = { LINKEDIN:3000, INSTAGRAM:2200, TWITTER:280, FACEBOOK:63206 };

const HASHTAG_SUGGESTIONS = {
  LINKEDIN: ["#BIM", "#DigitalConstruction", "#ISO19650", "#AEC", "#BuildingInformationModeling", "#ConstructionTech", "#UAE", "#Dubai", "#SmartBuilding"],
  INSTAGRAM: ["#BIM", "#Architecture", "#Construction", "#Dubai", "#UAE", "#DigitalDesign", "#AEC", "#Engineering", "#BuildingDesign"],
  TWITTER: ["#BIM", "#AEC", "#ConstructionTech", "#ISO19650", "#UAE"],
  FACEBOOK: ["#BIM", "#Construction", "#Engineering", "#Dubai", "#UAE"],
};

const INITIAL_POSTS = [
  { id:1, platform:"LINKEDIN", title:"ISO 19650 Compliance Guide", content:"🏗️ Navigating ISO 19650 compliance doesn't have to be complex.\n\nAt Datum Studios, we've helped 15+ projects achieve full ISO 19650 Part 2 compliance in the UAE.\n\nHere's our 5-step framework:\n\n1️⃣ Define your EIR (Employer's Information Requirements)\n2️⃣ Establish your CDE on Autodesk Construction Cloud\n3️⃣ Create a compliant BEP (BIM Execution Plan)\n4️⃣ Set up MIDP/TIDP workflows\n5️⃣ Implement regular model audits\n\nThe result? Fewer clashes, faster delivery, and happier clients.\n\nWhat's your biggest BIM challenge? Drop it in the comments 👇\n\n#BIM #ISO19650 #DigitalConstruction #UAE #AEC", status:"PUBLISHED", scheduledDate:"", tags:["BIM","ISO19650","UAE"] },
  { id:2, platform:"LINKEDIN", title:"BIM ROI Statistics", content:"📊 The numbers don't lie.\n\nBIM adoption in the UAE construction sector:\n\n✅ 30% reduction in project costs\n✅ 40% fewer design clashes\n✅ 25% faster project delivery\n✅ 50% reduction in RFIs\n\nAt Datum Studios, we've seen these results firsthand across our portfolio of AED 2B+ in managed projects.\n\nReady to transform your construction workflow?\n\nDM us or visit datumbim.com\n\n#BIM #ConstructionTech #UAE #ROI #DigitalConstruction", status:"DRAFT", scheduledDate:"2026-07-15", tags:["BIM","ROI","UAE"] },
  { id:3, platform:"INSTAGRAM", title:"Project Showcase — ADNOC Tower", content:"🏢 Proud to share our latest BIM milestone!\n\nADNOC Tower — Dubai\n📐 Full ISO 19650 BIM delivery\n🔍 Zero critical clashes at handover\n⚡ 35% faster coordination vs traditional methods\n\nOur team of BIM specialists worked tirelessly to deliver a fully coordinated model across all disciplines.\n\nSwipe to see the coordination process ➡️\n\n#BIM #Dubai #UAE #Architecture #Construction #DigitalConstruction #AEC #Engineering", status:"PUBLISHED", scheduledDate:"", tags:["BIM","Dubai","Architecture"] },
  { id:4, platform:"TWITTER", title:"BIM Tip of the Day", content:"💡 BIM Tip: Always define your LOD (Level of Development) requirements BEFORE starting modeling.\n\nLOD 100 → Conceptual\nLOD 200 → Schematic\nLOD 300 → Design Development\nLOD 350 → Construction\nLOD 400 → Fabrication\n\nSave this for your next project! 🔖\n\n#BIM #AEC #ConstructionTech #ISO19650", status:"DRAFT", scheduledDate:"2026-07-12", tags:["BIM","AEC","Tips"] },
];

function Toast({ msg, onClose }) {
  const { useEffect } = require("react");
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return <div style={{ position:"fixed", bottom:24, right:24, background:"#1a2a1a", border:"1px solid #6b8e23", borderRadius:4, padding:"0.75rem 1.25rem", color:"#a2d033", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem", zIndex:9999 }}>✓ {msg}</div>;
}

export default function SocialLibraryPage() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [filter, setFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [view, setView] = useState("GRID"); // GRID | CALENDAR
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ platform:"LINKEDIN", title:"", content:"", status:"DRAFT", scheduledDate:"" });
  const [toast, setToast] = useState(null);

  const filtered = posts.filter(p => {
    if (filter !== "ALL" && p.platform !== filter) return false;
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    return true;
  });

  const copyPost = (post) => {
    navigator.clipboard.writeText(post.content).then(() => setToast("Post copied to clipboard"));
  };

  const deletePost = (id) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    if (selected?.id === id) setSelected(null);
    setToast("Post deleted");
  };

  const savePost = () => {
    if (!form.title || !form.content) return;
    if (selected && !showModal) {
      setPosts(prev => prev.map(p => p.id === selected.id ? { ...p, ...form } : p));
      setSelected({ ...selected, ...form });
      setToast("Post updated");
    } else {
      const newPost = { id: Date.now(), ...form, tags: [] };
      setPosts(prev => [...prev, newPost]);
      setShowModal(false);
      setToast("Post added");
    }
  };

  const charLimit = PLATFORM_LIMITS[form.platform] || 3000;
  const charCount = form.content.length;
  const charColor = charCount > charLimit ? "#ff3b30" : charCount > charLimit * 0.9 ? "#ff9500" : "#4ade80";

  const S = {
    card: { background:"rgba(13,17,23,0.8)", border:"1px solid rgba(107,142,35,0.2)", borderRadius:4, padding:"1.25rem" },
    h2: { fontFamily:"'Orbitron',sans-serif", fontSize:"0.65rem", color:"#6b8e23", letterSpacing:"2px", marginBottom:"1rem", textTransform:"uppercase" },
    btn: (c="#6b8e23") => ({ background:`rgba(107,142,35,0.12)`, border:`1px solid ${c}`, borderRadius:3, color:c, padding:"0.4rem 0.9rem", fontFamily:"'Orbitron',sans-serif", fontSize:"0.55rem", letterSpacing:"1px", cursor:"pointer" }),
  };

  return (
    <div style={{ fontFamily:"'Rajdhani',sans-serif", color:"#f0f2f5" }}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
        <div>
          <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.1rem", color:"#fff", letterSpacing:"3px", margin:0 }}>◈ SOCIAL LIBRARY</h1>
          <p style={{ color:"#4d584d", fontSize:"0.8rem", margin:"0.25rem 0 0" }}>Content posts organized by platform</p>
        </div>
        <div style={{ display:"flex", gap:"0.5rem" }}>
          <button onClick={() => setView(view === "GRID" ? "CALENDAR" : "GRID")} style={S.btn()}>
            {view === "GRID" ? "📅 CALENDAR" : "⊞ GRID"}
          </button>
          <button onClick={() => { setForm({ platform:"LINKEDIN", title:"", content:"", status:"DRAFT", scheduledDate:"" }); setShowModal(true); }} style={{ ...S.btn(), background:"rgba(107,142,35,0.2)" }}>
            + NEW POST
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.75rem", marginBottom:"1.25rem" }}>
        {[
          { label:"TOTAL POSTS", value:posts.length, color:"#6b8e23" },
          { label:"PUBLISHED", value:posts.filter(p=>p.status==="PUBLISHED").length, color:"#4ade80" },
          { label:"DRAFTS", value:posts.filter(p=>p.status==="DRAFT").length, color:"#ff9500" },
          { label:"SCHEDULED", value:posts.filter(p=>p.scheduledDate).length, color:"#c19749" },
        ].map(s => (
          <div key={s.label} style={{ ...S.card, textAlign:"center" }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.4rem", color:s.color, fontWeight:800 }}>{s.value}</div>
            <div style={{ fontSize:"0.65rem", color:"#4d584d", letterSpacing:"1px", marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1rem", flexWrap:"wrap" }}>
        {PLATFORMS.map(p => (
          <button key={p} onClick={() => setFilter(p)} style={{ ...S.btn(filter===p ? (PLATFORM_COLORS[p]||"#6b8e23") : "#4d584d"), padding:"0.3rem 0.7rem", fontSize:"0.5rem" }}>{p}</button>
        ))}
        <div style={{ width:1, background:"rgba(255,255,255,0.1)", margin:"0 0.25rem" }} />
        {["ALL","PUBLISHED","DRAFT"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ ...S.btn(statusFilter===s ? "#6b8e23" : "#4d584d"), padding:"0.3rem 0.7rem", fontSize:"0.5rem" }}>{s}</button>
        ))}
      </div>

      {view === "GRID" ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"1rem" }}>
          {filtered.map(post => {
            const pc = PLATFORM_COLORS[post.platform] || "#6b8e23";
            const limit = PLATFORM_LIMITS[post.platform] || 3000;
            return (
              <div key={post.id} style={{ ...S.card, borderColor:`${pc}30`, borderLeft:`3px solid ${pc}`, cursor:"pointer" }} onClick={() => setSelected(post)}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.75rem" }}>
                  <div>
                    <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.45rem", color:pc, border:`1px solid ${pc}`, borderRadius:2, padding:"2px 6px", letterSpacing:"1px" }}>{post.platform}</span>
                    <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", color:"#f0f2f5", letterSpacing:"1px", marginTop:6 }}>{post.title}</div>
                  </div>
                  <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.45rem", color: post.status==="PUBLISHED" ? "#4ade80" : "#ff9500", border:`1px solid ${post.status==="PUBLISHED" ? "#4ade80" : "#ff9500"}`, borderRadius:2, padding:"2px 6px" }}>{post.status}</span>
                </div>
                <div style={{ fontSize:"0.8rem", color:"#94a3b8", lineHeight:1.5, maxHeight:80, overflow:"hidden", marginBottom:"0.75rem" }}>{post.content.substring(0,150)}...</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:"0.65rem", color:"#4d584d" }}>{post.content.length}/{limit} chars</span>
                  {post.scheduledDate && <span style={{ fontSize:"0.65rem", color:"#c19749" }}>📅 {post.scheduledDate}</span>}
                </div>
                <div style={{ display:"flex", gap:4, marginTop:"0.75rem" }}>
                  <button onClick={e => { e.stopPropagation(); copyPost(post); }} style={{ ...S.btn(), padding:"0.3rem 0.6rem", fontSize:"0.5rem" }}>📋 COPY</button>
                  <button onClick={e => { e.stopPropagation(); deletePost(post.id); }} style={{ ...S.btn("#ff3b30"), padding:"0.3rem 0.6rem", fontSize:"0.5rem" }}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Calendar View */
        <div style={S.card}>
          <p style={S.h2}>📅 CONTENT CALENDAR — JULY 2026</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
            {["MON","TUE","WED","THU","FRI","SAT","SUN"].map(d => (
              <div key={d} style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.45rem", color:"#4d584d", textAlign:"center", padding:"0.5rem 0" }}>{d}</div>
            ))}
            {Array.from({length:31}, (_,i) => {
              const day = i+1;
              const dayPosts = posts.filter(p => p.scheduledDate && new Date(p.scheduledDate).getDate() === day);
              return (
                <div key={day} style={{ minHeight:60, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.04)", borderRadius:2, padding:4 }}>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.5rem", color:"#4d584d", marginBottom:4 }}>{day}</div>
                  {dayPosts.map(p => (
                    <div key={p.id} style={{ fontSize:"0.6rem", color:PLATFORM_COLORS[p.platform]||"#6b8e23", background:`${PLATFORM_COLORS[p.platform]||"#6b8e23"}15`, borderRadius:2, padding:"1px 4px", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.title}</div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Post Detail Panel */}
      {selected && (
        <div style={{ position:"fixed", right:0, top:0, bottom:0, width:420, background:"#0d1117", borderLeft:"1px solid rgba(107,142,35,0.2)", padding:"1.5rem", overflowY:"auto", zIndex:500 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
            <h3 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.7rem", color:"#6b8e23", letterSpacing:"2px", margin:0 }}>{selected.title}</h3>
            <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:"#ff3b30", cursor:"pointer", fontSize:"1rem" }}>✕</button>
          </div>
          <div style={{ marginBottom:"1rem" }}>
            <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.45rem", color:PLATFORM_COLORS[selected.platform]||"#6b8e23", border:`1px solid ${PLATFORM_COLORS[selected.platform]||"#6b8e23"}`, borderRadius:2, padding:"2px 6px", marginRight:8 }}>{selected.platform}</span>
            <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.45rem", color: selected.status==="PUBLISHED" ? "#4ade80" : "#ff9500", border:`1px solid ${selected.status==="PUBLISHED" ? "#4ade80" : "#ff9500"}`, borderRadius:2, padding:"2px 6px" }}>{selected.status}</span>
          </div>
          <pre style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:3, padding:"1rem", fontSize:"0.8rem", color:"#f0f2f5", whiteSpace:"pre-wrap", fontFamily:"'Rajdhani',sans-serif", lineHeight:1.6, marginBottom:"1rem" }}>{selected.content}</pre>
          <div style={{ marginBottom:"1rem" }}>
            <div style={{ fontSize:"0.65rem", color:"#4d584d", marginBottom:6 }}>SUGGESTED HASHTAGS:</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
              {(HASHTAG_SUGGESTIONS[selected.platform]||[]).map(h => (
                <button key={h} onClick={() => { navigator.clipboard.writeText(h); setToast(`${h} copied`); }} style={{ background:"rgba(107,142,35,0.1)", border:"1px solid rgba(107,142,35,0.2)", borderRadius:2, color:"#6b8e23", padding:"2px 8px", fontSize:"0.7rem", cursor:"pointer" }}>{h}</button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", gap:"0.5rem" }}>
            <button onClick={() => copyPost(selected)} style={{ ...S.btn(), flex:1 }}>📋 COPY POST</button>
            <button onClick={() => deletePost(selected.id)} style={{ ...S.btn("#ff3b30") }}>✕</button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
          <div style={{ background:"#0d1117", border:"1px solid rgba(107,142,35,0.3)", borderRadius:6, padding:"2rem", width:520, maxWidth:"90vw", maxHeight:"90vh", overflowY:"auto" }}>
            <h3 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.8rem", color:"#6b8e23", letterSpacing:"2px", marginBottom:"1.5rem" }}>+ NEW SOCIAL POST</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
              <div>
                <label style={{ fontSize:"0.65rem", color:"#4d584d", display:"block", marginBottom:4 }}>PLATFORM</label>
                <select value={form.platform} onChange={e => setForm(p => ({...p, platform:e.target.value}))} style={{ width:"100%", background:"#0d1117", border:"1px solid rgba(107,142,35,0.2)", borderRadius:3, color:"#f0f2f5", padding:"0.5rem 0.75rem", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem" }}>
                  {["LINKEDIN","INSTAGRAM","TWITTER","FACEBOOK"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:"0.65rem", color:"#4d584d", display:"block", marginBottom:4 }}>TITLE *</label>
                <input value={form.title} onChange={e => setForm(p => ({...p, title:e.target.value}))} style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(107,142,35,0.2)", borderRadius:3, color:"#f0f2f5", padding:"0.5rem 0.75rem", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem", boxSizing:"border-box" }} />
              </div>
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <label style={{ fontSize:"0.65rem", color:"#4d584d" }}>CONTENT *</label>
                  <span style={{ fontSize:"0.65rem", color:charColor }}>{charCount}/{PLATFORM_LIMITS[form.platform]||3000}</span>
                </div>
                <textarea value={form.content} onChange={e => setForm(p => ({...p, content:e.target.value}))} rows={8} style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${charCount > (PLATFORM_LIMITS[form.platform]||3000) ? "#ff3b30" : "rgba(107,142,35,0.2)"}`, borderRadius:3, color:"#f0f2f5", padding:"0.5rem 0.75rem", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.85rem", resize:"vertical", boxSizing:"border-box" }} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
                <div>
                  <label style={{ fontSize:"0.65rem", color:"#4d584d", display:"block", marginBottom:4 }}>STATUS</label>
                  <select value={form.status} onChange={e => setForm(p => ({...p, status:e.target.value}))} style={{ width:"100%", background:"#0d1117", border:"1px solid rgba(107,142,35,0.2)", borderRadius:3, color:"#f0f2f5", padding:"0.5rem 0.75rem", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem" }}>
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:"0.65rem", color:"#4d584d", display:"block", marginBottom:4 }}>SCHEDULE DATE</label>
                  <input type="date" value={form.scheduledDate} onChange={e => setForm(p => ({...p, scheduledDate:e.target.value}))} style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(107,142,35,0.2)", borderRadius:3, color:"#f0f2f5", padding:"0.5rem 0.75rem", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem", boxSizing:"border-box" }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize:"0.65rem", color:"#4d584d", marginBottom:6 }}>SUGGESTED HASHTAGS (click to add):</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                  {(HASHTAG_SUGGESTIONS[form.platform]||[]).map(h => (
                    <button key={h} onClick={() => setForm(p => ({...p, content: p.content + (p.content.endsWith("\n") ? "" : "\n") + h}))} style={{ background:"rgba(107,142,35,0.1)", border:"1px solid rgba(107,142,35,0.2)", borderRadius:2, color:"#6b8e23", padding:"2px 8px", fontSize:"0.7rem", cursor:"pointer" }}>{h}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.5rem", justifyContent:"flex-end" }}>
              <button onClick={() => setShowModal(false)} style={S.btn("#4d584d")}>CANCEL</button>
              <button onClick={savePost} style={{ ...S.btn(), background:"rgba(107,142,35,0.2)" }}>SAVE POST</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
