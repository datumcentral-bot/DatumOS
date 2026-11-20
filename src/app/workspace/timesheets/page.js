"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const EMPTY = { taskId: "", hours: "", description: "", date: new Date().toISOString().split("T")[0] };

const S = {
  page: { padding: 24, background: "#0d1108", minHeight: "100vh", fontFamily: "'Rajdhani', sans-serif" },
  title: { fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#a8c060", letterSpacing: 2, margin: "0 0 4px" },
  sub: { color: "#6b7a5a", fontSize: "0.75rem", letterSpacing: 1, marginBottom: 20 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  btn: { background: "#4a6741", color: "#d4e8a0", border: "1px solid #5a7a50", borderRadius: 4, padding: "8px 18px", cursor: "pointer", fontFamily: "'Orbitron', sans-serif", fontSize: "0.7rem", letterSpacing: 1 },
  form: { background: "#1a1f14", border: "1px solid #2a3020", borderRadius: 6, padding: 20, marginBottom: 20 },
  formTitle: { fontFamily: "'Orbitron', sans-serif", fontSize: "0.7rem", color: "#a8c060", letterSpacing: 2, marginBottom: 16 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  label: { color: "#8a9a70", fontSize: "0.65rem", letterSpacing: 1, textTransform: "uppercase" },
  input: { background: "#0d1108", border: "1px solid #3a4a30", borderRadius: 4, padding: "8px 10px", color: "#c8d8a0", fontSize: "0.85rem", outline: "none" },
  actions: { display: "flex", gap: 10, justifyContent: "flex-end" },
  btnCancel: { background: "transparent", color: "#6b7a5a", border: "1px solid #3a4a30", borderRadius: 4, padding: "8px 18px", cursor: "pointer", fontSize: "0.8rem" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { background: "#1a1f14", color: "#6b7a5a", fontSize: "0.65rem", letterSpacing: 1, textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #2a3020" },
  td: { padding: "12px 14px", borderBottom: "1px solid #1a1f14", color: "#c8d8a0", fontSize: "0.85rem" },
};

export default function WorkspaceTimesheetsPage() {
  const { data: session } = useSession();
  const [entries, setEntries] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/time-entries").then(r => r.json()).catch(() => []),
      fetch("/api/pm-tasks").then(r => r.json()).catch(() => []),
    ]).then(([e, t]) => {
      setEntries(Array.isArray(e) ? e : []);
      setTasks(Array.isArray(t) ? t : []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (ev) => {
    ev.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, hours: parseFloat(form.hours) || 0 };
      if (session?.user?.id) payload.userId = session.user.id;
      await fetch("/api/time-entries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setShowForm(false); setForm(EMPTY); load();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const totalHours = entries.reduce((s, e) => s + (e.hours || 0), 0);

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>◇ TIMESHEETS</h1>
          <p style={S.sub}>LOG HOURS · TRACK TIME · PROJECT BILLING</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ background: "#1a1f14", border: "1px solid #2a3020", borderRadius: 6, padding: "10px 16px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.2rem", color: "#a8c060" }}>{totalHours.toFixed(1)}</div>
            <div style={{ color: "#6b7a5a", fontSize: "0.65rem", letterSpacing: 1 }}>TOTAL HRS</div>
          </div>
          <button style={S.btn} onClick={() => setShowForm(!showForm)}>+ LOG TIME</button>
        </div>
      </div>

      {showForm && (
        <div style={S.form}>
          <div style={S.formTitle}>LOG TIME ENTRY</div>
          <form onSubmit={handleSubmit}>
            <div style={S.row}>
              <div style={S.field}>
                <label style={S.label}>Task</label>
                <select style={S.input} value={form.taskId} onChange={f("taskId")}>
                  <option value="">Select task...</option>
                  {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </div>
              <div style={S.field}>
                <label style={S.label}>Hours *</label>
                <input style={S.input} type="number" step="0.5" min="0.5" max="24" value={form.hours} onChange={f("hours")} placeholder="8.0" required />
              </div>
              <div style={S.field}>
                <label style={S.label}>Date *</label>
                <input style={S.input} type="date" value={form.date} onChange={f("date")} required />
              </div>
            </div>
            <div style={{ ...S.field, marginBottom: 14 }}>
              <label style={S.label}>Description</label>
              <input style={S.input} value={form.description} onChange={f("description")} placeholder="What did you work on?" />
            </div>
            <div style={S.actions}>
              <button type="button" style={S.btnCancel} onClick={() => setShowForm(false)}>CANCEL</button>
              <button type="submit" style={S.btn} disabled={saving}>{saving ? "SAVING..." : "LOG TIME"}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ color: "#6b7a5a", textAlign: "center", padding: 60, fontFamily: "'Orbitron', sans-serif", fontSize: "0.8rem", letterSpacing: 2 }}>LOADING TIMESHEETS...</div>
      ) : (
        <div style={{ background: "#1a1f14", border: "1px solid #2a3020", borderRadius: 6, overflow: "hidden" }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Date</th>
                <th style={S.th}>Task</th>
                <th style={S.th}>Description</th>
                <th style={S.th}>Hours</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan={4} style={{ ...S.td, textAlign: "center", color: "#3a4a30", padding: 40 }}>No time entries yet. Click "+ LOG TIME" to start.</td></tr>
              ) : entries.map(e => (
                <tr key={e.id}>
                  <td style={{ ...S.td, color: "#8a9a70", fontSize: "0.75rem" }}>{e.startedAt ? new Date(e.startedAt).toLocaleDateString() : e.date || "—"}</td>
                  <td style={S.td}>{e.task?.title || "—"}</td>
                  <td style={{ ...S.td, color: "#6b7a5a" }}>{e.description || "—"}</td>
                  <td style={{ ...S.td, fontFamily: "'Orbitron', sans-serif", fontSize: "0.85rem", color: "#a8c060" }}>{e.hours || "—"}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
