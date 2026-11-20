"use client";

import { useCallback, useEffect, useState } from "react";
import { FolderOpen, FolderTree, RefreshCw, FileJson, ShieldCheck } from "lucide-react";

/**
 * DatumOS — Evidence console (DN017)
 * Read-only browser of the DATUM_NETWORK_INTEGRATION evidence packs served by
 * the gateway /evidence index. Never touches the E: filesystem directly.
 * Includes a Governance tab linking gateway /security/audit events
 * (evidence <-> governance linkage).
 */

const TAB_INDEX = "index";
const TAB_AUDIT = "audit";

function auditBadge(action) {
  const a = String(action || "").toUpperCase();
  const cls = a.includes("LOGIN") || a.includes("AUTH")
    ? "bg-sky-900 text-sky-200"
    : a.includes("CREATE") || a.includes("WRITE")
      ? "bg-amber-900 text-amber-200"
      : a.includes("DELETE") || a.includes("REVOKE")
        ? "bg-rose-900 text-rose-200"
        : a.includes("APPROVE") || a.includes("GRANT")
          ? "bg-emerald-900 text-emerald-200"
          : "bg-slate-800 text-slate-300";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {action || "—"}
    </span>
  );
}

export default function EvidencePage() {
  const [tab, setTab] = useState(TAB_INDEX);
  const [index, setIndex] = useState(null);
  const [pack, setPack] = useState(null);
  const [active, setActive] = useState(null);
  const [audit, setAudit] = useState(null);
  const [error, setError] = useState("");

  const loadIndex = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/gateway-evidence", { cache: "no-store" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      setIndex(await res.json());
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const loadAudit = useCallback(async () => {
    setError("");
    setAudit(null);
    try {
      const res = await fetch("/api/gateway-audit", { cache: "no-store" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setAudit(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
      setAudit([]);
    }
  }, []);

  const openPack = useCallback(async (name) => {
    setError("");
    setActive(name);
    try {
      const res = await fetch(`/api/gateway-evidence?pack=${encodeURIComponent(name)}`, { cache: "no-store" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      setPack(await res.json());
    } catch (e) {
      setError(e.message);
      setPack(null);
    }
  }, []);

  useEffect(() => {
    if (tab === TAB_INDEX) {
      loadIndex();
    } else {
      loadAudit();
    }
  }, [tab, loadIndex, loadAudit]);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1080 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        {tab === TAB_INDEX ? <FolderOpen size={22} style={{ color: "#38bdf8" }} /> : <ShieldCheck size={22} style={{ color: "#38bdf8" }} />}
        <div>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", fontWeight: 700, color: "#fff", letterSpacing: "2px", textTransform: "uppercase", margin: 0 }}>
            Evidence Console
          </h1>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>
            DN017 — {tab === TAB_INDEX ? "DATUM_NETWORK_INTEGRATION packs (read-only via gateway /evidence)" : "Governance linkage — gateway /security/audit events"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "center" }}>
          <button
            onClick={() => setTab(TAB_INDEX)}
            style={{ padding: "6px 12px", background: tab === TAB_INDEX ? "#0f172a" : "transparent", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", fontSize: "0.75rem", cursor: "pointer" }}
          >
            <FolderTree size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> Evidence
          </button>
          <button
            onClick={() => setTab(TAB_AUDIT)}
            style={{ padding: "6px 12px", background: tab === TAB_AUDIT ? "#0f172a" : "transparent", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", fontSize: "0.75rem", cursor: "pointer" }}
          >
            <ShieldCheck size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> Governance Audit
          </button>
          <button
            onClick={tab === TAB_INDEX ? loadIndex : loadAudit}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", fontSize: "0.75rem", cursor: "pointer" }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", background: "#450a0a", border: "1px solid #f87171", borderRadius: 8, color: "#fecaca", fontSize: "0.8rem", marginBottom: 16 }}>
          {error}
        </div>
      )}

      {tab === TAB_INDEX && active && (
        <button
          onClick={() => { setActive(null); setPack(null); }}
          style={{ marginBottom: 14, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", fontSize: "0.75rem", cursor: "pointer" }}
        >
          ← Back to index
        </button>
      )}

      {tab === TAB_AUDIT && (
        <div style={{ display: "grid", gap: 12 }}>
          {audit === null && (
            <div style={{ padding: 32, textAlign: "center", color: "#64748b", fontSize: "0.85rem", border: "1px dashed #334155", borderRadius: 12 }}>
              Loading governance audit events…
            </div>
          )}
          {audit !== null && audit.length === 0 && (
            <div style={{ padding: 32, textAlign: "center", color: "#64748b", fontSize: "0.85rem", border: "1px dashed #334155", borderRadius: 12 }}>
              No audit events returned by gateway /security/audit.
            </div>
          )}
          {(audit ?? []).map((e) => (
            <div key={String(e.event_id || e.id || `${e.created_at}-${e.action}`)} style={{ padding: "12px 16px", background: "#0b1220", border: "1px solid #1e293b", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {auditBadge(e.action)}
                <span style={{ fontSize: "0.7rem", color: "#7dd3fc" }}>
                  {e.actor_id || "system"}
                </span>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                  {e.resource_type}
                  {e.resource_id ? `:${String(e.resource_id).slice(0, 20)}` : ""}
                </span>
                <span style={{ marginLeft: "auto", fontSize: "0.68rem", color: "#64748b" }}>
                  {e.created_at ? String(e.created_at).slice(0, 19).replace("T", " ") : "—"}
                </span>
              </div>
              {e.description && (
                <div style={{ marginTop: 6, fontSize: "0.8rem", color: "#e2e8f0" }}>{e.description}</div>
              )}
              {e.metadata && Object.keys(e.metadata).length > 0 && (
                <div style={{ marginTop: 4, fontSize: "0.68rem", color: "#64748b", wordBreak: "break-all" }}>
                  {JSON.stringify(e.metadata).slice(0, 200)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === TAB_INDEX && active && pack && (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontSize: "0.85rem", color: "#e2e8f0", marginBottom: 6 }}>
            <FolderTree size={14} style={{ display: "inline", marginRight: 6, verticalAlign: -2 }} />
            {pack.name} — {pack.files.length} files
          </div>
          {pack.files.map((f) => (
            <div key={f.rel} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 12px", background: "#0b1220", border: "1px solid #1e293b", borderRadius: 8 }}>
              <FileJson size={13} style={{ color: "#7dd3fc", flexShrink: 0 }} />
              <code style={{ fontSize: "0.72rem", color: "#e2e8f0", wordBreak: "break-all" }}>{f.rel}</code>
              <span style={{ marginLeft: "auto", fontSize: "0.68rem", color: "#64748b", flexShrink: 0 }}>
                {f.size != null ? `${(f.size / 1024).toFixed(1)} KB` : "—"}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === TAB_INDEX && !active && (
        <div style={{ display: "grid", gap: 12 }}>
          {index === null && (
            <div style={{ padding: 32, textAlign: "center", color: "#64748b", fontSize: "0.85rem", border: "1px dashed #334155", borderRadius: 12 }}>
              Loading evidence index…
            </div>
          )}
          {index !== null && (
            <>
              <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>
                Packs ({index.packs?.length ?? 0})
              </div>
              {(index.packs ?? []).map((p) => (
                <button
                  key={p.name}
                  onClick={() => openPack(p.name)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#0b1220", border: "1px solid #1e293b", borderRadius: 12, cursor: "pointer", textAlign: "left", color: "#e2e8f0" }}
                >
                  <FolderTree size={16} style={{ color: "#7dd3fc", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{p.name}</span>
                  <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#64748b" }}>
                    {p.files} files
                  </span>
                </button>
              ))}
              <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginTop: 8 }}>
                Top-level JSON ({index.files?.length ?? 0})
              </div>
              {(index.files ?? []).map((f) => (
                <div key={f.name} style={{ display: "flex", gap: 10, padding: "8px 12px", background: "#0b1220", border: "1px solid #1e293b", borderRadius: 8 }}>
                  <FileJson size={13} style={{ color: "#7dd3fc", flexShrink: 0 }} />
                  <code style={{ fontSize: "0.75rem", color: "#e2e8f0" }}>{f.name}</code>
                  <span style={{ marginLeft: "auto", fontSize: "0.68rem", color: "#64748b" }}>
                    {f.size != null ? `${(f.size / 1024).toFixed(1)} KB` : "—"}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}