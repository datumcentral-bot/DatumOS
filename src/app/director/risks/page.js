"use client";
import { useState, useEffect } from "react";

const PROB_LABELS = ["RARE","UNLIKELY","POSSIBLE","LIKELY","ALMOST CERTAIN"];
const IMPACT_LABELS = ["NEGLIGIBLE","MINOR","MODERATE","MAJOR","CATASTROPHIC"];

function getRiskScore(prob, impact) { return prob * impact; }
function getRiskColor(score) {
  if (score >= 15) return "#ff3b30";
  if (score >= 9) return "#ff9500";
  if (score >= 4) return "#c19749";
  return "#4ade80";
}
function getRiskLevel(score) {
  if (score >= 15) return "CRITICAL";
  if (score >= 9) return "HIGH";
  if (score >= 4) return "MEDIUM";
  return "LOW";
}

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return <div style={{ position:"fixed", bottom:24, right:24, background:"#1a2a1a", border:"1px solid #6b8e23", borderRadius:4, padding:"0.75rem 1.25rem", color:"#a2d033", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem", zIndex:9999 }}>✓ {msg}</div>;
}

const BLANK = { title:"", description:"", probability:3, impact:3, owner:"", mitigation:"", reviewDate:"", status:"OPEN", projectId:"", trend:"STABLE" };

export default function RisksPage() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editRisk, setEditRisk] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [view, setView] = useState("LIST"); // LIST | HEATMAP
  const [filterStatus, setFilterStatus] = useState("ALL");

  const load = async () => {
    try {
      const r = await fetch("/api/risks");
      const data = await r.json();
      setRisks(Array.isArray(data) ? data : data.risks || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openModal = (risk = null) => {
    if (risk) {
      setEditRisk(risk);
      setForm({ title:risk.title||"", description:risk.description||"", probability:risk.probability||3, impact:risk.impact||3, owner:risk.owner||"", mitigation:risk.mitigation||"", reviewDate:risk.reviewDate?.split("T")[0]||"", status:risk.status||"OPEN", projectId:risk.projectId||"", trend:risk.trend||"STABLE" });
    } else {
      setEditRisk(null);
      setForm(BLANK);
    }
    setShowModal(true);
  };

  const save = async () => {
    if (!form.title) return;
    try {
      const body = { ...form, probability: Number(form.probability), impact: Number(form.impact) };
      if (editRisk) {
        await fetch(`/api/risks/${editRisk.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
        setRisks(prev => prev.map(r => r.id === editRisk.id ? { ...r, ...body } : r));
        setToast("Risk updated");
      } else {
        const res = await fetch("/api/risks", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
        const created = await res.json();
        setRisks(prev => [created, ...prev]);
        setToast("Risk added");
      }
      setShowModal(false);
    } catch { setToast("Failed to save risk"); }
  };

  const deleteRisk = async (id) => {
    try {
      await fetch(`/api/risks/${id}`, { method:"DELETE" });
      setRisks(prev => prev.filter(r => r.id !== id));
      setToast("Risk deleted");
    } catch {}
  };

  const enriched = risks.map(r => ({
    ...r,
    probability: Number(r.probability) || 3,
    impact: Number(r.impact) || 3,
    score: r.riskScore || getRiskScore(Number(r.probability)||3, Number(r.impact)||3)
  }));
  const filtered = enriched.filter(r => filterStatus === "ALL" || r.status === filterStatus);

  // Heat map grid: 5x5
  const heatmapGrid = Array.from({length:5}, (_, pi) =>
    Array.from({length:5}, (_, ii) => {
      const prob = pi + 1;
      const impact = ii + 1;
      const score = prob * impact;
      const risksHere = enriched.filter(r => r.probability === prob && r.impact === impact);
      return { prob, impact, score, risks: risksHere };
    })
  );

  const S = {
    card: { background:"rgba(13,17,23,0.8)", border:"1px solid rgba(107,142,35,0.2)", borderRadius:4, padding:"1.25rem" },
    h2: { fontFamily:"'Orbitron',sans-serif", fontSize:"0.65rem", color:"#6b8e23", letterSpacing:"2px", marginBottom:"1rem", textTransform:"uppercase" },
    btn: (c="#6b8e23") => ({ background:`rgba(107,142,35,0.12)`, border:`1px solid ${c}`, borderRadius:3, color:c, padding:"0.4rem 0.9rem", fontFamily:"'Orbitron',sans-serif", fontSize:"0.55rem", letterSpacing:"1px", cursor:"pointer" }),
    input: { width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(107,142,35,0.2)", borderRadius:3, color:"#f0f2f5", padding:"0.5rem 0.75rem", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem", boxSizing:"border-box" },
  };

  const TREND_ICONS = { INCREASING:"↑", STABLE:"→", DECREASING:"↓" };
  const TREND_COLORS = { INCREASING:"#ff3b30", STABLE:"#c19749", DECREASING:"#4ade80" };

  return (
    <div style={{ fontFamily:"'Rajdhani',sans-serif", color:"#f0f2f5" }}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
        <div>
          <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.1rem", color:"#fff", letterSpacing:"3px", margin:0 }}>⚠ RISK REGISTER</h1>
          <p style={{ color:"#4d584d", fontSize:"0.8rem", margin:"0.25rem 0 0" }}>Risk identification, assessment, and mitigation tracking</p>
        </div>
        <div style={{ display:"flex", gap:"0.5rem" }}>
          <button onClick={() => setView(view==="LIST" ? "HEATMAP" : "LIST")} style={S.btn()}>
            {view==="LIST" ? "🗺 HEAT MAP" : "📋 LIST VIEW"}
          </button>
          <button onClick={() => openModal()} style={{ ...S.btn(), background:"rgba(107,142,35,0.2)" }}>+ ADD RISK</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.75rem", marginBottom:"1.25rem" }}>
        {[
          { label:"TOTAL RISKS", value:enriched.length, color:"#6b8e23" },
          { label:"CRITICAL", value:enriched.filter(r=>r.score>=15).length, color:"#ff3b30" },
          { label:"HIGH", value:enriched.filter(r=>r.score>=9&&r.score<15).length, color:"#ff9500" },
          { label:"OPEN", value:enriched.filter(r=>r.status==="OPEN").length, color:"#c19749" },
        ].map(s => (
          <div key={s.label} style={{ ...S.card, textAlign:"center" }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"1.5rem", color:s.color, fontWeight:800 }}>{s.value}</div>
            <div style={{ fontSize:"0.65rem", color:"#4d584d", letterSpacing:"1px", marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {view === "HEATMAP" ? (
        <div style={S.card}>
          <p style={S.h2}>🗺 RISK HEAT MAP (PROBABILITY × IMPACT)</p>
          <div style={{ display:"flex", gap:"1.5rem" }}>
            <div>
              <div style={{ display:"flex", alignItems:"flex-end", gap:4, marginBottom:4 }}>
                <div style={{ width:80, fontSize:"0.55rem", color:"#4d584d", textAlign:"right", paddingRight:8 }}>PROBABILITY</div>
                {IMPACT_LABELS.map(l => (
                  <div key={l} style={{ width:80, fontFamily:"'Orbitron',sans-serif", fontSize:"0.4rem", color:"#4d584d", textAlign:"center", letterSpacing:"0.5px" }}>{l}</div>
                ))}
              </div>
              {[...heatmapGrid].reverse().map((row, ri) => {
                const prob = 5 - ri;
                return (
                  <div key={prob} style={{ display:"flex", alignItems:"center", gap:4, marginBottom:4 }}>
                    <div style={{ width:80, fontFamily:"'Orbitron',sans-serif", fontSize:"0.4rem", color:"#4d584d", textAlign:"right", paddingRight:8 }}>{PROB_LABELS[prob-1]}</div>
                    {row.map(cell => {
                      const color = getRiskColor(cell.score);
                      return (
                        <div key={cell.impact} style={{ width:80, height:60, background:`${color}20`, border:`1px solid ${color}40`, borderRadius:3, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative" }}>
                          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", color, fontWeight:800 }}>{cell.score}</div>
                          {cell.risks.length > 0 && (
                            <div style={{ position:"absolute", top:4, right:4, background:color, color:"#000", borderRadius:"50%", width:16, height:16, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Orbitron',sans-serif", fontSize:"0.5rem", fontWeight:800 }}>{cell.risks.length}</div>
                          )}
                          {cell.risks.slice(0,2).map((r,i) => (
                            <div key={i} style={{ fontSize:"0.55rem", color:"#f0f2f5", textAlign:"center", padding:"0 4px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"100%" }}>{r.title?.substring(0,12)}</div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              <div style={{ display:"flex", gap:"1rem", marginTop:"1rem" }}>
                {[["LOW","#4ade80"],["MEDIUM","#c19749"],["HIGH","#ff9500"],["CRITICAL","#ff3b30"]].map(([l,c]) => (
                  <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:12, height:12, background:`${c}30`, border:`1px solid ${c}`, borderRadius:2 }} />
                    <span style={{ fontSize:"0.65rem", color:"#4d584d" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display:"flex", gap:"0.5rem", marginBottom:"0.75rem" }}>
            {["ALL","OPEN","MITIGATED","CLOSED"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{ ...S.btn(filterStatus===s ? "#6b8e23" : "#4d584d"), padding:"0.3rem 0.6rem", fontSize:"0.5rem" }}>{s}</button>
            ))}
          </div>
          <div style={S.card}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.85rem" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(107,142,35,0.2)" }}>
                  {["RISK","OWNER","PROB","IMPACT","SCORE","TREND","STATUS","REVIEW",""].map(h => (
                    <th key={h} style={{ padding:"0.5rem 0.75rem", textAlign:"left", fontFamily:"'Orbitron',sans-serif", fontSize:"0.45rem", color:"#4d584d", letterSpacing:"1px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{ textAlign:"center", padding:"2rem", color:"#4d584d" }}>LOADING...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign:"center", padding:"2rem", color:"#4d584d" }}>No risks found. Click + ADD RISK to add one.</td></tr>
                ) : filtered.map(risk => {
                  const color = getRiskColor(risk.score);
                  const level = getRiskLevel(risk.score);
                  return (
                    <tr key={risk.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding:"0.75rem" }}>
                        <div style={{ fontWeight:600, color:"#f0f2f5" }}>{risk.title}</div>
                        {risk.mitigation && <div style={{ fontSize:"0.7rem", color:"#4d584d", marginTop:2 }}>↳ {risk.mitigation.substring(0,60)}...</div>}
                      </td>
                      <td style={{ padding:"0.75rem", color:"#94a3b8", fontSize:"0.8rem" }}>{risk.owner||"—"}</td>
                      <td style={{ padding:"0.75rem", textAlign:"center" }}>
                        <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", color:"#f0f2f5" }}>{risk.probability||3}</span>
                      </td>
                      <td style={{ padding:"0.75rem", textAlign:"center" }}>
                        <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", color:"#f0f2f5" }}>{risk.impact||3}</span>
                      </td>
                      <td style={{ padding:"0.75rem", textAlign:"center" }}>
                        <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.7rem", color, fontWeight:800 }}>{risk.score}</span>
                        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.4rem", color, letterSpacing:"1px" }}>{level}</div>
                      </td>
                      <td style={{ padding:"0.75rem", textAlign:"center" }}>
                        <span style={{ color:TREND_COLORS[risk.trend||"STABLE"], fontSize:"1rem" }}>{TREND_ICONS[risk.trend||"STABLE"]}</span>
                      </td>
                      <td style={{ padding:"0.75rem" }}>
                        <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.45rem", color: risk.status==="OPEN" ? "#ff9500" : risk.status==="MITIGATED" ? "#c19749" : "#4ade80", border:`1px solid ${risk.status==="OPEN" ? "#ff9500" : risk.status==="MITIGATED" ? "#c19749" : "#4ade80"}`, borderRadius:2, padding:"2px 6px" }}>{risk.status||"OPEN"}</span>
                      </td>
                      <td style={{ padding:"0.75rem", color:"#4d584d", fontSize:"0.75rem" }}>{risk.reviewDate ? new Date(risk.reviewDate).toLocaleDateString() : "—"}</td>
                      <td style={{ padding:"0.75rem" }}>
                        <div style={{ display:"flex", gap:4 }}>
                          <button onClick={() => openModal(risk)} style={{ background:"none", border:"1px solid rgba(107,142,35,0.3)", borderRadius:2, color:"#6b8e23", padding:"3px 8px", cursor:"pointer", fontSize:"0.7rem" }}>✎</button>
                          <button onClick={() => deleteRisk(risk.id)} style={{ background:"none", border:"1px solid rgba(255,59,48,0.3)", borderRadius:2, color:"#ff3b30", padding:"3px 8px", cursor:"pointer", fontSize:"0.7rem" }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
          <div style={{ background:"#0d1117", border:"1px solid rgba(107,142,35,0.3)", borderRadius:6, padding:"2rem", width:520, maxWidth:"90vw", maxHeight:"90vh", overflowY:"auto" }}>
            <h3 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.8rem", color:"#6b8e23", letterSpacing:"2px", marginBottom:"1.5rem" }}>{editRisk ? "EDIT" : "+ ADD"} RISK</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.9rem" }}>
              <div>
                <label style={{ fontSize:"0.65rem", color:"#4d584d", display:"block", marginBottom:4 }}>RISK TITLE *</label>
                <input value={form.title} onChange={e => setForm(p => ({...p, title:e.target.value}))} style={S.input} />
              </div>
              <div>
                <label style={{ fontSize:"0.65rem", color:"#4d584d", display:"block", marginBottom:4 }}>DESCRIPTION</label>
                <textarea value={form.description} onChange={e => setForm(p => ({...p, description:e.target.value}))} rows={3} style={{ ...S.input, resize:"vertical" }} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
                <div>
                  <label style={{ fontSize:"0.65rem", color:"#4d584d", display:"block", marginBottom:4 }}>PROBABILITY (1-5)</label>
                  <select value={form.probability} onChange={e => setForm(p => ({...p, probability:Number(e.target.value)}))} style={{ ...S.input, background:"#0d1117" }}>
                    {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} — {PROB_LABELS[v-1]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:"0.65rem", color:"#4d584d", display:"block", marginBottom:4 }}>IMPACT (1-5)</label>
                  <select value={form.impact} onChange={e => setForm(p => ({...p, impact:Number(e.target.value)}))} style={{ ...S.input, background:"#0d1117" }}>
                    {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} — {IMPACT_LABELS[v-1]}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ padding:"0.75rem", background:`${getRiskColor(form.probability*form.impact)}15`, border:`1px solid ${getRiskColor(form.probability*form.impact)}40`, borderRadius:3, textAlign:"center" }}>
                <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.6rem", color:getRiskColor(form.probability*form.impact) }}>
                  RISK SCORE: {form.probability * form.impact} — {getRiskLevel(form.probability * form.impact)}
                </span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
                <div>
                  <label style={{ fontSize:"0.65rem", color:"#4d584d", display:"block", marginBottom:4 }}>RISK OWNER</label>
                  <input value={form.owner} onChange={e => setForm(p => ({...p, owner:e.target.value}))} style={S.input} />
                </div>
                <div>
                  <label style={{ fontSize:"0.65rem", color:"#4d584d", display:"block", marginBottom:4 }}>REVIEW DATE</label>
                  <input type="date" value={form.reviewDate} onChange={e => setForm(p => ({...p, reviewDate:e.target.value}))} style={S.input} />
                </div>
              </div>
              <div>
                <label style={{ fontSize:"0.65rem", color:"#4d584d", display:"block", marginBottom:4 }}>MITIGATION PLAN</label>
                <textarea value={form.mitigation} onChange={e => setForm(p => ({...p, mitigation:e.target.value}))} rows={3} style={{ ...S.input, resize:"vertical" }} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
                <div>
                  <label style={{ fontSize:"0.65rem", color:"#4d584d", display:"block", marginBottom:4 }}>STATUS</label>
                  <select value={form.status} onChange={e => setForm(p => ({...p, status:e.target.value}))} style={{ ...S.input, background:"#0d1117" }}>
                    {["OPEN","MITIGATED","CLOSED"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:"0.65rem", color:"#4d584d", display:"block", marginBottom:4 }}>TREND</label>
                  <select value={form.trend} onChange={e => setForm(p => ({...p, trend:e.target.value}))} style={{ ...S.input, background:"#0d1117" }}>
                    {["INCREASING","STABLE","DECREASING"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.5rem", justifyContent:"flex-end" }}>
              <button onClick={() => setShowModal(false)} style={S.btn("#4d584d")}>CANCEL</button>
              <button onClick={save} style={{ ...S.btn(), background:"rgba(107,142,35,0.2)" }}>SAVE RISK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}