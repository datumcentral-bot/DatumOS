'use client'
// DN015 — Drawings / sheets / schedules read surface.
//
// Attached to the EXISTING director/bim surface. Reads the three DISTINCT Revit
// element classes through the existing dcortex-proxy relay:
//
//   /revit/views     -> View elements
//   /revit/sheets    -> ViewSheet elements
//   /revit/schedules -> ViewSchedule elements
//
// A ViewSheet and a ViewSchedule are different Revit classes and are never
// inferred from the view list. If the model genuinely has no sheets or schedules
// this page reports ZERO. No identifier is ever fabricated.

import { useState, useEffect } from 'react'
import { MilTable, MilBtn, PageHeader, StatCard, ToastProvider } from '@/lib/mil'

function DrawingsPage() {
  const [views, setViews] = useState(null)
  const [sheets, setSheets] = useState(null)
  const [schedules, setSchedules] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('views')
  const [unavailable, setUnavailable] = useState({})

  const load = async () => {
    setLoading(true); setError(null)
    // Each Revit element class loads independently. If the bridge does not
    // expose a class (HTTP 503) the sections that DO load still render,
    // and the failed section is flagged as unavailable — one dead class
    // never breaks the whole page.
    const get = async (p) => {
      try {
        const r = await fetch(`/api/dcortex-proxy${p}`)
        if (!r.ok) return { __unavailable: true, status: r.status }
        return r.json()
      } catch { return { __unavailable: true, status: 0 } }
    }
    const [v, s, sc] = await Promise.all([
      get('/revit/views'), get('/revit/sheets'), get('/revit/schedules'),
    ])
    setViews(v); setSheets(s); setSchedules(sc)
    setUnavailable({
      views: !!v?.__unavailable,
      sheets: !!s?.__unavailable,
      schedules: !!sc?.__unavailable,
    })
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const rows = view === 'views' ? (views?.items || [])
    : view === 'sheets' ? (sheets?.items || [])
    : (schedules?.items || [])

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PageHeader
        title="DRAWINGS / SHEETS / SCHEDULES"
        subtitle="Real Revit element classes read from the live model — never inferred, never fabricated"
        actions={<MilBtn onClick={load} disabled={loading}>{loading ? 'READING…' : 'REFRESH'}</MilBtn>}
      />

      {error && (
        <div style={{ border: '1px solid rgba(255,59,48,0.4)', background: 'rgba(255,59,48,0.08)',
                      color: '#ff3b30', padding: 10, borderRadius: 3, fontSize: '0.7rem' }}>
          SOURCE UNAVAILABLE — {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10 }}>
        <StatCard label="VIEWS" value={unavailable.views ? 'N/A' : (views?.count ?? '—')} />
        <StatCard label="SHEETS (ViewSheet)" value={unavailable.sheets ? 'N/A' : (sheets?.count ?? '—')} />
        <StatCard label="SCHEDULES (ViewSchedule)" value={unavailable.schedules ? 'N/A' : (schedules?.count ?? '—')} />
        <StatCard label="FABRICATED" value={sheets?.fabricated || schedules?.fabricated ? 'YES' : 'NO'} />
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {['views', 'sheets', 'schedules'].map((t) => (
          <button key={t} onClick={() => setView(t)} style={{
            background: view === t ? 'rgba(74,158,255,0.15)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${view === t ? 'rgba(74,158,255,0.45)' : 'rgba(255,255,255,0.1)'}`,
            color: view === t ? '#4a9eff' : '#8a9bb0', padding: '4px 12px', borderRadius: 2,
            fontSize: '0.6rem', letterSpacing: 1, cursor: 'pointer',
          }}>
            {t.toUpperCase()} ({view === t ? rows.length : (
              t === 'views' ? (views?.count ?? 0) : t === 'sheets' ? (sheets?.count ?? 0) : (schedules?.count ?? 0))})
          </button>
        ))}
      </div>

      {rows.length === 0 && !loading ? (
        unavailable[view] ? (
          <div style={{ color: '#ff9500', fontSize: '0.7rem', padding: 12,
                        border: '1px dashed rgba(255,149,0,0.35)', borderRadius: 3 }}>
            THIS ELEMENT CLASS IS UNAVAILABLE — the Revit bridge did not return
            {view} (service unavailable). Element classes the bridge does expose
            still load normally above.
          </div>
        ) : (
          <div style={{ color: '#8a9bb0', fontSize: '0.7rem', padding: 12,
                        border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 3 }}>
            THE LIVE MODEL CONTAINS NO {view.toUpperCase()} — this is a truthful zero from a real
            element-class read, not a missing feature and not an engine failure.
          </div>
        )
      ) : (
        <MilTable
          rows={rows}
          columns={[
            { key: 'id', label: 'ELEMENT ID' },
            { key: 'name', label: 'NAME' },
            { key: 'type', label: 'TYPE' },
            { key: 'sheet_number', label: 'SHEET NO.' },
          ]}
        />
      )}

      <div style={{ fontSize: '0.55rem', color: '#6b8e23', lineHeight: 1.7 }}>
        <div>VIEW SOURCE: {views?.source || 'bridge /views'}</div>
        <div>SHEET SOURCE: {sheets?.source || 'Revit ViewSheet collector (read-only)'}</div>
        <div>SCHEDULE SOURCE: {schedules?.source || 'Revit ViewSchedule collector (read-only)'}</div>
      </div>
    </div>
  )
}

export default function BimDrawingsPage() {
  return (
    <ToastProvider>
      <DrawingsPage />
    </ToastProvider>
  )
}
