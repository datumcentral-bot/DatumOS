"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/lib/useSocket";
import LiveToast from "@/components/LiveToast";

const SEVERITY_COLORS = {
  CRITICAL: { bg: "rgba(255,59,48,0.15)", border: "#ff3b30", text: "#ff3b30", glow: "rgba(255,59,48,0.3)" },
  HIGH:     { bg: "rgba(255,149,0,0.12)", border: "#ff9500", text: "#ff9500", glow: "rgba(255,149,0,0.3)" },
  MEDIUM:   { bg: "rgba(193,151,73,0.12)", border: "#c19749", text: "#c19749", glow: "rgba(193,151,73,0.3)" },
  LOW:      { bg: "rgba(107,142,35,0.12)", border: "#6b8e23", text: "#6b8e23", glow: "rgba(107,142,35,0.3)" },
};

const STATUS_COLORS = {
  OPEN:         { bg: "rgba(255,59,48,0.1)", border: "rgba(255,59,48,0.4)", text: "#ff3b30" },
  INVESTIGATING:{ bg: "rgba(255,177,0,0.1)", border: "rgba(255,177,0,0.4)", text: "#ffb100" },
  RESOLVED:     { bg: "rgba(40,167,69,0.1)", border: "rgba(40,167,69,0.4)", text: "#28a745" },
};

const EMPTY_INCIDENT = {
  title: "",
  description: "",
  severity: "MEDIUM",
  status: "OPEN",
  assigneeId: "",
  projectId: "",
  resolution: "",
};

export default function WarRoomPage() {
  const { data: session } = useSession();
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, investigating: 0, resolved: 0, critical: 0 });
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_INCIDENT);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [liveEvents, setLiveEvents] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  const handleLiveEvent = useCallback((ev) => {
    setLiveEvents((prev) => [...prev, { ...ev, id: Date.now() + Math.random() }]);
    if (ev.action === "created") {
      setIncidents((prev) => [ev.data, ...prev]);
    } else if (ev.action === "updated") {
      setIncidents((prev) => prev.map((i) => (i.id === ev.data.id ? { ...i, ...ev.data } : i)));
    } else if (ev.action === "deleted") {
      setIncidents((prev) => prev.filter((i) => i.id !== ev.data.id));
    }
    load();
  }, []);

  const { isConnected, onlineUsers, emitCrud } = useSocket("warroom", session?.user, handleLiveEvent);

  const load = async () => {
    try {
      const [dataRes, projRes, userRes] = await Promise.all([
        fetch("/api/war-room"),
        fetch("/api/pm-projects").then((r) => r.json()),
        fetch("/api/clients").then((r) => r.json()),
      ]);
      const data = await dataRes.json();
      if (data.incidents) {
        setIncidents(data.incidents);
        setStats(data.stats);
        setProjects(data.projects || []);
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error("WarRoom load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = incidents.filter((i) => {
    const matchSeverity = filterSeverity === "ALL" || i.severity === filterSeverity;
    const matchStatus = filterStatus === "ALL" || i.status === filterStatus;
    const matchProject = !selectedProject || i.projectId === selectedProject;
    const matchSearch = !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase());
    return matchSeverity && matchStatus && matchProject && matchSearch;
  });

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_INCIDENT);
    setShowForm(true);
  };

  const openEdit = (incident) => {
    setEditing(incident);
    setForm({
      title: incident.title,
      description: incident.description || "",
      severity: incident.severity,
      status: incident.status,
      assigneeId: incident.assigneeId || "",
      projectId: incident.projectId || "",
      resolution: incident.resolution || "",
    });
    setShowForm(true);
  };

  const save = async (e) => {
    e?.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (editing) {
        const res = await fetch("/api/war-room", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editing.id }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const updated = await res.json();
        setIncidents((prev) => prev.map((i) => (i.id === editing.id ? updated : i)));
        emitCrud("updated", updated);
      } else {
        const res = await fetch("/api/war-room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const created = await res.json();
        setIncidents((prev) => [created, ...prev]);
        emitCrud("created", created);
      }
      setShowForm(false);
      setForm(EMPTY_INCIDENT);
      setEditing(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteIncident = async (id) => {
    if (!confirm("Delete this incident?")) return;
    try {
      const url = `/api/war-room?id=${id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      setIncidents((prev) => prev.filter((i) => i.id !== id));
      emitCrud("deleted", { id });
    } catch (err) {
      alert(err.message);
    }
  };

  const resolveIncident = async (incident) => {
    try {
      const res = await fetch("/api/war-room", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...incident, status: "RESOLVED", resolution: incident.resolution || "Resolved via War Room" }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      setIncidents((prev) => prev.map((i) => (i.id === incident.id ? updated : i)));
      emitCrud("updated", updated);
    } catch (err) {
      alert(err.message);
    }
  };

  const S = {
    page: { fontFamily: "'Rajdhani',sans-serif", color: "#f0f2f5", minHeight: "100vh", padding: 24 },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
    card: (color) => ({
      background: "rgba(13,17,23,0.8)",
      border: `1px solid ${color || "rgba(107,142,35,0.2)"}`,
      borderRadius: 6,
      padding: "1rem",
    }),
    btn: (c = "#6b8e23") => ({
      background: `rgba(107,142,35,0.12)`,
      border: `1px solid ${c}`,
      borderRadius: 3,
      color: c,
      padding: "0.4rem 0.9rem",
      fontFamily: "'Orbitron',sans-serif",
      fontSize: "0.55rem",
      letterSpacing: "1px",
      cursor: "pointer",
    }),
    input: {
      width: "100%",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(107,142,35,0.2)",
      borderRadius: 3,
      color: "#f0f2f5",
      padding: "0.5rem 0.75rem",
      fontFamily: "'Rajdhani',sans-serif",
      fontSize: "0.9rem",
      boxSizing: "border-box",
    },
  };

  return (
    <div style={S.page}>
      {liveEvents.length > 0 && <LiveToast events={liveEvents} />}

      <div style={S.header}>
        <div>
          <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "1.1rem", color: "#fff", letterSpacing: "3px", margin: 0 }}>⚔ WAR ROOM</h1>
          <p style={{ color: "#4d584d", fontSize: "0.8rem", margin: "0.25rem 0 0" }}>Real-time incident command center</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.65rem", color: isConnected ? "#28a745" : "#ff3b30", fontFamily: "'Orbitron',sans-serif" }}>
            ● {isConnected ? "LIVE" : "OFFLINE"}
          </span>
          <button onClick={openNew} style={{ ...S.btn(), background: "rgba(107,142,35,0.2)" }}>
            + NEW INCIDENT
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {[
          { label: "TOTAL", value: stats.total, color: "#6b8e23" },
          { label: "OPEN", value: stats.open, color: "#ff3b30" },
          { label: "INVESTIGATING", value: stats.investigating, color: "#ffb100" },
          { label: "RESOLVED", value: stats.resolved, color: "#28a745" },
          { label: "CRITICAL", value: stats.critical, color: "#ff0000" },
        ].map((s) => (
          <div key={s.label} style={{ ...S.card(), textAlign: "center", borderColor: `${s.color}33` }}>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "1.5rem", color: s.color, fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: "0.65rem", color: "#4d584d", letterSpacing: "1px", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH INCIDENTS..."
          style={{ ...S.input, width: 240 }}
        />
        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} style={{ ...S.input, width: 160 }}>
          <option value="ALL">ALL SEVERITIES</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...S.input, width: 160 }}>
          <option value="ALL">ALL STATUSES</option>
          <option value="OPEN">OPEN</option>
          <option value="INVESTIGATING">INVESTIGATING</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>
        <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} style={{ ...S.input, width: 200 }}>
          <option value="">ALL PROJECTS</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
        </select>
      </div>

      {/* Incident Feed */}
      <div style={{ ...S.card("#ff3b30"), marginBottom: "1.25rem" }}>
        <p style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.65rem", color: "#6b8e23", letterSpacing: "2px", marginBottom: "1rem", textTransform: "uppercase" }}>📡 Live Incident Feed</p>
        {loading ? (
          <div style={{ color: "#4d584d", textAlign: "center", padding: "2rem" }}>LOADING...</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: "#4d584d", textAlign: "center", padding: "2rem" }}>No incidents match your filters.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {filtered.map((incident) => {
              const sc = SEVERITY_COLORS[incident.severity] || SEVERITY_COLORS.MEDIUM;
              const stc = STATUS_COLORS[incident.status] || STATUS_COLORS.OPEN;
              return (
                <div key={incident.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderLeft: `3px solid ${sc.border}`, borderRadius: 3 }}>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.45rem", color: sc.text, border: `1px solid ${sc.border}`, borderRadius: 2, padding: "2px 6px", letterSpacing: "1px", background: sc.bg }}>
                      {incident.severity}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.9rem", color: "#f0f2f5", fontWeight: 600 }}>{incident.title}</div>
                    {incident.description && <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>{incident.description?.slice(0, 100)}{incident.description?.length > 100 ? "..." : ""}</div>}
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: 4, alignItems: "center" }}>
                      {incident.project && <span style={{ fontSize: "0.65rem", color: "#c19749" }}>{incident.project.code}</span>}
                      {incident.assignee && <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>→ {incident.assignee.name}</span>}
                      <span style={{ fontSize: "0.6rem", color: "#4d584d" }}>{new Date(incident.reportedAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.45rem", color: stc.text, border: `1px solid ${stc.border}`, borderRadius: 2, padding: "2px 6px", letterSpacing: "1px", background: stc.bg, flexShrink: 0 }}>
                    {incident.status}
                  </span>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    {incident.status !== "RESOLVED" && (
                      <button onClick={() => resolveIncident(incident)} style={{ background: "rgba(40,167,69,0.12)", border: "1px solid rgba(40,167,69,0.3)", borderRadius: 2, color: "#28a745", padding: "3px 8px", fontFamily: "'Orbitron',sans-serif", fontSize: "0.55rem", cursor: "pointer" }}>
                        ✓
                      </button>
                    )}
                    <button onClick={() => openEdit(incident)} style={{ background: "rgba(107,142,35,0.08)", border: "1px solid rgba(107,142,35,0.2)", borderRadius: 2, color: "#6b8e23", padding: "3px 8px", fontFamily: "'Orbitron',sans-serif", fontSize: "0.55rem", cursor: "pointer" }}>
                      ✎
                    </button>
                    <button onClick={() => deleteIncident(incident.id)} style={{ background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.2)", borderRadius: 2, color: "#ff3b30", padding: "3px 8px", fontFamily: "'Orbitron',sans-serif", fontSize: "0.55rem", cursor: "pointer" }}>
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowForm(false)}>
          <div style={{ background: "#0d1117", border: "1px solid rgba(107,142,35,0.3)", borderRadius: 6, padding: "2rem", width: 520, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.8rem", color: "#6b8e23", letterSpacing: "2px", marginBottom: "1.5rem" }}>
              {editing ? "EDIT INCIDENT" : "+ NEW INCIDENT"}
            </h3>
            <form onSubmit={save}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "#4d584d", display: "block", marginBottom: 4 }}>TITLE *</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Incident title..." style={S.input} />
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "#4d584d", display: "block", marginBottom: 4 }}>DESCRIPTION</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...S.input, resize: "vertical" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "#4d584d", display: "block", marginBottom: 4 }}>SEVERITY</label>
                    <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} style={S.input}>
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "#4d584d", display: "block", marginBottom: 4 }}>STATUS</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={S.input}>
                      <option value="OPEN">OPEN</option>
                      <option value="INVESTIGATING">INVESTIGATING</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "#4d584d", display: "block", marginBottom: 4 }}>ASSIGNEE</label>
                    <select value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })} style={S.input}>
                      <option value="">Unassigned</option>
                      {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "#4d584d", display: "block", marginBottom: 4 }}>PROJECT</label>
                    <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} style={S.input}>
                      <option value="">None</option>
                      {projects.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
                    </select>
                  </div>
                </div>
                {editing && (
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "#4d584d", display: "block", marginBottom: 4 }}>RESOLUTION NOTES</label>
                    <textarea value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })} rows={2} style={{ ...S.input, resize: "vertical" }} />
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowForm(false)} style={S.btn("#4d584d")}>CANCEL</button>
                <button type="submit" disabled={saving} style={{ ...S.btn(), background: "rgba(107,142,35,0.2)", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "SAVING..." : editing ? "UPDATE" : "CREATE INCIDENT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
