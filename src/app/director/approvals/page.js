"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, XCircle, RefreshCw, ShieldCheck } from "lucide-react";

/**
 * DatumOS — Gateway Approvals console (DN013)
 * Director-facing decision surface for gateway approval requests
 * (/ai/approvals + /ai/approvals/{id}/approve|reject through the canonical
 * dcortex client). Read-only for CLIENT via API scoping; this page is loaded
 * inside the director portal.
 */

function badge(status) {
  const cls =
    {
      APPROVAL_PENDING: "bg-amber-900 text-amber-200",
      PENDING: "bg-amber-900 text-amber-200",
      APPROVED: "bg-emerald-900 text-emerald-200",
      REJECTED: "bg-rose-900 text-rose-200",
      CONSUMED: "bg-teal-900 text-teal-200",
      DONE: "bg-emerald-900 text-emerald-200",
      FAILED: "bg-rose-900 text-rose-200",
    }[status] ?? "bg-slate-800 text-slate-300";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {status}
    </span>
  );
}

export default function ApprovalsPage() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/gateway-approvals", { cache: "no-store" });
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

  const decide = async (id, decision) => {
    setBusy(id);
    setError("");
    try {
      const res = await fetch("/api/gateway-approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalId: id, decision }),
        cache: "no-store",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1080 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <ShieldCheck size={22} style={{ color: "#38bdf8" }} />
        <div>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", fontWeight: 700, color: "#fff", letterSpacing: "2px", textTransform: "uppercase", margin: 0 }}>
            Gateway Approvals
          </h1>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>
            DN013 decision chain — DatumOS ⇄ /ai/approvals
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
            Loading approvals…
          </div>
        )}
        {rows !== null && rows.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: "#64748b", fontSize: "0.85rem", border: "1px dashed #334155", borderRadius: 12 }}>
            No gateway approvals pending.
          </div>
        )}
        {rows.map((r) => {
          const id = r.approval_id || r.approvalId || r.task_id || r.id;
          const source = r.source || "agent-task";
          return (
            <div key={String(id)} style={{ padding: "14px 16px", background: "#0b1220", border: "1px solid #1e293b", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {id ? (
                  <code style={{ fontSize: "0.7rem", color: "#7dd3fc", background: "#082f49", padding: "2px 8px", borderRadius: 6 }}>
                    {String(id).slice(0, 24)}
                  </code>
                ) : null}
                {badge(r.status)}
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>{source}</span>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                  agent: {r.assigned_agent_id || "—"}
                </span>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                  job: {r.job_id || "—"}
                </span>
              </div>
              <div style={{ marginTop: 8, fontSize: "0.85rem", color: "#e2e8f0" }}>
                {r.objective || r.description || "No objective text"}
              </div>
              {r.error && (
                <div style={{ marginTop: 6, fontSize: "0.72rem", color: "#fca5a5" }}>↳ {r.error}</div>
              )}
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button
                  onClick={() => decide(id, "approve")}
                  disabled={busy === id}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#064e3b", border: "1px solid #059669", borderRadius: 8, color: "#a7f3d0", fontSize: "0.75rem", cursor: "pointer" }}
                >
                  <BadgeCheck size={13} /> Approve
                </button>
                <button
                  onClick={() => decide(id, "reject")}
                  disabled={busy === id}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#450a0a", border: "1px solid #e11d48", borderRadius: 8, color: "#fecaca", fontSize: "0.75rem", cursor: "pointer" }}
                >
                  <XCircle size={13} /> Reject
                </button>
                {busy === id && (
                  <span style={{ fontSize: "0.7rem", color: "#64748b", alignSelf: "center" }}>sending…</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}