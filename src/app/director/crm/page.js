"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/lib/useSocket";
import LiveToast from "@/components/LiveToast";
import OnlineUsers from "@/components/OnlineUsers";
import { KanbanBoard } from "./KanbanBoard";

const STAGES = ["TO_CONTACT", "CONTACTED", "MEETING_BOOKED", "PROPOSAL_SENT", "WON"];
const STAGE_LABELS = {
  TO_CONTACT: "To Contact", CONTACTED: "Contacted",
  MEETING_BOOKED: "Meeting Booked", PROPOSAL_SENT: "Proposal Sent", WON: "Won",
};
const SOURCES = ["Referral", "LinkedIn", "Website", "Cold Outreach", "Conference", "Partner", "Other"];
const SERVICES = ["BIM Coordination", "Scan to BIM", "Digital Twin", "MEP Coordination", "ISO 19650", "Staffing", "Other"];
const EMPTY = { company: "", contactName: "", contactEmail: "", contactPhone: "", country: "", source: "", serviceInterest: "", estValue: 0, stage: "TO_CONTACT", notes: "" };

const S = {
  page: { padding: 24, background: "#0d1108", minHeight: "100vh", fontFamily: "'Rajdhani', sans-serif" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  title: { fontFamily: "'Orbitron', sans-serif", fontSize: "1.1rem", color: "#a8c060", letterSpacing: 2, margin: 0 },
  sub: { color: "#6b7a5a", fontSize: "0.75rem", letterSpacing: 1, marginTop: 4 },
  btn: { background: "#4a6741", color: "#d4e8a0", border: "1px solid #5a7a50", borderRadius: 4, padding: "8px 18px", cursor: "pointer", fontFamily: "'Orbitron', sans-serif", fontSize: "0.7rem", letterSpacing: 1 },
  stats: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 24 },
  stat: { background: "#1a1f14", border: "1px solid #2a3020", borderRadius: 6, padding: "14px 16px" },
  statVal: { fontFamily: "'Orbitron', sans-serif", fontSize: "1.4rem", color: "#a8c060", margin: 0 },
  statLbl: { color: "#6b7a5a", fontSize: "0.65rem", letterSpacing: 1, textTransform: "uppercase", marginTop: 4 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
  modal: { background: "#1a1f14", border: "1px solid #3a4a30", borderRadius: 8, padding: 28, width: 560, maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { fontFamily: "'Orbitron', sans-serif", fontSize: "0.85rem", color: "#a8c060", letterSpacing: 2, marginBottom: 20 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 },
  field: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 },
  label: { color: "#8a9a70", fontSize: "0.65rem", letterSpacing: 1, textTransform: "uppercase" },
  input: { background: "#0d1108", border: "1px solid #3a4a30", borderRadius: 4, padding: "8px 10px", color: "#c8d8a0", fontSize: "0.85rem", outline: "none", width: "100%", boxSizing: "border-box" },
  actions: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 },
  btnCancel: { background: "transparent", color: "#6b7a5a", border: "1px solid #3a4a30", borderRadius: 4, padding: "8px 18px", cursor: "pointer", fontSize: "0.8rem" },
};

function fmt(n) { return "AED " + Number(n || 0).toLocaleString(); }

export default function CrmPage() {
  const { data: session } = useSession();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);

  // Real-time: handle incoming lead events from other users
  const handleLiveEvent = useCallback((ev) => {
    setLiveEvents(prev => [...prev, { ...ev, id: Date.now() + Math.random() }]);
    if (ev.action === 'created') {
      setLeads(prev => [ev.data, ...prev]);
    } else if (ev.action === 'updated' || ev.action === 'moved') {
      setLeads(prev => prev.map(l => l.id === ev.data.id ? { ...l, ...ev.data } : l));
    } else if (ev.action === 'deleted') {
      setLeads(prev => prev.filter(l => l.id !== ev.data.id));
    }
  }, []);

  const { isConnected, onlineUsers, emitCrud } = useSocket('leads', session?.user, handleLiveEvent);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/leads").then(r => r.json()).then(d => setLeads(Array.isArray(d) ? d : [])).catch(() => setLeads([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (lead) => { setEditing(lead); setForm({ ...lead }); setModal(true); };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target ? e.target.value : e }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, estValue: parseFloat(form.estValue) || 0 };
      if (editing) {
        await fetch(`/api/leads/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        showToast("Lead updated");
      } else {
        await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        showToast("Lead created");
      }
      setModal(false); load();
    } catch (err) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this lead?")) return;
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    showToast("Lead deleted"); load();
  };

  const totalValue = leads.reduce((s, l) => s + (l.estValue || 0), 0);
  const wonValue = leads.filter(l => l.stage === "WON").reduce((s, l) => s + (l.estValue || 0), 0);
  const byStage = STAGES.reduce((acc, s) => { acc[s] = leads.filter(l => l.stage === s).length; return acc; }, {});

  return (
    <div style={S.page}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: toast.type === "error" ? "#3a1010" : "#1a3010", border: `1px solid ${toast.type === "error" ? "#ff6b6b" : "#4a8a40"}`, borderRadius: 6, padding: "12px 20px", color: toast.type === "error" ? "#ff9090" : "#90d090", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.9rem" }}>
          {toast.msg}
        </div>
      )}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>⬡ CRM PIPELINE</h1>
          <p style={S.sub}>LEAD MANAGEMENT · PIPELINE TRACKING · OUTREACH CONTROL</p>
        </div>
        <button style={S.btn} onClick={openNew}>+ NEW LEAD</button>
      </div>
      <div style={S.stats}>
        <div style={S.stat}><p style={S.statVal}>{leads.length}</p><p style={S.statLbl}>Total Leads</p></div>
        <div style={S.stat}><p style={S.statVal}>{byStage.PROPOSAL_SENT || 0}</p><p style={S.statLbl}>Proposals Sent</p></div>
        <div style={S.stat}><p style={S.statVal}>{byStage.WON || 0}</p><p style={S.statLbl}>Won</p></div>
        <div style={S.stat}><p style={{ ...S.statVal, fontSize: "1rem" }}>{fmt(totalValue)}</p><p style={S.statLbl}>Pipeline Value</p></div>
        <div style={S.stat}><p style={{ ...S.statVal, fontSize: "1rem", color: "#7bbf4f" }}>{fmt(wonValue)}</p><p style={S.statLbl}>Won Value</p></div>
      </div>
      {loading ? (
        <div style={{ color: "#6b7a5a", textAlign: "center", padding: 60, fontFamily: "'Orbitron', sans-serif", fontSize: "0.8rem", letterSpacing: 2 }}>LOADING PIPELINE...</div>
      ) : (
        <KanbanBoard leads={leads} onEdit={openEdit} onDelete={handleDelete} onReload={load} />
      )}
      {modal && (
        <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div style={S.modal}>
            <h2 style={S.modalTitle}>{editing ? "EDIT LEAD" : "NEW LEAD"}</h2>
            <form onSubmit={handleSubmit}>
              <div style={S.row}>
                <div style={S.field}><label style={S.label}>Company *</label><input style={S.input} value={form.company} onChange={f("company")} placeholder="BAGC Engineering" required /></div>
                <div style={S.field}><label style={S.label}>Contact Name *</label><input style={S.input} value={form.contactName} onChange={f("contactName")} placeholder="Khalid Al-Rashid" required /></div>
              </div>
              <div style={S.row}>
                <div style={S.field}><label style={S.label}>Email</label><input style={S.input} type="email" value={form.contactEmail} onChange={f("contactEmail")} placeholder="khalid@bagc.ae" /></div>
                <div style={S.field}><label style={S.label}>Phone</label><input style={S.input} value={form.contactPhone} onChange={f("contactPhone")} placeholder="+971 50 123 4567" /></div>
              </div>
              <div style={S.row}>
                <div style={S.field}><label style={S.label}>Country</label><input style={S.input} value={form.country} onChange={f("country")} placeholder="UAE" /></div>
                <div style={S.field}><label style={S.label}>Est. Value (AED)</label><input style={S.input} type="number" value={form.estValue} onChange={f("estValue")} placeholder="250000" /></div>
              </div>
              <div style={S.row}>
                <div style={S.field}><label style={S.label}>Source</label><select style={S.input} value={form.source} onChange={f("source")}><option value="">Select source...</option>{SOURCES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div style={S.field}><label style={S.label}>Service Interest</label><select style={S.input} value={form.serviceInterest} onChange={f("serviceInterest")}><option value="">Select service...</option>{SERVICES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              <div style={S.field}><label style={S.label}>Stage</label><select style={S.input} value={form.stage} onChange={f("stage")}>{STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}</select></div>
              <div style={S.field}><label style={S.label}>Notes</label><textarea style={{ ...S.input, minHeight: 70, resize: "vertical" }} value={form.notes} onChange={f("notes")} placeholder="Additional notes..." /></div>
              <div style={S.actions}>
                <button type="button" style={S.btnCancel} onClick={() => setModal(false)}>CANCEL</button>
                <button type="submit" style={S.btn} disabled={saving}>{saving ? "SAVING..." : editing ? "UPDATE LEAD" : "CREATE LEAD"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}