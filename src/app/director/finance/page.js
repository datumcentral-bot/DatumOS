"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/lib/useSocket";
import LiveToast from "@/components/LiveToast";

const TYPE_OPTS = ["INVOICE","PAYMENT","EXPENSE","BUDGET","VARIATION","RETENTION","ADVANCE"];
const STATUS_OPTS = ["DRAFT","SENT","PAID","OVERDUE","CANCELLED","PARTIAL"];
const CURRENCY_OPTS = ["AED","USD","GBP","EUR","SAR","QAR","KWD"];
const EMPTY = { projectId:'', clientId:'', type:"INVOICE", title:"", amount:"", currency:"AED", status:"DRAFT", dueDate:"", invoiceNo:"", notes:"" };

const MIL = {
  bg: "#0a0e14",
  panel: "rgba(10,14,20,0.97)",
  border: "rgba(107,142,35,0.3)",
  green: "#6b8e23",
  gold: "#c19749",
  text: "#f0f2f5",
  dim: "#8a9bb0",
  blue: "#4a9eff",
  font: "'Rajdhani', sans-serif",
  head: "'Orbitron', sans-serif",
};

export default function FinancialControlPage() {
  const { data: session } = useSession();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveEvents, setLiveEvents] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  const load = async () => {
    try {
      const res = await fetch("/api/financial");
      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json.data || []);
      setData(arr);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLiveEvent = useCallback((ev) => {
    setLiveEvents(prev => [...prev, { ...ev, id: Date.now() + Math.random() }]);
    if (ev.action === "poll") { load(); return; }
    if (ev.action === "created" || ev.action === "updated" || ev.action === "deleted") {
      load();
    }
  }, []);

  const { isConnected, onlineUsers, emitCrud } = useSocket("financial", session?.user, handleLiveEvent);

  useEffect(() => {
    load();
    fetch("/api/projects").then(r=>r.json()).then(setProjects);
    fetch("/api/clients").then(r=>r.json()).then(setClients);
  }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) };
  const openEdit = (row) => { setEditing(row); setForm({ ...row, dueDate: row.dueDate ? row.dueDate.split("T")[0] : "", amount: String(row.amount) }); setModal(true) };
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) || 0, dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null };
      if (editing) {
        const res = await fetch(`/api/financial/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const _updatedData = await res.json();
        emitCrud("updated", _updatedData || form);
      } else {
        const res = await fetch("/api/financial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const _createdData = await res.json();
        emitCrud("created", _createdData || form);
      }
      setModal(false);
    } catch(err) {
      alert(err.message || "Error saving");
    } finally { setSaving(false); }
  };

  const filtered = data.filter(d =>
    (!filterStatus || d.status === filterStatus) &&
    (!filterType || d.type === filterType)
  );

  const totalInvoiced = data.filter(d=>d.type==="INVOICE").reduce((s,d)=>s+(d.amount||0),0);
  const totalPaid = data.filter(d=>d.status==="PAID").reduce((s,d)=>s+(d.amount||0),0);
  const totalOutstanding = data.filter(d=>["SENT","OVERDUE"].includes(d.status)).reduce((s,d)=>s+(d.amount||0),0);

  const fmt = (n) => n.toLocaleString("en-AE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const cols = [
    { key: "invoiceNo", label: "REF NO" },
    { key: "title", label: "DESCRIPTION" },
    { key: "type", label: "TYPE" },
    { key: "amount", label: "AMOUNT" },
    { key: "status", label: "STATUS" },
    { key: "dueDate", label: "DUE DATE" },
    { key: "client", label: "CLIENT" },
    { key: "project", label: "PROJECT" },
  ];

  return (
    <div style={{ padding: 24, background: "#0d1108", minHeight: "100vh", fontFamily: "'Rajdhani', sans-serif", color: "#f0f2f5" }}>
      <LiveToast events={liveEvents} />

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingBottom: "1rem", borderBottom: "1px solid rgba(107,142,35,0.3)" }}>
        <span style={{ fontSize: "1.5rem" }}>▧</span>
        <div>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "2px", textTransform: "uppercase" }}>
            FINANCIAL CONTROL
          </h1>
          <p style={{ fontSize: "0.7rem", color: "#8a9bb0", marginTop: 4 }}>
            Budget tracking, invoices, payments and cost control
          </p>
        </div>
      </div>

      <button
        onClick={openNew}
        disabled={loading}
        style={{
          padding: "0.6rem 1rem",
          background: "rgba(107,142,35,0.1)",
          border: "1px solid rgba(107,142,35,0.3)",
          borderRadius: 3,
          color: "#6b8e23",
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "0.7rem",
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        + NEW ENTRY
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "rgba(16,20,26,0.8)", border: "1px solid rgba(107,142,35,0.3)", borderRadius: 4, padding: "1rem" }}>
          <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>TOTAL INVOICED</div>
          <div style={{ fontSize: "1.5rem", fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: "#6b8e23", marginTop: 4 }}>
            AED {fmt(totalInvoiced)}
          </div>
        </div>
        <div style={{ background: "rgba(16,20,26,0.8)", border: "1px solid rgba(107,142,35,0.3)", borderRadius: 4, padding: "1rem" }}>
          <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>COLLECTED</div>
          <div style={{ fontSize: "1.5rem", fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: "#6b8e23", marginTop: 4 }}>
            AED {fmt(totalPaid)}
          </div>
        </div>
        <div style={{ background: "rgba(16,20,26,0.8)", border: "1px solid rgba(107,142,35,0.3)", borderRadius: 4, padding: "1rem" }}>
          <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>OUTSTANDING</div>
          <div style={{ fontSize: "1.5rem", fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: "#c19749", marginTop: 4 }}>
            AED {fmt(totalOutstanding)}
          </div>
        </div>
        <div style={{ background: "rgba(16,20,26,0.8)", border: "1px solid rgba(107,142,35,0.3)", borderRadius: 4, padding: "1rem" }}>
          <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>OVERDUE</div>
          <div style={{ fontSize: "1.5rem", fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: "#ff3b30", marginTop: 4 }}>
            {data.filter(d=>d.status==="OVERDUE").length}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: 4 }}>TYPE</label>
          <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, color: MIL.text, fontFamily: "'Rajdhani', sans-serif", fontSize: "0.7rem" }}>
            <option value="">ALL TYPES</option>
            {TYPE_OPTS.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ color: "#94a3b8", fontFamily: MIL.font, fontSize: "0.65rem", display: "block", marginBottom: 4 }}>STATUS</label>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, color: MIL.text, fontFamily: "'Rajdhani', sans-serif", fontSize: "0.7rem" }}>
            <option value="">ALL STATUSES</option>
            {STATUS_OPTS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{ background: "rgba(16,20,26,0.8)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 4, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
          <thead>
            <tr style={{ background: "rgba(107,142,35,0.1)" }}>
              <th style={{ padding: "0.6rem", textAlign: "left", color: "#94a3b8", fontSize: "0.65rem", fontWeight: 600 }}>REF NO</th>
              <th style={{ padding: "0.6rem", textAlign: "left", color: "#94a3b8", fontSize: "0.65rem", fontWeight: 600 }}>DESCRIPTION</th>
              <th style={{ padding: "0.6rem", textAlign: "left", color: "#94a3b8", fontSize: "0.65rem", fontWeight: 600 }}>TYPE</th>
              <th style={{ padding: "0.6rem", textAlign: "left", color: "#94a3b8", fontSize: "0.65rem", fontWeight: 600 }}>AMOUNT</th>
              <th style={{ padding: "0.6rem", textAlign: "left", color: "#94a3b8", fontSize: "0.65rem", fontWeight: 600 }}>STATUS</th>
              <th style={{ padding: "0.6rem", textAlign: "left", color: "#94a3b8", fontSize: "0.65rem", fontWeight: 600 }}>DUE DATE</th>
              <th style={{ padding: "0.6rem", textAlign: "left", color: "#94a3b8", fontSize: "0.65rem", fontWeight: 600 }}>CLIENT</th>
              <th style={{ padding: "0.6rem", textAlign: "left", color: "#94a3b8", fontSize: "0.65rem", fontWeight: 600 }}>PROJECT</th>
              <th style={{ padding: "0.6rem", textAlign: "center", color: "#94a3b8", fontSize: "0.65rem", fontWeight: 600 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: "0.7rem" }}>
                <td style={{ padding: "0.5rem", color: "#cbd5e1" }}>{row.invoiceNo}</td>
                <td style={{ padding: "0.5rem", color: "#cbd5e1" }}>{row.title}</td>
                <td style={{ padding: "0.5rem", color: "#cbd5e1" }}>{row.type}</td>
                <td style={{ padding: "0.5rem", color: "#cbd5e1" }}>{row.currency} {fmt(row.amount)}</td>
                <td style={{ padding: "0.5rem", color: "#cbd5e1" }}>
                  <span style={{ display: "inline-block", padding: "2px 6px", borderRadius: 3, fontSize: "0.65rem",
                    background: row.status === "PAID" ? "rgba(40,167,69,0.2)" : row.status === "OVERDUE" ? "rgba(255,59,48,0.2)" : row.status === "DRAFT" ? "rgba(193,151,73,0.2)" : "rgba(76,201,240,0.2)",
                    color: row.status === "PAID" ? "#28a745" : row.status === "OVERDUE" ? "#ff3b30" : row.status === "DRAFT" ? "#c19749" : "#4cc9f0" }}>
                    {row.status}
                  </span>
                </td>
                <td style={{ padding: "0.5rem", color: "#cbd5e1" }}>{row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "—"}</td>
                <td style={{ padding: "0.5rem", color: "#cbd5e1" }}>{row.client?.companyName || "—"}</td>
                <td style={{ padding: "0.5rem", color: "#cbd5e1" }}>{row.project?.name || "—"}</td>
                <td style={{ padding: "0.5rem", textAlign: "right" }}>
                  <button onClick={() => openEdit(row)} style={{ background: "rgba(107,142,35,0.1)", border: "1px solid rgba(107,142,35,0.3)", color: "#6b8e23", padding: "4px 8px", borderRadius: 3, fontSize: "0.65rem", cursor: "pointer" }}>EDIT</button>
                  <button onClick={async () => { await fetch(`/api/financial/${row.id}`, { method: "DELETE" }); load(); }} style={{ background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.2)", color: "#ff3b30", padding: "4px 8px", borderRadius: 3, fontSize: "0.65rem", cursor: "pointer" }}>DELETE</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td style={{ padding: "1rem", textAlign: "center", color: "#94a3b8", colSpan: 9 }}>No financial entries</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#0d1108", border: "1px solid rgba(107,142,35,0.3)", borderRadius: 4, padding: "1.5rem", minWidth: "500px", maxWidth: "80%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", fontWeight: 700, color: "#fff" }}>{editing ? "EDIT ENTRY" : "NEW FINANCIAL ENTRY"}</h2>
              <button onClick={() => setModal(false)} style={{ background: "rgba(107,142,35,0.1)", border: "1px solid rgba(107,142,35,0.3)", color: "#6b8e23", padding: "4px 8px", borderRadius: 3, fontSize: "0.65rem", cursor: "pointer" }}>CLOSE</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: 6, color: "#94a3b8", fontFamily: "'Rajdhani', sans-serif" }}>TYPE</label>
                  <select value={form.type} onChange={f("type")} style={{ width: "100%", padding: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, color: MIL.text, fontFamily: "'Rajdhani', sans-serif", fontSize: "0.7rem" }}>
                    {TYPE_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: 6, color: "#94a3b8", fontFamily: "'Rajdhani', sans-serif" }}>INVOICE / REF NO</label>
                  <input type="text" value={form.invoiceNo} onChange={f("invoiceNo")} placeholder="e.g. INV-2026-001" style={{ width: "100%", padding: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, color: MIL.text, fontFamily: "'Rajdhani', sans-serif", fontSize: "0.7rem" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: 6, color: "#94a3b8", fontFamily: "'Rajdhani', sans-serif" }}>DESCRIPTION</label>
                  <input type="text" value={form.title} onChange={f("title")} placeholder="e.g. BIM Modeling Services — Phase 1" style={{ width: "100%", padding: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, color: MIL.text, fontFamily: "'Rajdhani', sans-serif", fontSize: "0.7rem" }} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: 6, color: "#94a3b8", fontFamily: "'Rajdhani', sans-serif" }}>AMOUNT</label>
                  <input type="number" value={form.amount} onChange={f("amount")} placeholder="0.00" style={{ width: "100%", padding: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, color: MIL.text, fontFamily: "'Rajdhani', sans-serif", fontSize: "0.7rem" }} required />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: 6, color: "#94a3b8", fontFamily: "'Rajdhani', sans-serif" }}>STATUS</label>
                  <select value={form.status} onChange={f("status")} style={{ width: "100%", padding: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, color: MIL.text, fontFamily: "'Rajdhani', sans-serif", fontSize: "0.7rem" }}>
                    {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: 6, color: "#94a3b8", fontFamily: "'Rajdhani', sans-serif" }}>DUE DATE</label>
                  <input type="date" value={form.dueDate} onChange={f("dueDate")} style={{ width: "100%", padding: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, color: MIL.text, fontFamily: "'Rajdhani', sans-serif", fontSize: "0.7rem" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: 6, color: "#94a3b8", fontFamily: "'Rajdhani', sans-serif" }}>CLIENT</label>
                  <select value={form.clientId} onChange={f("clientId")} style={{ width: "100%", padding: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, color: MIL.text, fontFamily: "'Rajdhani', sans-serif", fontSize: "0.7rem" }}>
                    <option value="">Select client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: 6, color: "#94a3b8", fontFamily: "'Rajdhani', sans-serif" }}>PROJECT</label>
                  <select value={form.projectId} onChange={f("projectId")} style={{ width: "100%", padding: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, color: MIL.text, fontFamily: "'Rajdhani', sans-serif", fontSize: "0.7rem" }}>
                    <option value="">Select project...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 6, color: "#94a3b8", fontFamily: "'Rajdhani', sans-serif" }}>NOTES</label>
                <textarea value={form.notes} onChange={f("notes")} placeholder="Payment terms, notes..." rows={2} style={{ width: "100%", padding: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 3, color: MIL.text, fontFamily: "'Rajdhani', sans-serif", fontSize: "0.7rem" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="button" onClick={() => setModal(false)} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", borderRadius: 3, fontFamily: "'Rajdhani', sans-serif", fontSize: "0.7rem", cursor: "pointer" }}>CANCEL</button>
                <button type="submit" disabled={saving} style={{ padding: "8px 16px", background: "#6b8e23", border: "none", borderRadius: 3, color: "#fff", fontFamily: "'Orbitron', sans-serif", fontSize: "0.7rem", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>{saving ? "SAVING..." : "SAVE CHANGES"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
