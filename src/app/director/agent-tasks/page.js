"use client";

import { useCallback, useEffect, useState } from "react";
import { Bot, RefreshCw, ListChecks } from "lucide-react";

/**
 * DatumOS — Gateway Agent-Task execution panel (DN013)
 * Surfaces CortexOrchestrator-dispatched tasks from the canonical gateway
 * (/ai/tasks through the dcortex client) inside the director portal.
 * Read-only execution view: job id, status, objective, agent roster,
 * timestamps, error. Decisions flow through /director/approvals
 * (/api/gateway-approvals POST).
 */

function badge(status) {
  const cls =
    {
      RUNNING: "bg-sky-900 text-sky-200",
      QUEUED: "bg-amber-900 text-amber-200",
      COMPLETED: "bg-emerald-900 text-emerald-200",
      DONE: "bg-emerald-900 text-emerald-200",
      APPROVAL_PENDING: "bg-amber-900 text-amber-200",
      FAILED: "bg-rose-900 text-rose-200",
    }[status] ?? "bg-slate-800 text-slate-300";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {status}
    </span>
  );
}

export default function AgentTasksPage() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/gateway-tasks", { cache: "no-store" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
      setRows([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1080 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <Bot size={22} style={{ color: "#38bdf8" }} />
        <div>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", fontWeight: 700, color: "#fff", letterSpacing: "2px", textTransform: "uppercase", margin: 0 }}>
            Agent Task Execution
          </h1>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>
            DN013 — CortexOrchestrator-dispatched jobs ⇄ /ai/tasks
          </p>
        </div>
        <button
          onClick={load}
          style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", fontSize: "0.75rem", cursor: "pointer" }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", background: "#450a0a", border: "1px solid #f87171", borderRadius: 8, color: "#fecaca", fontSize: "0.8rem", marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {rows === null && (
          <div style={{ padding: 32, textAlign: "center", color: "#64748b", fontSize: "0.85rem", border: "1px dashed #334155", borderRadius: 12 }}>
            Loading agent tasks…
          </div>
        )}
        {rows !== null && rows.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: "#64748b", fontSize: "0.85rem", border: "1px dashed #334155", borderRadius: 12 }}>
            <ListChecks size={18} style={{ verticalAlign: -3, marginRight: 6 }} />
            No agent-dispatched tasks yet. Dispatch one via the gateway POST /ai/tasks.
          </div>
        )}
        {(rows || []).map((r) => {
          const agents = Array.isArray(r.agents) ? r.agents : [];
          return (
            <div key={String(r.job_id || r.id)} style={{ padding: "14px 16px", background: "#0b1220", border: "1px solid #1e293b", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {r.job_id ? (
                  <code style={{ fontSize: "0.7rem", color: "#7dd3fc", background: "#082f49", padding: "2px 8px", borderRadius: 6 }}>
                    {String(r.job_id).slice(0, 24)}
                  </code>
                ) : null}
                {badge(r.status)}
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                  agents: {agents.length > 0 ? agents.join(", ") : "—"}
                </span>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                  started: {r.started_at ? String(r.started_at).slice(0, 19) : "—"}
                </span>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                  finished: {r.finished_at ? String(r.finished_at).slice(0, 19) : "—"}
                </span>
              </div>
              <div style={{ marginTop: 8, fontSize: "0.85rem", color: "#e2e8f0" }}>
                {r.objective || r.description || "No objective text"}
              </div>
              {r.error && (
                <div style={{ marginTop: 6, fontSize: "0.72rem", color: "#fca5a5" }}>↳ {r.error}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}