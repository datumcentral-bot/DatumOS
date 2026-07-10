"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/lib/useSocket";

const MIL = {
  bg: "#0a0e14", panel: "rgba(13,17,23,0.95)", border: "rgba(107,142,35,0.2)",
  green: "#6b8e23", gold: "#c19749", red: "#ff3b30", blue: "#4a9eff",
  text: "#f0f2f5", dim: "#8a9bb0", font: "'Rajdhani', sans-serif", head: "'Orbitron', sans-serif",
};

const STAGE_TO_TEMP = {
  TO_CONTACT: "COLD", CONTACTED: "WARM", MEETING: "HOT", PROPOSAL: "HOT",
  NEGOTIATION: "HOT", WON: "WON", LOST: "COLD",
};

const TEMP_CONFIG = {
  COLD: { color: "#4a9eff", bg: "rgba(74,158,255,0.1)", label: "❄ COLD" },
  WARM: { color: MIL.gold, bg: "rgba(193,151,73,0.1)", label: "◑ WARM" },
  HOT:  { color: MIL.red,  bg: "rgba(255,59,48,0.1)",  label: "🔥 HOT" },
  WON:  { color: MIL.green,bg: "rgba(107,142,35,0.1)", label: "✓ WON" },
};

const AI_LABEL_CONFIG = {
  HOT:  { color: "#ff3b30", bg: "rgba(255,59,48,0.15)", glow: "#ff3b30" },
  WARM: { color: "#c19749", bg: "rgba(193,151,73,0.15)", glow: "#c19749" },
  COLD: { color: "#4a9eff", bg: "rgba(74,158,255,0.15)", glow: "#4a9eff" },
  DEAD: { color: "#8a9bb0", bg: "rgba(138,155,176,0.1)", glow: "#8a9bb0" },
};

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1a2a1a", border: "1px solid #6b8e23", borderRadius: 4, padding: "10px 18px", fontFamily: MIL.head, fontSize: "0.65rem", color: "#a2d033", letterSpacing: 1, zIndex: 9999 }}>
      {msg}
    </div>
  );
}

// Circular AI Score indicator
function AIScoreRing({ score, label }) {
  if (score == null) return null;
  const cfg = AI_LABEL_CONFIG[label] || AI_LABEL_CONFIG.COLD;
  const r = 18, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <svg width={44} height={44} style={{ filter: `drop-shadow(0 0 4px ${cfg.glow}60)` }}>
        <circle cx={22} cy={22} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
        <circle cx={22} cy={22} r={r} fill="none" stroke={cfg.color} strokeWidth={3}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 22 22)" />
        <text x={22} y={26} textAnchor="middle" fill={cfg.color}
          style={{ fontFamily: MIL.head, fontSize: "9px", fontWeight: "bold" }}>{score}</text>
      </svg>
      <span style={{ fontFamily: MIL.head, fontSize: "0.38rem", color: cfg.color, letterSpacing: 1, background: cfg.bg, padding: "1px 5px", borderRadius: 2 }}>{label}</span>
    </div>
  );
}

export default function SalesPoolPage() {
  const { data: session } = useSession();
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [scoringId, setScoringId] = useState(null);
  const [expandedInsight, setExpandedInsight] = useState(null);
  const [form, setForm] = useState({ company: "", contactName: "", estValue: "", stage: "TO_CONTACT", source: "" });

  const handleLiveEvent = useCallback((ev) => {
    if (ev.action === 'created') setLeads(prev => [ev.data, ...prev]);
    else if (ev.action === 'updated' || ev.action === 'moved') setLeads(prev => prev.map(l => l.id === ev.data.id ? { ...l, ...ev.data } : l));
    else if (ev.action === 'deleted') setLeads(prev => prev.filter(l => l.id !== ev.data.id));
  }, []);

  const { isConnected, emitCrud } = useSocket('leads', session?.user, handleLiveEvent);

  const showToast = (msg) => setToast(msg);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/leads");
      const data = await r.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const scoreLead = async (lead) => {
    setScoringId(lead.id);
    try {
      const r = await fetch("/api/ai/lead-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          company: lead.company,
          estValue: lead.estValue,
          source: lead.source,
          stage: lead.stage,
          notes: lead.notes,
          contactName: lead.contactName,
        }),
      });
      const result = await r.json();
      setLeads(ls => ls.map(l => l.id === lead.id ? { ...l, aiScore: result.score, aiScoreLabel: result.label, aiInsight: result.insight } : l));
      showToast(`🤖 ${lead.company}: ${result.label} (${result.score}/100)`);
    } catch (e) { showToast("AI scoring failed"); }
    finally { setScoringId(null); }
  };

  const scoreAllLeads = async () => {
    showToast("🤖 SCORING ALL LEADS...");
    for (const lead of leads) {
      await scoreLead(lead);
    }
    showToast("✓ ALL LEADS SCORED");
  };

  const getTemp = (lead) => STAGE_TO_TEMP[lead.stage] || "COLD";

  const heatUp = async (lead) => {
    const order = ["TO_CONTACT", "CONTACTED", "MEETING", "PROPOSAL", "NEGOTIATION", "WON"];
    const idx = order.indexOf(lead.stage);
    if (idx < 0 || idx >= order.length - 1) return;
    const newStage = order[idx + 1];
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      setLeads(ls => ls.map(l => l.id === lead.id ? { ...l, stage: newStage } : l));
      showToast(`↑ ${lead.company} → ${newStage}`);
    } catch (e) { console.error(e); }
  };

  const deleteLead = async (id) => {
    try {
      await fetch(`/api/leads/${id}`, { method: "DELETE" });
      setLeads(ls => ls.filter(l => l.id !== id));
      showToast("✗ LEAD REMOVED");
    } catch (e) { console.error(e); }
  };

  const addLead = async () => {
    if (!form.company) return;
    try {
      const r = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, estValue: parseFloat(form.estValue) || 0 }),
      });
      if (r.ok) {
        setForm({ company: "", contactName: "", estValue: "", stage: "TO_CONTACT", source: "" });
        setShowModal(false);
        showToast("✓ LEAD ADDED");
        load();
      }
    } catch (e) { console.error(e); }
  };

  const enriched = leads.map(l => ({ ...l, temp: getTemp(l) }));
  const filtered = filter === "ALL" ? enriched : enriched.filter(l => l.temp === filter);
  const stats = { COLD: enriched.filter(l => l.temp === "COLD").length, WARM: enriched.filter(l => l.temp === "WARM").length, HOT: enriched.filter(l => l.temp === "HOT").length, WON: enriched.filter(l => l.temp === "WON").length };
  const totalValue = enriched.reduce((s, l) => s + (l.estValue || 0), 0);
  const WIN_PROB = { COLD: 0.1, WARM: 0.3, HOT: 0.6, WON: 1.0 };
  const weightedPipeline = enriched.reduce((s, l) => s + (l.estValue || 0) * (WIN_PROB[l.temp] || 0.1), 0);
  const winRate = enriched.length > 0 ? Math.round((stats.WON / enriched.length) * 100) : 0;
  const avgDealSize = enriched.length > 0 ? Math.round(totalValue / enriched.length) : 0;
  const scoredCount = enriched.filter(l => l.aiScore != null).length;

  return (
    <div style={{ fontFamily: MIL.font, color: MIL.text }}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div style={{ fontFamily: MIL.head, fontSize: "1.4rem", color: MIL.gold, letterSpacing: 3 }}>◈ SALES POOL</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={scoreAllLeads} style={{ background: "rgba(74,158,255,0.1)", border: "1px solid rgba(74,158,255,0.3)", borderRadius: 3, color: "#4a9eff", padding: "6px 14px", fontFamily: MIL.head, fontSize: "0.55rem", cursor: "pointer", letterSpacing: 1 }}>
            🤖 SCORE ALL ({scoredCount}/{enriched.length})
          </button>
          <button onClick={() => setShowModal(true)} style={{ background: MIL.gold, border: "none", borderRadius: 3, color: "#000", padding: "6px 14px", fontFamily: MIL.head, fontSize: "0.6rem", cursor: "pointer", letterSpacing: 1 }}>+ NEW PROSPECT</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "TOTAL PIPELINE", value: `AED ${(totalValue / 1000).toFixed(0)}K`, color: MIL.text },
          { label: "WEIGHTED VALUE", value: `AED ${(weightedPipeline / 1000).toFixed(0)}K`, color: MIL.gold },
          { label: "WIN RATE", value: `${winRate}%`, color: MIL.green },
          { label: "AVG DEAL SIZE", value: `AED ${(avgDealSize / 1000).toFixed(0)}K`, color: "#60a5fa" },
        ].map(s => (
          <div key={s.label} style={{ background: MIL.panel, border: `1px solid ${MIL.border}`, borderRadius: 4, padding: "10px 12px", textAlign: "center" }}>
            <div style={{ fontFamily: MIL.head, fontSize: "0.45rem", color: MIL.dim, letterSpacing: 1.5, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: MIL.head, fontSize: "1.1rem", color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Stage breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "❄ COLD", value: stats.COLD, prob: "10%", color: "#4a9eff" },
          { label: "◑ WARM", value: stats.WARM, prob: "30%", color: MIL.gold },
          { label: "🔥 HOT", value: stats.HOT, prob: "60%", color: MIL.red },
          { label: "✓ WON", value: stats.WON, prob: "100%", color: MIL.green },
        ].map(s => (
          <div key={s.label} style={{ background: MIL.panel, border: `1px solid ${s.color}30`, borderRadius: 4, padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: MIL.head, fontSize: "0.45rem", color: s.color, letterSpacing: 1.5 }}>{s.label}</div>
              <div style={{ fontFamily: MIL.head, fontSize: "1.1rem", color: s.color, marginTop: 2 }}>{s.value}</div>
            </div>
            <div style={{ fontFamily: MIL.head, fontSize: "0.55rem", color: MIL.dim }}>Win: {s.prob}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["ALL", "COLD", "WARM", "HOT", "WON"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? MIL.green : "rgba(107,142,35,0.08)", border: `1px solid ${filter === f ? MIL.green : "rgba(107,142,35,0.2)"}`, borderRadius: 3, color: filter === f ? "#fff" : MIL.dim, padding: "5px 12px", fontFamily: MIL.head, fontSize: "0.55rem", cursor: "pointer", letterSpacing: 1 }}>
            {f}
          </button>
        ))}
      </div>

      {/* Lead cards */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, fontFamily: MIL.head, color: MIL.green, letterSpacing: 3 }}>LOADING...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {filtered.map(lead => {
            const cfg = TEMP_CONFIG[lead.temp] || TEMP_CONFIG.COLD;
            const isScoring = scoringId === lead.id;
            return (
              <div key={lead.id} style={{ background: MIL.panel, border: `1px solid ${cfg.color}40`, borderRadius: 4, padding: 16, borderLeft: `3px solid ${cfg.color}`, position: "relative" }}>
                {/* Top row: company + AI ring */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: MIL.head, fontSize: "0.7rem", color: MIL.text, letterSpacing: 1 }}>{lead.company}</div>
                    <div style={{ fontSize: "0.8rem", color: MIL.dim, marginTop: 2 }}>{lead.contactName}</div>
                    <span style={{ fontFamily: MIL.head, fontSize: "0.5rem", color: cfg.color, background: cfg.bg, padding: "2px 6px", borderRadius: 2, marginTop: 4, display: "inline-block" }}>{cfg.label}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    {lead.aiScore != null ? (
                      <AIScoreRing score={lead.aiScore} label={lead.aiScoreLabel} />
                    ) : (
                      <div style={{ width: 44, height: 44, border: "1px dashed rgba(107,142,35,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "0.6rem", color: MIL.dim }}>AI</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Value + stage */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: MIL.head, fontSize: "0.65rem", color: MIL.gold }}>AED {((lead.estValue || 0) / 1000).toFixed(0)}K</span>
                  <span style={{ fontSize: "0.75rem", color: MIL.dim }}>{lead.stage?.replace(/_/g, " ")}</span>
                </div>

                {/* AI Insight (expandable) */}
                {lead.aiInsight && (
                  <div style={{ marginBottom: 8 }}>
                    <button onClick={() => setExpandedInsight(expandedInsight === lead.id ? null : lead.id)}
                      style={{ background: "none", border: "none", color: "#4a9eff", fontFamily: MIL.head, fontSize: "0.45rem", cursor: "pointer", letterSpacing: 1, padding: 0 }}>
                      {expandedInsight === lead.id ? "▲ HIDE INSIGHT" : "▼ AI INSIGHT"}
                    </button>
                    {expandedInsight === lead.id && (
                      <div style={{ marginTop: 6, padding: "8px 10px", background: "rgba(74,158,255,0.06)", border: "1px solid rgba(74,158,255,0.2)", borderRadius: 3, fontSize: "0.78rem", color: MIL.dim, lineHeight: 1.5 }}>
                        {lead.aiInsight}
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => scoreLead(lead)} disabled={isScoring}
                    style={{ background: "rgba(74,158,255,0.08)", border: "1px solid rgba(74,158,255,0.25)", borderRadius: 2, color: "#4a9eff", padding: "5px 8px", fontFamily: MIL.head, fontSize: "0.45rem", cursor: "pointer", letterSpacing: 1, opacity: isScoring ? 0.6 : 1 }}>
                    {isScoring ? "⟳ SCORING..." : "🤖 SCORE"}
                  </button>
                  {lead.temp !== "WON" && (
                    <button onClick={() => heatUp(lead)} style={{ flex: 1, background: "rgba(107,142,35,0.1)", border: "1px solid rgba(107,142,35,0.3)", borderRadius: 2, color: MIL.green, padding: "5px", fontFamily: MIL.head, fontSize: "0.5rem", cursor: "pointer", letterSpacing: 1 }}>
                      ↑ HEAT UP
                    </button>
                  )}
                  <button onClick={() => deleteLead(lead.id)} style={{ background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.2)", borderRadius: 2, color: MIL.red, padding: "5px 8px", fontFamily: MIL.head, fontSize: "0.5rem", cursor: "pointer" }}>✕</button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, fontFamily: MIL.head, color: MIL.dim, letterSpacing: 2 }}>NO LEADS IN THIS CATEGORY</div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#0d1117", border: "1px solid rgba(107,142,35,0.3)", borderRadius: 6, padding: 28, width: 420 }}>
            <div style={{ fontFamily: MIL.head, fontSize: "0.75rem", color: MIL.gold, letterSpacing: 2, marginBottom: 20 }}>NEW PROSPECT</div>
            {[
              { key: "company", label: "Company *", type: "text" },
              { key: "contactName", label: "Contact Name", type: "text" },
              { key: "estValue", label: "Est. Value (AED)", type: "number" },
              { key: "source", label: "Source", type: "text" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ fontFamily: MIL.head, fontSize: "0.5rem", color: MIL.dim, letterSpacing: 1, display: "block", marginBottom: 4 }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, padding: "7px 10px", color: MIL.text, fontFamily: MIL.font, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontFamily: MIL.head, fontSize: "0.5rem", color: MIL.dim, letterSpacing: 1, display: "block", marginBottom: 4 }}>Stage</label>
              <select value={form.stage} onChange={e => setForm(p => ({ ...p, stage: e.target.value }))} style={{ width: "100%", background: "#0d1117", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, color: MIL.text, fontFamily: MIL.font, fontSize: "0.9rem", padding: "7px 10px" }}>
                {["TO_CONTACT", "CONTACTED", "MEETING", "PROPOSAL", "NEGOTIATION", "WON"].map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={addLead} style={{ flex: 1, background: MIL.gold, border: "none", borderRadius: 3, color: "#000", padding: "8px", fontFamily: MIL.head, fontSize: "0.6rem", cursor: "pointer", letterSpacing: 1 }}>ADD PROSPECT</button>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 3, color: MIL.dim, padding: "8px", fontFamily: MIL.head, fontSize: "0.6rem", cursor: "pointer" }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
