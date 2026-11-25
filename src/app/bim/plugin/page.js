"use client";

import { useCallback, useEffect, useState } from "react";

const MIL = {
  bg: "#0a0e14",
  panel: "rgba(16,20,26,0.82)",
  border: "rgba(107,142,35,0.3)",
  green: "#6b8e23",
  gold: "#c19749",
  text: "#f0f2f5",
  dim: "#8a9bb0",
  font: "'Rajdhani', sans-serif",
  head: "'Orbitron', sans-serif",
};

const fieldStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "0.65rem",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(107,142,35,0.28)",
  borderRadius: 3,
  color: MIL.text,
  fontFamily: MIL.font,
  fontSize: "0.85rem",
};
const labelStyle = {
  display: "block",
  color: MIL.dim,
  fontSize: "0.72rem",
  marginBottom: "0.3rem",
};

export default function BIMPluginPage() {
  const [projects, setProjects] = useState([]);
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [audit, setAudit] = useState(null);
  const [form, setForm] = useState({
    containerId: "",
    projectId: "",
    name: "",
    discipline: "Architecture",
    phase: "P1",
    metadata: "{}",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [projectRes, containerRes] = await Promise.all([
        fetch("/api/projects", { cache: "no-store" }),
        fetch("/api/bim/plugin?action=containers", { cache: "no-store" }),
      ]);
      const [projectData, containerData] = await Promise.all([
        projectRes.json(),
        containerRes.json(),
      ]);
      if (!projectRes.ok) throw new Error(projectData.error || "Unable to load projects");
      if (!containerRes.ok) throw new Error(containerData.error || "Unable to load information containers");
      setProjects(Array.isArray(projectData) ? projectData : []);
      setContainers(Array.isArray(containerData.containers) ? containerData.containers : []);
    } catch (err) {
      setError(err.message || "Unable to load BIM data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const createContainer = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    setAudit(null);
    let metadata;
    try {
      metadata = JSON.parse(form.metadata || "{}");
      if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
        throw new Error("Metadata must be a JSON object");
      }
    } catch (err) {
      setError(err.message || "Metadata JSON is invalid");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/bim/plugin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_container",
          containerId: form.containerId,
          projectId: form.projectId,
          name: form.name,
          discipline: form.discipline,
          phase: form.phase,
          metadata,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Container creation failed");
      setNotice(`Container ${data.container.containerId} was saved successfully.`);
      setForm((current) => ({
        ...current,
        containerId: "",
        name: "",
        metadata: "{}",
      }));
      await fetchData();
    } catch (err) {
      setError(err.message || "Container creation failed");
    } finally {
      setSaving(false);
    }
  };

  const viewAudit = async (containerId) => {
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/bim/plugin?action=audit_trail&containerId=${encodeURIComponent(containerId)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load audit trail");
      setAudit(data);
    } catch (err) {
      setError(err.message || "Unable to load audit trail");
    }
  };

  return (
    <main style={{ padding: "1.5rem", maxWidth: 1050, margin: "0 auto", fontFamily: MIL.font, color: MIL.text }}>
      <header style={{ display: "flex", alignItems: "center", gap: "0.8rem", paddingBottom: "1rem", borderBottom: `1px solid ${MIL.border}`, marginBottom: "1.4rem" }}>
        <span style={{ fontSize: "1.7rem", color: MIL.green }}>⬢</span>
        <div>
          <h1 style={{ fontFamily: MIL.head, fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0 }}>BIM INFORMATION CONTAINERS</h1>
          <p style={{ fontSize: "0.75rem", color: MIL.dim, margin: "0.2rem 0 0" }}>ISO 19650 · Project-linked information management · Persistent audit history</p>
        </div>
      </header>

      {error && <div role="alert" style={{ padding: "0.8rem", marginBottom: "1rem", border: "1px solid #a94442", background: "rgba(169,68,66,0.12)", color: "#ffb4b0" }}>{error}</div>}
      {notice && <div role="status" style={{ padding: "0.8rem", marginBottom: "1rem", border: "1px solid #6b8e23", background: "rgba(107,142,35,0.12)", color: "#c9e59a" }}>{notice}</div>}

      <section style={{ background: MIL.panel, border: `1px solid ${MIL.border}`, borderRadius: 4, padding: "1rem", marginBottom: "1.4rem" }}>
        <h2 style={{ fontFamily: MIL.head, fontSize: "0.72rem", color: MIL.green, margin: "0 0 1rem" }}>CREATE INFORMATION CONTAINER</h2>
        <form onSubmit={createContainer} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.85rem" }}>
          <div>
            <label htmlFor="containerId" style={labelStyle}>Container ID *</label>
            <input id="containerId" style={fieldStyle} value={form.containerId} onChange={(e) => updateField("containerId", e.target.value)} placeholder="e.g. ARC-MDL-001" minLength={3} maxLength={64} required />
          </div>
          <div>
            <label htmlFor="projectId" style={labelStyle}>Project *</label>
            <select id="projectId" style={fieldStyle} value={form.projectId} onChange={(e) => updateField("projectId", e.target.value)} required>
              <option value="">Select a project</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.code ? `${project.code} — ` : ""}{project.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="containerName" style={labelStyle}>Name *</label>
            <input id="containerName" style={fieldStyle} value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Architectural Model" minLength={2} maxLength={160} required />
          </div>
          <div>
            <label htmlFor="discipline" style={labelStyle}>Discipline *</label>
            <input id="discipline" style={fieldStyle} value={form.discipline} onChange={(e) => updateField("discipline", e.target.value)} placeholder="Architecture" minLength={2} maxLength={80} required />
          </div>
          <div>
            <label htmlFor="phase" style={labelStyle}>Phase *</label>
            <input id="phase" style={fieldStyle} value={form.phase} onChange={(e) => updateField("phase", e.target.value)} placeholder="P1" maxLength={40} required />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="metadata" style={labelStyle}>Metadata (JSON object)</label>
            <textarea id="metadata" style={{ ...fieldStyle, minHeight: 90, resize: "vertical" }} value={form.metadata} onChange={(e) => updateField("metadata", e.target.value)} spellCheck={false} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <button type="submit" disabled={saving || loading || projects.length === 0} style={{ padding: "0.7rem 1.1rem", background: saving ? "#46532b" : MIL.green, border: 0, borderRadius: 3, color: "#fff", fontFamily: MIL.head, fontSize: "0.7rem", fontWeight: 700, cursor: saving ? "wait" : "pointer" }}>
              {saving ? "SAVING..." : "CREATE CONTAINER"}
            </button>
            {projects.length === 0 && !loading && <span style={{ marginLeft: "0.8rem", color: MIL.dim, fontSize: "0.75rem" }}>A project is required before creating a container.</span>}
          </div>
        </form>
      </section>

      <section style={{ background: MIL.panel, border: `1px solid ${MIL.border}`, borderRadius: 4, padding: "1rem", marginBottom: "1.4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "0.8rem" }}>
          <h2 style={{ fontFamily: MIL.head, fontSize: "0.72rem", color: MIL.green, margin: 0 }}>SAVED INFORMATION CONTAINERS</h2>
          <button type="button" onClick={fetchData} disabled={loading} style={{ ...fieldStyle, width: "auto", padding: "0.35rem 0.65rem", cursor: "pointer" }}>REFRESH</button>
        </div>
        {loading ? <p style={{ color: MIL.dim }}>Loading project and container records…</p> : containers.length === 0 ? <p style={{ color: MIL.dim }}>No information containers have been created yet.</p> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", minWidth: 650 }}>
              <thead><tr>{["Container ID", "Name", "Project", "Discipline", "Phase", "Stage", "Audit"].map((heading) => <th key={heading} style={{ padding: "0.55rem", textAlign: "left", color: MIL.dim, borderBottom: `1px solid ${MIL.border}` }}>{heading}</th>)}</tr></thead>
              <tbody>{containers.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: "0.6rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{item.containerId}</td>
                  <td style={{ padding: "0.6rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{item.name}</td>
                  <td style={{ padding: "0.6rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{item.project?.name || "—"}</td>
                  <td style={{ padding: "0.6rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{item.discipline}</td>
                  <td style={{ padding: "0.6rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{item.phase}</td>
                  <td style={{ padding: "0.6rem", borderBottom: "1px solid rgba(255,255,255,0.05)", color: MIL.gold }}>{item.stage}</td>
                  <td style={{ padding: "0.6rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}><button type="button" onClick={() => viewAudit(item.containerId)} style={{ ...fieldStyle, width: "auto", padding: "0.3rem 0.5rem", cursor: "pointer" }}>VIEW</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>

      {audit && (
        <section style={{ background: MIL.panel, border: `1px solid ${MIL.border}`, borderRadius: 4, padding: "1rem" }}>
          <h2 style={{ fontFamily: MIL.head, fontSize: "0.72rem", color: MIL.green, margin: "0 0 0.8rem" }}>AUDIT TRAIL — {audit.containerId}</h2>
          {audit.audit.length === 0 ? <p style={{ color: MIL.dim }}>No audit events recorded.</p> : audit.audit.map((entry) => (
            <div key={entry.id} style={{ padding: "0.7rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "0.4rem" }}>
                <strong>{entry.action}</strong><span style={{ color: MIL.dim }}>{new Date(entry.createdAt).toLocaleString()}</span>
              </div>
              <div style={{ color: MIL.dim, fontSize: "0.78rem", marginTop: "0.2rem" }}>{entry.summary || entry.details}</div>
              <div style={{ color: MIL.gold, fontSize: "0.72rem", marginTop: "0.2rem" }}>{entry.actor || "Unknown actor"}</div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
