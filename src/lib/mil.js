'use client'
// ============================================================================
// DatumOS v13 — Military UI Component Library (mil.js)
// Full CRUD: Modal, Form, Toast, Confirm, Table, Tabs, Badge, Spinner, Timer
// ============================================================================
import { useState, useEffect, useCallback, useRef } from 'react'

// ─── TOAST SYSTEM ────────────────────────────────────────────────────────────
let _toastFn = null
export function setToastFn(fn) { _toastFn = fn }

export function toast(msg, type = 'success') {
  if (_toastFn) _toastFn(msg, type)
  else console.log(`[${type.toUpperCase()}] ${msg}`)
}

export function ToastProvider() {
  const [toasts, setToasts] = useState([])
  useEffect(() => {
    setToastFn((msg, type) => {
      const id = Date.now()
      setToasts(t => [...t, { id, msg, type }])
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
    })
  }, [])
  const colors = { success: '#4a7c59', error: '#8b1a1a', warning: '#8b6914', info: '#234b84' }
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: colors[t.type] || colors.info, color: '#e8d5a3', padding: '10px 16px', borderRadius: 4, fontFamily: 'Rajdhani, sans-serif', fontSize: 14, fontWeight: 600, border: '1px solid rgba(232,213,163,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', minWidth: 280, maxWidth: 400, animation: 'slideIn 0.2s ease' }}>
          {t.type === 'success' ? '✓ ' : t.type === 'error' ? '✗ ' : '⚠ '}{t.msg}
        </div>
      ))}
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  )
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
export function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = true }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1a1f14', border: '1px solid #4a7c59', borderRadius: 6, padding: 28, maxWidth: 420, width: '90%' }}>
        <div style={{ fontFamily: 'Orbitron, sans-serif', color: danger ? '#c0392b' : '#e8d5a3', fontSize: 16, marginBottom: 12 }}>{title || 'CONFIRM ACTION'}</div>
        <div style={{ fontFamily: 'Rajdhani, sans-serif', color: '#a0a090', fontSize: 14, marginBottom: 24 }}>{message || 'Are you sure you want to proceed?'}</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #4a7c59', color: '#a0a090', borderRadius: 4, cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>CANCEL</button>
          <button onClick={onConfirm} style={{ padding: '8px 20px', background: danger ? '#8b1a1a' : '#4a7c59', border: 'none', color: '#e8d5a3', borderRadius: 4, cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>{danger ? 'DELETE' : 'CONFIRM'}</button>
        </div>
      </div>
    </div>
  )
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
export function MilModal({ open, onClose, title, children, width = 640 }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 7000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#1a1f14', border: '1px solid #4a7c59', borderRadius: 6, width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #2a3020' }}>
          <div style={{ fontFamily: 'Orbitron, sans-serif', color: '#c8a84b', fontSize: 14, letterSpacing: 2 }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6a7a60', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  )
}

// ─── FORM FIELD ───────────────────────────────────────────────────────────────
export function FormField({ label, required, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontFamily: 'Rajdhani, sans-serif', color: '#8a9a80', fontSize: 12, fontWeight: 600, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>
        {label}{required && <span style={{ color: '#c0392b', marginLeft: 4 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inputStyle = { width: '100%', background: '#0d1108', border: '1px solid #2a3020', borderRadius: 4, padding: '8px 12px', color: '#e8d5a3', fontFamily: 'Rajdhani, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' }

export function MilInput({ value, onChange, placeholder, type = 'text', required, disabled }) {
  return <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} disabled={disabled} style={{ ...inputStyle, opacity: disabled ? 0.5 : 1 }} />
}

export function MilTextarea({ value, onChange, placeholder, rows = 3 }) {
  return <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...inputStyle, resize: 'vertical' }} />
}

export function MilSelect({ value, onChange, options, placeholder, required }) {
  return (
    <select value={value || ''} onChange={e => onChange(e.target.value)} required={required} style={{ ...inputStyle, cursor: 'pointer' }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export function FormRow({ children, cols = 2 }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>{children}</div>
}

export function FormActions({ onCancel, loading, submitLabel = 'SAVE' }) {
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid #2a3020' }}>
      <button type="button" onClick={onCancel} style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #4a7c59', color: '#a0a090', borderRadius: 4, cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>CANCEL</button>
      <button type="submit" disabled={loading} style={{ padding: '8px 24px', background: '#4a7c59', border: 'none', color: '#e8d5a3', borderRadius: 4, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
        {loading ? 'SAVING...' : submitLabel}
      </button>
    </div>
  )
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
const badgeColors = {
  ACTIVE: '#4a7c59', DONE: '#4a7c59', COMPLETE: '#4a7c59', APPROVED: '#4a7c59', PAID: '#4a7c59', RESOLVED: '#4a7c59', CLOSED: '#4a7c59', WON: '#4a7c59',
  IN_PROGRESS: '#8b6914', IN_REVIEW: '#8b6914', SHARED: '#8b6914', SENT: '#8b6914', STARTED: '#8b6914',
  TODO: '#234b84', PENDING: '#234b84', DRAFT: '#234b84', PLANNED: '#234b84', SCHEDULED: '#234b84', WIP: '#234b84',
  OPEN: '#5a3e2b', HIGH: '#8b4513', CRITICAL: '#8b1a1a', REJECTED: '#8b1a1a', OVERDUE: '#8b1a1a',
  PUBLISHED: '#2b4a5a', ARCHIVED: '#3a3a3a', MEDIUM: '#5a5a2a', LOW: '#3a5a3a',
  NEGOTIATION: '#6b4c9a', QUALIFIED: '#4a6b9a', PROPOSAL: '#9a6b4a', CONTACTED: '#4a7c59', TO_CONTACT: '#5a5a5a'
}

export function MilBadge({ status, label }) {
  const text = label || status || ''
  const bg = badgeColors[status] || '#3a3a3a'
  return <span style={{ background: bg, color: '#e8d5a3', padding: '2px 8px', borderRadius: 3, fontSize: 11, fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap' }}>{text.replace(/_/g, ' ')}</span>
}

// ─── SPINNER ──────────────────────────────────────────────────────────────────
export function MilSpinner({ size = 24 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: size, height: size, border: `2px solid #2a3020`, borderTop: `2px solid #4a7c59`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
export function MilTabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #2a3020', marginBottom: 20 }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: active === tab.id ? '2px solid #c8a84b' : '2px solid transparent', color: active === tab.id ? '#c8a84b' : '#6a7a60', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', transition: 'all 0.2s' }}>
          {tab.label}{tab.count !== undefined && <span style={{ marginLeft: 6, background: '#2a3020', padding: '1px 6px', borderRadius: 10, fontSize: 11 }}>{tab.count}</span>}
        </button>
      ))}
    </div>
  )
}

// ─── TABLE ────────────────────────────────────────────────────────────────────
export function MilTable({ columns, data, onEdit, onDelete, loading, emptyMsg = 'No records found' }) {
  const [deleteId, setDeleteId] = useState(null)
  const allCols = [...columns]
  if (onEdit || onDelete) allCols.push({ key: '_actions', label: 'ACTIONS', render: (_, row) => (
    <div style={{ display: 'flex', gap: 8 }}>
      {onEdit && <button onClick={() => onEdit(row)} style={{ padding: '3px 10px', background: '#234b84', border: 'none', color: '#e8d5a3', borderRadius: 3, cursor: 'pointer', fontSize: 11, fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>EDIT</button>}
      {onDelete && <button onClick={() => setDeleteId(row.id)} style={{ padding: '3px 10px', background: '#8b1a1a', border: 'none', color: '#e8d5a3', borderRadius: 3, cursor: 'pointer', fontSize: 11, fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>DEL</button>}
    </div>
  )})
  return (
    <>
      <ConfirmDialog open={!!deleteId} title="DELETE RECORD" message="This action cannot be undone. Confirm deletion?" onConfirm={() => { onDelete(deleteId); setDeleteId(null) }} onCancel={() => setDeleteId(null)} />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Rajdhani, sans-serif' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2a3020' }}>
              {allCols.map(c => <th key={c.key} style={{ padding: '10px 12px', textAlign: 'left', color: '#6a7a60', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={allCols.length}><MilSpinner /></td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={allCols.length} style={{ padding: 32, textAlign: 'center', color: '#4a5a40', fontStyle: 'italic' }}>{emptyMsg}</td></tr>
            ) : data.map((row, i) => (
              <tr key={row.id || i} style={{ borderBottom: '1px solid #1a1f14', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#1e2418'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {allCols.map(c => <td key={c.key} style={{ padding: '10px 12px', color: '#c8c8b0', fontSize: 13, verticalAlign: 'middle' }}>{c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📋', title, message, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#4a5a40' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 14, color: '#6a7a60', marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, marginBottom: 20 }}>{message}</div>
      {action}
    </div>
  )
}

// ─── HOOKS ────────────────────────────────────────────────────────────────────
export function useCrud(url, opts = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async (params = '') => {
    setLoading(true)
    try {
      const res = await fetch(`${url}${params}`)
      if (!res.ok) throw new Error(await res.text())
      setData(await res.json())
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [url])

  useEffect(() => { load(opts.params || '') }, [load, opts.params])

  const create = async (body) => {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) throw new Error(await res.text())
    const item = await res.json()
    setData(d => [item, ...d])
    toast('Record created successfully')
    return item
  }

  const update = async (id, body) => {
    const res = await fetch(`${url}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) throw new Error(await res.text())
    const item = await res.json()
    setData(d => d.map(x => x.id === id ? item : x))
    toast('Record updated successfully')
    return item
  }

  const remove = async (id) => {
    const res = await fetch(`${url}/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(await res.text())
    setData(d => d.filter(x => x.id !== id))
    toast('Record deleted', 'warning')
  }

  return { data, loading, error, load, create, update, remove, setData }
}

export function useTimer() {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const intervalRef = useRef(null)

  const start = () => {
    const t = Date.now()
    setStartTime(t)
    setRunning(true)
    intervalRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - t) / 1000)), 1000)
  }

  const stop = () => {
    clearInterval(intervalRef.current)
    setRunning(false)
    return { startedAt: new Date(startTime), stoppedAt: new Date(), durationMin: Math.floor(elapsed / 60) }
  }

  const reset = () => { clearInterval(intervalRef.current); setRunning(false); setElapsed(0); setStartTime(null) }

  const fmt = (s) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return { running, elapsed, display: fmt(elapsed), start, stop, reset }
}

// ─── SEARCH BAR ───────────────────────────────────────────────────────────────
export function MilSearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4a5a40', fontSize: 14 }}>⌕</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...inputStyle, paddingLeft: 32 }} />
    </div>
  )
}

// ─── PAGE HEADER ──────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h1 style={{ fontFamily: 'Orbitron, sans-serif', color: '#c8a84b', fontSize: 20, margin: 0, letterSpacing: 2 }}>{title}</h1>
        {subtitle && <div style={{ fontFamily: 'Rajdhani, sans-serif', color: '#6a7a60', fontSize: 13, marginTop: 4 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  )
}

export function MilBtn({ onClick, children, variant = 'primary', size = 'md', disabled }) {
  const styles = {
    primary: { background: '#4a7c59', color: '#e8d5a3', border: 'none' },
    secondary: { background: 'transparent', color: '#a0a090', border: '1px solid #4a7c59' },
    danger: { background: '#8b1a1a', color: '#e8d5a3', border: 'none' },
    info: { background: '#234b84', color: '#e8d5a3', border: 'none' }
  }
  const sizes = { sm: '6px 14px', md: '8px 20px', lg: '10px 28px' }
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: sizes[size], borderRadius: 4, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: 1, opacity: disabled ? 0.6 : 1, transition: 'opacity 0.2s', ...styles[variant] }}>
      {children}
    </button>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color = '#4a7c59' }) {
  return (
    <div style={{ background: '#1a1f14', border: `1px solid ${color}33`, borderRadius: 6, padding: '16px 20px', borderLeft: `3px solid ${color}` }}>
      <div style={{ fontFamily: 'Rajdhani, sans-serif', color: '#6a7a60', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'Orbitron, sans-serif', color, fontSize: 24, fontWeight: 700 }}>{value}</div>
      {sub && <div style={{ fontFamily: 'Rajdhani, sans-serif', color: '#4a5a40', fontSize: 12, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = '#4a7c59', label }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div>
      {label && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontFamily: 'Rajdhani, sans-serif', color: '#8a9a80', fontSize: 12 }}>{label}</span>
        <span style={{ fontFamily: 'Orbitron, sans-serif', color, fontSize: 12 }}>{pct}%</span>
      </div>}
      <div style={{ background: '#0d1108', borderRadius: 2, height: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}

// ─── VIEW SWITCHER ────────────────────────────────────────────────────────────
export function ViewSwitcher({ views, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: '#0d1108', padding: 4, borderRadius: 4, border: '1px solid #2a3020' }}>
      {views.map(v => (
        <button key={v.id} onClick={() => onChange(v.id)} style={{ padding: '5px 12px', background: active === v.id ? '#4a7c59' : 'transparent', border: 'none', color: active === v.id ? '#e8d5a3' : '#6a7a60', borderRadius: 3, cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>
          {v.icon} {v.label}
        </button>
      ))}
    </div>
  )
}
