"use client";
import { useState, useEffect } from "react";

export default function Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/bim/cde")
      .then(r => r.json())
      .then(d => { setData(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = data.filter(item =>
    JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1rem", borderBottom: "1px solid rgba(107,142,35,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 40, height: 40, borderRadius: 4, background: "rgba(107,142,35,0.12)", border: "1px solid rgba(107,142,35,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", color: "#6b8e23", boxShadow: "0 0 12px rgba(107,142,35,0.12)" }}>
            ◎
          </div>
          <div>
            <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "#fff", letterSpacing: "2px", textTransform: "uppercase" }}>Document Vault</h1>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>CDE Document Management</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH..." style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 2, color: "#f0f2f5", padding: "0.45rem 0.75rem", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.85rem", outline: "none", width: 200 }} />
          <button onClick={() => { setForm({}); setShowForm(true); }} style={{ background: "rgba(107,142,35,0.12)", border: "1px solid rgba(107,142,35,0.3)", borderRadius: 2, color: "#fff", padding: "0.45rem 1rem", fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "1.5px", cursor: "pointer", textTransform: "uppercase" }}>+ NEW</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {[
          { label: "TOTAL", value: loading ? "—" : data.length, color: "#6b8e23" },
          { label: "ACTIVE", value: loading ? "—" : data.filter(d => d.status === "ACTIVE" || d.active !== false).length, color: "#28a745" },
          { label: "PENDING", value: loading ? "—" : data.filter(d => d.status === "PENDING" || d.status === "IN_PROGRESS").length, color: "#ffb100" },
          { label: "CRITICAL", value: loading ? "—" : data.filter(d => d.priority === "HIGH" || d.severity === "CRITICAL").length, color: "#ff3b30" },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(107,142,35,0.12)", borderRadius: 4, padding: "1rem", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 10, height: 10, borderTop: `1px solid ${s.color}`, borderLeft: `1px solid ${s.color}`, opacity: 0.5 }} />
            <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.55rem", color: "#94a3b8", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.8rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(107,142,35,0.15)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid rgba(107,142,35,0.15)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "#6b8e23" }}>◆</span>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.7rem", color: "#fff", letterSpacing: "1px", textTransform: "uppercase" }}>Document Vault REGISTER</span>
          <span style={{ marginLeft: "auto", fontFamily: "'Orbitron', sans-serif", fontSize: "0.6rem", color: "#4d584d" }}>{filtered.length} RECORDS</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 48, background: "rgba(107,142,35,0.04)", borderRadius: 2 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "4rem", textAlign: "center", color: "#4d584d", fontFamily: "'Orbitron', sans-serif", fontSize: "0.7rem", letterSpacing: "2px" }}>NO RECORDS FOUND — CLICK + NEW TO ADD</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(107,142,35,0.05)", borderBottom: "1px solid rgba(107,142,35,0.15)" }}>
                  {Object.keys(filtered[0] || {}).filter(k => !["id","createdAt","updatedAt","passwordHash"].includes(k)).slice(0,6).map(k => (
                    <th key={k} style={{ padding: "0.65rem 1rem", textAlign: "left", fontFamily: "'Orbitron', sans-serif", fontSize: "0.6rem", color: "#6b8e23", letterSpacing: "1.5px", textTransform: "uppercase" }}>{k}</th>
                  ))}
                  <th style={{ padding: "0.65rem 1rem", fontFamily: "'Orbitron', sans-serif", fontSize: "0.6rem", color: "#6b8e23", letterSpacing: "1.5px" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.id || i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.02)"} onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    {Object.entries(row).filter(([k]) => !["id","createdAt","updatedAt","passwordHash"].includes(k)).slice(0,6).map(([k,v]) => (
                      <td key={k} style={{ padding: "0.65rem 1rem", fontSize: "0.82rem", color: "#f0f2f5", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {typeof v === "boolean" ? (v ? "✓" : "✗") : String(v ?? "—").slice(0,40)}
                      </td>
                    ))}
                    <td style={{ padding: "0.65rem 1rem" }}>
                      <button onClick={() => { setForm(row); setShowForm(true); }} style={{ background: "rgba(107,142,35,0.08)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 2, color: "#6b8e23", padding: "0.3rem 0.6rem", fontFamily: "'Orbitron', sans-serif", fontSize: "0.55rem", cursor: "pointer", letterSpacing: "1px" }}>EDIT</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowForm(false)}>
          <div style={{ background: "rgba(13,17,23,0.98)", border: "1px solid rgba(107,142,35,0.3)", borderRadius: 4, padding: "2rem", width: "100%", maxWidth: 520, position: "relative" }} onClick={e => e.stopPropagation()}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #6b8e23, transparent)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.8rem", color: "#fff", letterSpacing: "1px", textTransform: "uppercase" }}>{form.id ? "EDIT RECORD" : "NEW RECORD"}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1rem" }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {Object.keys(form).filter(k => !["id","createdAt","updatedAt","passwordHash"].includes(k)).slice(0,6).map(k => (
                <div key={k}>
                  <label style={{ display: "block", fontFamily: "'Orbitron', sans-serif", fontSize: "0.55rem", color: "#94a3b8", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6 }}>{k}</label>
                  <input value={String(form[k] ?? "")} onChange={e => setForm({...form, [k]: e.target.value})} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 2, color: "#f0f2f5", padding: "0.5rem 0.75rem", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.9rem", outline: "none" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button onClick={() => setShowForm(false)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, color: "#94a3b8", padding: "0.5rem 1rem", fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", cursor: "pointer", letterSpacing: "1px" }}>CANCEL</button>
              <button disabled={saving} onClick={async () => {
                setSaving(true);
                try {
                  const method = form.id ? "PUT" : "POST";
                  const url = form.id ? `/api/admin/data/document_vault/${form.id}` : `/api/admin/data/document_vault`;
                  const res = await fetch(url, { method, headers: {"Content-Type":"application/json"}, body: JSON.stringify(form) });
                  if (res.ok) {
                    const updated = await fetch("/api/admin/data?collection=document_vault").then(r=>r.json());
                    setData(Array.isArray(updated) ? updated : []);
                    setShowForm(false); setForm({});
                  }
                } finally { setSaving(false); }
              }} style={{ background: "rgba(107,142,35,0.12)", border: "1px solid rgba(107,142,35,0.3)", borderRadius: 2, color: "#fff", padding: "0.5rem 1.25rem", fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", letterSpacing: "1px", opacity: saving ? 0.6 : 1 }}>{saving ? "SAVING..." : "SAVE"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}