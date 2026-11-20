"use client";

// ============================================================
// DATUMOS v9 — MILITARY UI COMPONENT LIBRARY
// All components use the tactical design system from globals.css
// ============================================================

import { useState } from "react";

// ── CLASS NAME UTILITY ─────────────────────────────────────
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// ── HUD PANEL ──────────────────────────────────────────────
export function HudPanel({ children, className = "", title, subtitle, action, noPad = false }) {
  return (
    <div
      className={`glass-panel ${className}`}
      style={{ padding: noPad ? 0 : undefined }}
    >
      {(title || action) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: noPad ? 0 : "1.25rem",
            padding: noPad ? "1rem 1.5rem" : 0,
            borderBottom: noPad ? "1px solid rgba(107,142,35,0.15)" : "none",
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "2px" }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

// ── STAT CARD ──────────────────────────────────────────────
export function StatCard({ label, value, trend, trendDir = "neutral", icon, color = "olive", accent }) {
  const colorMap = {
    olive:   { val: "var(--primary-bright)", glow: "rgba(107,142,35,0.15)", border: "rgba(107,142,35,0.3)" },
    gold:    { val: "var(--gold-bright)",    glow: "rgba(193,151,73,0.15)", border: "rgba(193,151,73,0.3)" },
    danger:  { val: "var(--accent-danger)",  glow: "rgba(255,59,48,0.15)",  border: "rgba(255,59,48,0.3)" },
    info:    { val: "var(--accent-info)",    glow: "rgba(76,201,240,0.15)", border: "rgba(76,201,240,0.3)" },
    warning: { val: "var(--accent-warning)", glow: "rgba(255,177,0,0.15)",  border: "rgba(255,177,0,0.3)" },
    success: { val: "var(--accent-success)", glow: "rgba(40,167,69,0.15)",  border: "rgba(40,167,69,0.3)" },
  };
  const c = colorMap[color] || colorMap.olive;

  return (
    <div
      className="glass-panel kpi-card"
      style={{
        background: c.glow,
        borderColor: c.border,
        borderLeft: accent ? `3px solid ${c.val}` : undefined,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div className="kpi-label">{label}</div>
          <div className="kpi-value" style={{ color: c.val }}>{value}</div>
          {trend && (
            <div className={`kpi-trend ${trendDir}`}>{trend}</div>
          )}
        </div>
        {icon && (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 4,
              background: c.glow,
              border: `1px solid ${c.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              color: c.val,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TACTICAL TABLE ─────────────────────────────────────────
export function TacticalTable({ columns, rows, onRowClick, emptyText = "No data found." }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="tactical-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                style={{ cursor: onRowClick ? "pointer" : "default" }}
              >
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── STATUS DOT ─────────────────────────────────────────────
export function StatusDot({ status = "inactive", label, pulse = false }) {
  const statusMap = {
    online:   "online",
    active:   "active",
    warning:  "warning",
    danger:   "danger",
    inactive: "inactive",
    gold:     "gold",
    // aliases
    ACTIVE:   "active",
    COMPLETE: "active",
    PENDING:  "warning",
    CRITICAL: "danger",
    HIGH:     "danger",
    MEDIUM:   "warning",
    LOW:      "inactive",
    ONLINE:   "online",
  };
  const cls = statusMap[status] || "inactive";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <span
        className={`status-dot ${cls} ${pulse ? "animate-pulse-glow" : ""}`}
      />
      {label && (
        <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>{label}</span>
      )}
    </span>
  );
}

// ── BADGE ──────────────────────────────────────────────────
export function Badge({ children, variant = "dim" }) {
  const variantMap = {
    green:   "badge-green",
    gold:    "badge-gold",
    red:     "badge-red",
    blue:    "badge-blue",
    warning: "badge-warning",
    dim:     "badge-dim",
    // aliases
    ACTIVE:   "badge-green",
    COMPLETE: "badge-green",
    PENDING:  "badge-warning",
    CRITICAL: "badge-red",
    HIGH:     "badge-red",
    MEDIUM:   "badge-warning",
    LOW:      "badge-dim",
    DIRECTOR: "badge-gold",
    MEMBER:   "badge-blue",
    CLIENT:   "badge-green",
  };
  const cls = variantMap[variant] || variantMap[children] || "badge-dim";
  return <span className={`badge ${cls}`}>{children}</span>;
}

// ── SECTION HEADER ─────────────────────────────────────────
export function SectionHeader({ icon, title, subtitle, action }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1.5rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {icon && (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 4,
              background: "rgba(107,142,35,0.12)",
              border: "1px solid rgba(107,142,35,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary-glow)",
              fontSize: "0.9rem",
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <h2
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "2px" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ── MODAL ──────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
            }}
          >
            <h3
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-dim)",
                cursor: "pointer",
                fontSize: "1.1rem",
                padding: "4px",
              }}
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ── TABS ───────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tac-tabs">
      {tabs.map((t) => (
        <button
          key={t.id}
          className={`tac-tab ${active === t.id ? "active" : ""}`}
          onClick={() => onChange(t.id)}
        >
          {t.icon && <span style={{ marginRight: 4 }}>{t.icon}</span>}
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── PROGRESS BAR ───────────────────────────────────────────
export function ProgressBar({ value = 0, max = 100, color = "olive" }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colorMap = {
    olive:   "linear-gradient(90deg, var(--primary-dim), var(--primary-bright))",
    gold:    "linear-gradient(90deg, var(--gold-dim), var(--gold-bright))",
    danger:  "linear-gradient(90deg, #c0392b, var(--accent-danger))",
    info:    "linear-gradient(90deg, #0984e3, var(--accent-info))",
    success: "linear-gradient(90deg, #1e8449, var(--accent-success))",
  };
  return (
    <div className="tac-progress">
      <div
        className="tac-progress-fill"
        style={{
          width: `${pct}%`,
          background: colorMap[color] || colorMap.olive,
        }}
      />
    </div>
  );
}

// ── FORM FIELD ─────────────────────────────────────────────
export function FormField({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      {label && (
        <label className="tac-label">
          {label}
          {required && <span style={{ color: "var(--accent-danger)", marginLeft: 2 }}>*</span>}
        </label>
      )}
      {children}
      {hint && (
        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 4 }}>{hint}</p>
      )}
    </div>
  );
}

// ── INPUT ──────────────────────────────────────────────────
export function TacInput({ ...props }) {
  return <input className="tac-input" {...props} />;
}

export function TacSelect({ children, ...props }) {
  return (
    <select className="tac-select" {...props}>
      {children}
    </select>
  );
}

export function TacTextarea({ ...props }) {
  return (
    <textarea
      className="tac-input"
      style={{ resize: "vertical", minHeight: 80 }}
      {...props}
    />
  );
}

// ── LOADING SHIMMER ────────────────────────────────────────
export function LoadingShimmer({ rows = 3 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="loading-shimmer"
          style={{ height: 60, borderRadius: 4, opacity: 1 - i * 0.2 }}
        />
      ))}
    </div>
  );
}

// ── EMPTY STATE ────────────────────────────────────────────
export function EmptyState({ icon = "📭", title = "No data", subtitle, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <p
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "0.8rem",
          color: "var(--text-dim)",
          letterSpacing: "1px",
          textTransform: "uppercase",
          marginBottom: "0.5rem",
        }}
      >
        {title}
      </p>
      {subtitle && (
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          {subtitle}
        </p>
      )}
      {action}
    </div>
  );
}

// ── CONFIRM DIALOG ─────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", danger = false }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={title} width={400}>
      <p style={{ fontSize: "0.9rem", color: "var(--text-dim)", marginBottom: "1.5rem" }}>
        {message}
      </p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button
          className={danger ? "btn-danger" : "btn-primary"}
          onClick={() => { onConfirm(); onClose(); }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ── AVATAR ─────────────────────────────────────────────────
export function Avatar({ name = "?", size = 32 }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const hue = name.charCodeAt(0) * 7 % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        background: `hsl(${hue}, 40%, 25%)`,
        border: `1px solid hsl(${hue}, 40%, 35%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Orbitron', sans-serif",
        fontSize: size * 0.32,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
        letterSpacing: "1px",
      }}
    >
      {initials}
    </div>
  );
}

// ── SYSTEM STATUS INDICATOR ────────────────────────────────
export function SystemStatus({ label = "SYSTEM: ONLINE" }) {
  return (
    <div className="system-status">
      <span className="status-dot online animate-blink" />
      {label}
    </div>
  );
}

// ── DIVIDER ────────────────────────────────────────────────
export function TacDivider({ label }) {
  if (!label) return <div className="tac-divider" />;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        margin: "1.5rem 0",
      }}
    >
      <div className="tac-divider" style={{ flex: 1, margin: 0 }} />
      <span
        style={{
          fontSize: "0.6rem",
          fontFamily: "'Orbitron', sans-serif",
          color: "var(--text-muted)",
          letterSpacing: "2px",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div className="tac-divider" style={{ flex: 1, margin: 0 }} />
    </div>
  );
}

// ── CARD COMPONENTS ──────────────────────────────────────────────────────────
export function Card({ children, className = "", onClick }) {
  return (
    <div
      className={`glass-panel ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : undefined }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div
      className={className}
      style={{
        padding: "1rem 1.5rem",
        borderBottom: "1px solid var(--border-dim)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }) {
  return (
    <div className={className} style={{ padding: "1.25rem 1.5rem" }}>
      {children}
    </div>
  );
}

// ── HEALTH PILL ───────────────────────────────────────────────────────────────
const HEALTH_COLORS = {
  GREEN:  { bg: "rgba(40,167,69,0.15)",  text: "#28a745", border: "rgba(40,167,69,0.3)" },
  AMBER:  { bg: "rgba(255,177,0,0.15)",  text: "#ffb100", border: "rgba(255,177,0,0.3)" },
  RED:    { bg: "rgba(255,59,48,0.15)",  text: "#ff3b30", border: "rgba(255,59,48,0.3)" },
  BLUE:   { bg: "rgba(76,201,240,0.15)", text: "#4cc9f0", border: "rgba(76,201,240,0.3)" },
};

export function HealthPill({ status = "GREEN", label }) {
  const c = HEALTH_COLORS[status] || HEALTH_COLORS.AMBER;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.2rem 0.6rem",
        borderRadius: "4px",
        fontSize: "0.65rem",
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 700,
        letterSpacing: "1px",
        textTransform: "uppercase",
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: c.text,
          display: "inline-block",
        }}
      />
      {label || status}
    </span>
  );
}

// ── PROGRESS BAR (alias) ──────────────────────────────────────────────────────
export function Progress({ value = 0, max = 100, color = "olive", className = "" }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor =
    color === "gold" ? "var(--gold)" :
    color === "danger" ? "var(--accent-danger)" :
    color === "info" ? "var(--accent-info)" :
    "var(--primary-glow)";
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: 6,
        background: "rgba(255,255,255,0.06)",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: barColor,
          borderRadius: 3,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

// ── DIVISION CHIP ─────────────────────────────────────────────────────────────
const DIV_COLORS = {
  ARCH: "#4cc9f0",
  STR:  "#a2d033",
  MEP:  "#ffb100",
  BIM:  "#c19749",
  PM:   "#6b8e23",
};

export function DivisionChip({ code, label }) {
  const color = DIV_COLORS[code] || "var(--text-dim)";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.15rem 0.5rem",
        borderRadius: "3px",
        fontSize: "0.6rem",
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 700,
        letterSpacing: "1px",
        textTransform: "uppercase",
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
      }}
    >
      {label || code}
    </span>
  );
}