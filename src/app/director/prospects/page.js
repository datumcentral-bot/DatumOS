"use client";
import { useState, useEffect, useCallback } from "react";

const MIL = {
  bg: "#0a0e14", panel: "rgba(13,17,23,0.95)", border: "rgba(107,142,35,0.2)",
  green: "#6b8e23", gold: "#c19749", red: "#ff3b30",
  text: "#f0f2f5", dim: "#8a9bb0", font: "'Rajdhani', sans-serif", head: "'Orbitron', sans-serif",
};

const BLANK = { company: "", contactName: "", contactEmail: "", contactPhone: "", country: "UAE", source: "", stage: "TO_CONTACT", estValue: "", notes: "" };

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1a2a1a", border: "1px solid #6b8e23", borderRadius: 4, padding: "10px 18px", fontFamily: MIL.head, fontSize: "0.65rem", color: "#a2d033", letterSpacing: 1, zIndex: 9999 }}>
      {msg}
    </div>
  );
}

export default function ProspectsPage() {
  const [prospects, setProspects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => setToast(msg);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/leads");
      const data = await r.json();
      setProspects(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Ctrl+N to add new
  const handleKey = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "n") {
      e.preventDefault();
      setForm(BLANK); setIsNew(true); setSelected(null);
    }
    if (e.key === "Escape") { setIsNew(false); setSelected(null); }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const selectProspect = (p) => {
    setSelected(p);
    setForm({ ...BLANK, ...p, estValue: p.estValue?.toString() || "" });
    setIsNew(false);
  };

  const save = async () => {
    if (!form.company) return;
    setSaving(true);
    try {
      const payload = { ...form, estValue: parseFloat(form.estValue) || 0 };
      if (isNew) {
        const r = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (r.ok) {
          showToast("✓ PROSPECT ADDED");
          setIsNew(false);
          load();
        }
      } else if (selected) {
        const r = await fetch(`/api/leads/${selected.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (r.ok) {
          showToast("✓ PROSPECT UPDATED");
          load();
        }
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const deletePros = async (id) => {
    if (!confirm("Delete this prospect?")) return;
    try {
      await fetch(`/api/leads/${id}`, { method: "DELETE" });
      setSelected(null);
      setForm(BLANK);
      showToast("✗ PROSPECT DELETED");
      load();
    } catch (e) { console.error(e); }
  };

  const filtered = prospects.filter(p =>
    !search || p.company?.toLowerCase().includes(search.toLowerCase()) || p.contactName?.toLowerCase().includes(search.toLowerCase())
  );

  const STAGE_COLOR = { TO_CONTACT: "#4a9eff", CONTACTED: MIL.gold, MEETING: MIL.red, PROPOSAL: MIL.red, NEGOTIATION: "#ff6b35", WON: MIL.green, LOST: MIL.dim };

  return (
    <div style={{ fontFamily: MIL.font, color: MIL.text, height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div style={{ fontFamily: MIL.head, fontSize: "1.2rem", color: MIL.green, letterSpacing: 3 }}>◈ CRM DATABASE</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, padding: "5px 10px", color: MIL.text, fontFamily: MIL.font, fontSize: "0.85rem", outline: "none", width: 180 }} />
          <button onClick={() => { setForm(BLANK); setIsNew(true); setSelected(null); }} style={{ background: MIL.green, border: "none", borderRadius: 3, color: "#fff", padding: "5px 12px", fontFamily: MIL.head, fontSize: "0.55rem", cursor: "pointer", letterSpacing: 1 }}>
            + NEW [Ctrl+N]
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flex: 1, overflow: "hidden" }}>
        {/* List */}
        <div style={{ width: 280, background: MIL.panel, border: `1px solid ${MIL.border}`, borderRadius: 4, overflowY: "auto", flexShrink: 0 }}>
          <div style={{ padding: "10px 12px", borderBottom: `1px solid ${MIL.border}`, fontFamily: MIL.head, fontSize: "0.5rem", color: MIL.dim, letterSpacing: 2 }}>
            {filtered.length} PROSPECTS
          </div>
          {loading ? (
            <div style={{ padding: 20, textAlign: "center", fontFamily: MIL.head, color: MIL.green, fontSize: "0.6rem" }}>LOADING...</div>
          ) : filtered.map(p => (
            <div key={p.id} onClick={() => selectProspect(p)} style={{ padding: "10px 12px", borderBottom: `1px solid rgba(107,142,35,0.06)`, cursor: "pointer", background: selected?.id === p.id ? "rgba(107,142,35,0.08)" : "transparent", borderLeft: selected?.id === p.id ? `3px solid ${MIL.green}` : "3px solid transparent" }}>
              <div style={{ fontFamily: MIL.head, fontSize: "0.65rem", color: MIL.text, letterSpacing: 0.5 }}>{p.company}</div>
              <div style={{ fontSize: "0.75rem", color: MIL.dim, marginTop: 2 }}>{p.contactName}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontFamily: MIL.head, fontSize: "0.45rem", color: STAGE_COLOR[p.stage] || MIL.dim, letterSpacing: 1 }}>{p.stage?.replace(/_/g, " ")}</span>
                <span style={{ fontFamily: MIL.head, fontSize: "0.5rem", color: MIL.gold }}>AED {((p.estValue || 0) / 1000).toFixed(0)}K</span>
              </div>
            </div>
          ))}
        </div>

        {/* Detail / Form */}
        <div style={{ flex: 1, background: MIL.panel, border: `1px solid ${MIL.border}`, borderRadius: 4, padding: 20, overflowY: "auto" }}>
          {!selected && !isNew ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 12 }}>
              <div style={{ fontFamily: MIL.head, fontSize: "0.65rem", color: MIL.dim, letterSpacing: 2 }}>SELECT A PROSPECT OR</div>
              <button onClick={() => { setForm(BLANK); setIsNew(true); }} style={{ background: MIL.green, border: "none", borderRadius: 3, color: "#fff", padding: "8px 20px", fontFamily: MIL.head, fontSize: "0.6rem", cursor: "pointer", letterSpacing: 1 }}>+ ADD NEW [Ctrl+N]</button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontFamily: MIL.head, fontSize: "0.75rem", color: isNew ? MIL.gold : MIL.green, letterSpacing: 2 }}>
                  {isNew ? "NEW PROSPECT" : form.company?.toUpperCase()}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {!isNew && selected && (
                    <button onClick={() => deletePros(selected.id)} style={{ background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.2)", borderRadius: 3, color: MIL.red, padding: "5px 10px", fontFamily: MIL.head, fontSize: "0.55rem", cursor: "pointer" }}>DELETE</button>
                  )}
                  <button onClick={save} disabled={saving} style={{ background: MIL.green, border: "none", borderRadius: 3, color: "#fff", padding: "5px 14px", fontFamily: MIL.head, fontSize: "0.55rem", cursor: "pointer", letterSpacing: 1 }}>
                    {saving ? "SAVING..." : "SAVE"}
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[
                  { key: "company", label: "Company *", type: "text" },
                  { key: "contactName", label: "Contact Name", type: "text" },
                  { key: "contactEmail", label: "Email", type: "email" },
                  { key: "contactPhone", label: "Phone", type: "text" },
                  { key: "country", label: "Country", type: "text" },
                  { key: "source", label: "Source", type: "text" },
                  { key: "estValue", label: "Est. Value (AED)", type: "number" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontFamily: MIL.head, fontSize: "0.5rem", color: MIL.dim, letterSpacing: 1, display: "block", marginBottom: 4 }}>{f.label}</label>
                    <input type={f.type} value={form[f.key] || ""} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, padding: "7px 10px", color: MIL.text, fontFamily: MIL.font, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
                <div>
                  <label style={{ fontFamily: MIL.head, fontSize: "0.5rem", color: MIL.dim, letterSpacing: 1, display: "block", marginBottom: 4 }}>Stage</label>
                  <select value={form.stage || "TO_CONTACT"} onChange={e => setForm(p => ({ ...p, stage: e.target.value }))} style={{ width: "100%", background: "#0d1117", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, color: MIL.text, fontFamily: MIL.font, fontSize: "0.9rem", padding: "7px 10px" }}>
                    {["TO_CONTACT", "CONTACTED", "MEETING", "PROPOSAL", "NEGOTIATION", "WON", "LOST"].map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <label style={{ fontFamily: MIL.head, fontSize: "0.5rem", color: MIL.dim, letterSpacing: 1, display: "block", marginBottom: 4 }}>Notes</label>
                <textarea value={form.notes || ""} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={4}
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, padding: "7px 10px", color: MIL.text, fontFamily: MIL.font, fontSize: "0.9rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
