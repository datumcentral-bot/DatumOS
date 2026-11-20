"use client";
// ============================================================================
// DatumOS v12 — shared military-theme UI primitives (inline-style, no deps)
// Adds: Toast system, ConfirmDialog, useToast hook, enhanced Table with actions
// ============================================================================
import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";

export const C = {
  bg: "#0a0e14",
  panel: "rgba(255,255,255,0.02)",
  panelBorder: "rgba(107,142,35,0.15)",
  olive: "#6b8e23",
  oliveBright: "#a2d033",
  gold: "#c19749",
  info: "#4cc9f0",
  danger: "#ff3b30",
  warn: "#ffb100",
  ok: "#28a745",
  text: "#f0f2f5",
  dim: "#94a3b8",
  faint: "#4d584d",
  orbit: "'Orbitron', sans-serif",
  rajd: "'Rajdhani', sans-serif",
};

// ─── Toast System ────────────────────────────────────────────────────────────
const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  const colors = { success: C.ok, error: C.danger, warn: C.warn, info: C.info };
  const icons = { success: "✓", error: "✕", warn: "⚠", info: "ℹ" };
  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 9999, display: "flex", flexDirection: "column", gap: "0.5rem", pointerEvents: "none" }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ background: "#0d1117", border: `1px solid ${colors[t.type]}66`, borderLeft: `3px solid ${colors[t.type]}`, borderRadius: 4, padding: "0.65rem 1rem", display: "flex", alignItems: "center", gap: "0.6rem", boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 12px ${colors[t.type]}22`, minWidth: 260, maxWidth: 380, animation: "slideIn 0.2s ease" }}>
            <span style={{ color: colors[t.type], fontFamily: C.orbit, fontSize: "0.75rem", fontWeight: 700 }}>{icons[t.type]}</span>
            <span style={{ fontFamily: C.rajd, fontSize: "0.9rem", color: C.text, flex: 1 }}>{t.msg}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    // fallback if not wrapped in provider
    return (msg, type) => console.log(`[${type}] ${msg}`);
  }
  return ctx;
}

// ─── ConfirmDialog ────────────────────────────────────────────────────────────
export function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = true }) {
  if (!open) return null;
  return (
    <div onClick={onCancel} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 400, background: "#0d1117", border: `1px solid ${danger ? C.danger : C.olive}55`, borderRadius: 6, boxShadow: `0 0 40px ${danger ? C.danger : C.olive}22`, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${danger ? C.danger : C.olive}, transparent)` }} />
        <div style={{ padding: "1.25rem" }}>
          <h3 style={{ fontFamily: C.orbit, fontSize: "0.8rem", color: "#fff", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "0.5rem" }}>{title || "Confirm Action"}</h3>
          <p style={{ fontFamily: C.rajd, fontSize: "0.9rem", color: C.dim, marginBottom: "1.25rem" }}>{message || "Are you sure? This action cannot be undone."}</p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <Btn onClick={onCancel} variant="ghost">Cancel</Btn>
            <Btn onClick={onConfirm} variant={danger ? "danger" : "primary"}>Confirm</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ icon, title, subtitle, accent = C.olive, search, setSearch, onNew, newLabel = "+ NEW", right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1rem", borderBottom: `1px solid ${C.panelBorder}`, flexWrap: "wrap", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: 40, height: 40, borderRadius: 4, background: `${accent}1f`, border: `1px solid ${accent}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", color: accent, boxShadow: `0 0 12px ${accent}22` }}>{icon}</div>
        <div>
          <h1 style={{ fontFamily: C.orbit, fontSize: "0.95rem", fontWeight: 700, color: "#fff", letterSpacing: "2px", textTransform: "uppercase" }}>{title}</h1>
          <p style={{ fontSize: "0.75rem", color: C.dim, marginTop: 2, fontFamily: C.rajd }}>{subtitle}</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        {right}
        {setSearch && (
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="SEARCH..." style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.olive}33`, borderRadius: 2, color: C.text, padding: "0.45rem 0.75rem", fontFamily: C.rajd, fontSize: "0.85rem", outline: "none", width: 200 }} />
        )}
        {onNew && (
          <button onClick={onNew} style={{ background: `${accent}1f`, border: `1px solid ${accent}55`, borderRadius: 2, color: "#fff", padding: "0.45rem 1rem", fontFamily: C.orbit, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "1.5px", cursor: "pointer", textTransform: "uppercase" }}>{newLabel}</button>
        )}
      </div>
    </div>
  );
}

// ─── KpiRow ───────────────────────────────────────────────────────────────────
export function KpiRow({ items, cols = 4 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "1rem" }}>
      {items.map((s) => (
        <div key={s.label} style={{ background: C.panel, border: `1px solid ${C.olive}1f`, borderRadius: 4, padding: "1rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 10, height: 10, borderTop: `1px solid ${s.color || C.olive}`, borderLeft: `1px solid ${s.color || C.olive}`, opacity: 0.5 }} />
          <p style={{ fontFamily: C.orbit, fontSize: "0.55rem", color: C.dim, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</p>
          <p style={{ fontFamily: C.orbit, fontSize: "1.8rem", fontWeight: 800, color: s.color || C.oliveBright, lineHeight: 1 }}>{s.value}</p>
          {s.sub && <p style={{ fontFamily: C.rajd, fontSize: "0.7rem", color: C.dim, marginTop: 4 }}>{s.sub}</p>}
        </div>
      ))}
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────
export function Panel({ title, children, accent = C.olive, action, style = {} }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.olive}1f`, borderRadius: 4, position: "relative", ...style }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}, transparent)`, opacity: 0.6 }} />
      {title && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1rem", borderBottom: `1px solid ${C.olive}14` }}>
          <span style={{ fontFamily: C.orbit, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "1.5px", color: "#fff", textTransform: "uppercase" }}>{title}</span>
          {action}
        </div>
      )}
      <div style={{ padding: "1rem" }}>{children}</div>
    </div>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
export function Chip({ label, color = C.olive }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 2, fontFamily: C.orbit, fontSize: "0.55rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color, background: `${color}18`, border: `1px solid ${color}44` }}>{label}</span>
  );
}

// ─── statusColor ──────────────────────────────────────────────────────────────
export function statusColor(s) {
  const m = {
    GREEN: C.ok, AMBER: C.warn, RED: C.danger,
    ACTIVE: C.ok, ON_HOLD: C.warn, COMPLETE: C.info, CLOSED: C.dim,
    OPEN: C.warn, RESPONDED: C.info, PENDING: C.warn,
    WIP: C.warn, SHARED: C.info, PUBLISHED: C.ok, ARCHIVED: C.dim,
    APPROVED: C.ok, DRAFT: C.dim, IN_REVIEW: C.info,
    HIGH: C.danger, CRITICAL: C.danger, MEDIUM: C.warn, LOW: C.dim,
    TIER1: C.gold, TIER2: C.info, TIER3: C.olive, TIER4: C.dim,
    PLANNED: C.dim, IN_PROGRESS: C.warn, IN_DELIVERY: C.info,
    CAPTURED: C.dim, AGREED: C.info, SENT: C.info, PAID: C.ok, OVERDUE: C.danger,
    TODO: C.dim, DONE: C.ok, BLOCKED: C.danger,
    WON: C.ok, LOST: C.danger, PROPOSAL: C.warn, NEGOTIATION: C.gold,
    CONTACTED: C.info, TO_CONTACT: C.dim,
    MOBILIZATION: C.warn, DESIGN: C.info, COORDINATION: C.olive, DELIVERY: C.ok,
  };
  return m[s] || C.olive;
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({ columns, rows, empty = "No records.", onEdit, onDelete }) {
  const cols = [...columns];
  if (onEdit || onDelete) {
    cols.push({
      key: "_actions", label: "Actions", align: "right",
      render: (r) => (
        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
          {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(r); }} style={{ background: `${C.olive}18`, border: `1px solid ${C.olive}44`, borderRadius: 2, color: C.oliveBright, padding: "3px 10px", fontFamily: C.orbit, fontSize: "0.5rem", cursor: "pointer", letterSpacing: "1px" }}>EDIT</button>}
          {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(r); }} style={{ background: `${C.danger}12`, border: `1px solid ${C.danger}44`, borderRadius: 2, color: C.danger, padding: "3px 10px", fontFamily: C.orbit, fontSize: "0.5rem", cursor: "pointer", letterSpacing: "1px" }}>DEL</button>}
        </div>
      ),
    });
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: C.rajd }}>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c.key} style={{ textAlign: c.align || "left", padding: "0.6rem 0.75rem", fontFamily: C.orbit, fontSize: "0.55rem", color: C.dim, letterSpacing: "1.5px", textTransform: "uppercase", borderBottom: `1px solid ${C.olive}22`, whiteSpace: "nowrap" }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={cols.length} style={{ padding: "1.5rem", textAlign: "center", color: C.dim, fontSize: "0.85rem" }}>{empty}</td></tr>
          )}
          {rows.map((r, i) => (
            <tr key={r.id || i} style={{ borderBottom: `1px solid ${C.olive}10` }}>
              {cols.map((c) => (
                <td key={c.key} style={{ padding: "0.55rem 0.75rem", fontSize: "0.85rem", color: C.text, textAlign: c.align || "left", verticalAlign: "middle" }}>{c.render ? c.render(r) : r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 560 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5vh 1rem", overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width, maxWidth: "100%", background: "#0d1117", border: `1px solid ${C.olive}44`, borderRadius: 6, position: "relative", boxShadow: `0 0 40px ${C.olive}22` }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.olive}, ${C.gold}, transparent)` }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderBottom: `1px solid ${C.olive}22` }}>
          <span style={{ fontFamily: C.orbit, fontSize: "0.8rem", fontWeight: 700, letterSpacing: "1.5px", color: "#fff", textTransform: "uppercase" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.dim, fontSize: "1.3rem", cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: "1.25rem" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Form primitives ──────────────────────────────────────────────────────────
export function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom: "0.9rem" }}>
      <label style={{ display: "block", fontFamily: C.orbit, fontSize: "0.55rem", color: C.dim, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 5 }}>{label}{required && <span style={{ color: C.danger }}> *</span>}</label>
      {children}
    </div>
  );
}

const inputStyle = { width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.olive}33`, borderRadius: 2, color: C.text, padding: "0.55rem 0.7rem", fontFamily: C.rajd, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" };
export function Input(props) { return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />; }
export function Select({ children, ...props }) { return <select {...props} style={{ ...inputStyle, ...(props.style || {}) }}>{children}</select>; }
export function Textarea(props) { return <textarea {...props} style={{ ...inputStyle, minHeight: 80, resize: "vertical", ...(props.style || {}) }} />; }

// ─── Btn ──────────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = "primary", type = "button", style = {}, disabled = false }) {
  const v = {
    primary: { bg: `${C.olive}22`, bd: `${C.olive}66`, col: "#fff" },
    gold: { bg: `${C.gold}22`, bd: `${C.gold}66`, col: "#fff" },
    danger: { bg: `${C.danger}18`, bd: `${C.danger}55`, col: "#fff" },
    ghost: { bg: "rgba(255,255,255,0.03)", bd: "rgba(255,255,255,0.12)", col: C.dim },
    info: { bg: `${C.info}18`, bd: `${C.info}55`, col: "#fff" },
  }[variant] || { bg: `${C.olive}22`, bd: `${C.olive}66`, col: "#fff" };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ background: v.bg, border: `1px solid ${v.bd}`, borderRadius: 2, color: disabled ? C.faint : v.col, padding: "0.5rem 1rem", fontFamily: C.orbit, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "1.5px", cursor: disabled ? "not-allowed" : "pointer", textTransform: "uppercase", opacity: disabled ? 0.5 : 1, ...style }}>{children}</button>
  );
}

// ─── FormRow (2-col grid) ─────────────────────────────────────────────────────
export function FormRow({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>{children}</div>;
}

// ─── FormActions ──────────────────────────────────────────────────────────────
export function FormActions({ onCancel, saving, submitLabel = "SAVE" }) {
  return (
    <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1rem", paddingTop: "1rem", borderTop: `1px solid ${C.olive}22` }}>
      <Btn onClick={onCancel} variant="ghost">Cancel</Btn>
      <Btn type="submit" disabled={saving}>{saving ? "SAVING..." : submitLabel}</Btn>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, setActive }) {
  return (
    <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${C.olive}22`, marginBottom: "1rem" }}>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => setActive(t.id)} style={{ background: active === t.id ? `${C.olive}18` : "transparent", border: "none", borderBottom: active === t.id ? `2px solid ${C.olive}` : "2px solid transparent", color: active === t.id ? "#fff" : C.dim, padding: "0.5rem 1rem", fontFamily: C.orbit, fontSize: "0.6rem", letterSpacing: "1.5px", cursor: "pointer", textTransform: "uppercase", marginBottom: -1 }}>{t.label}</button>
      ))}
    </div>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, color = C.olive, height = 6 }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 3, height, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.3s ease" }} />
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = "📭", title = "No records", subtitle = "Click + NEW to add one" }) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1rem", color: C.dim }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{icon}</div>
      <p style={{ fontFamily: C.orbit, fontSize: "0.75rem", letterSpacing: "1.5px", color: "#fff", marginBottom: "0.4rem" }}>{title}</p>
      <p style={{ fontFamily: C.rajd, fontSize: "0.85rem" }}>{subtitle}</p>
    </div>
  );
}

// ─── CommentThread ────────────────────────────────────────────────────────────
export function CommentThread({ entityType, entityId, author = "Director" }) {
  const [rows, setRows] = useState([]);
  const [body, setBody] = useState("");
  const load = () => {
    if (!entityId) return;
    fetch(`/api/comments?entityType=${entityType}&entityId=${entityId}`).then((r) => r.json()).then((d) => setRows(Array.isArray(d) ? d : []));
  };
  useEffect(load, [entityType, entityId]);
  const post = async () => {
    if (!body.trim()) return;
    await fetch("/api/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entityType, entityId, author, body }) });
    setBody(""); load();
  };
  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add comment / activity note..." onKeyDown={(e) => e.key === "Enter" && post()} />
        <Btn onClick={post}>Post</Btn>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 240, overflowY: "auto" }}>
        {rows.length === 0 && <p style={{ color: C.dim, fontSize: "0.8rem", fontFamily: C.rajd }}>No comments yet.</p>}
        {rows.map((c) => (
          <div key={c.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.olive}14`, borderRadius: 3, padding: "0.5rem 0.7rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span style={{ fontFamily: C.orbit, fontSize: "0.55rem", color: c.authorSide === "CLIENT" ? C.info : C.oliveBright, letterSpacing: "1px" }}>{c.author}</span>
              <span style={{ fontFamily: C.rajd, fontSize: "0.65rem", color: C.faint }}>{new Date(c.createdAt).toLocaleString()}</span>
            </div>
            <p style={{ fontFamily: C.rajd, fontSize: "0.85rem", color: C.text }}>{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem" }}>
      <div style={{ width: 32, height: 32, border: `2px solid ${C.olive}33`, borderTop: `2px solid ${C.olive}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ count, color = C.danger }) {
  if (!count) return null;
  return <span style={{ background: color, color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: C.orbit, fontSize: "0.5rem", fontWeight: 700 }}>{count > 99 ? "99+" : count}</span>;
}
