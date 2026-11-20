'use client'
// DN035 — Engineering advisory view.
//
// Attached to the EXISTING director/bim surface (no new dashboard, no second
// engineering engine). Every value shown here is read from the canonical gateway
// via the existing dcortex-proxy relay:
//
//   engineering capabilities -> /bim/engineering  (engineering.service.CalculationService)
//   discipline signals      -> /bim/engineering  (live QA + Clash finding stores)
//
// Nothing is manufactured in Prisma. Prisma remains workflow/history storage only.
// Engine status, model status and finding counts are shown as separate facts: a
// model with findings is a MODEL result, not an engine failure.

import { useState, useEffect } from 'react'
import { MilTable, MilBadge, MilBtn, PageHeader, StatCard, ToastProvider, toast } from '@/lib/mil'

const SEV_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 }

function EngineeringPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('signals')
  const [capQuery, setCapQuery] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dcortex-proxy/bim/engineering')
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
      setData(body)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const signals = data?.model_signals?.signals || []
  // capabilities arrive as a list of calculation descriptors from CalculationService
  const rawCaps = data?.capabilities?.capabilities
  const caps = Array.isArray(rawCaps) ? rawCaps : (rawCaps ? Object.entries(rawCaps).map(([k, v]) => ({ calculation_type: k, ...v })) : [])

  const bySeverity = [...signals].sort(
    (a, b) => (SEV_ORDER[a.severity] ?? 9) - (SEV_ORDER[b.severity] ?? 9)
  )
  const shownCaps = capQuery
    ? caps.filter((c) => `${c.calculation_type} ${c.discipline || ''}`.toLowerCase().includes(capQuery.toLowerCase()))
    : caps

  const engines = [...new Set(signals.map((s) => s.engine))]

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PageHeader
        title="ENGINEERING ADVISORY"
        subtitle="Canonical engineering calculators + live model discipline signals"
        actions={<MilBtn onClick={load} disabled={loading}>{loading ? 'REFRESHING…' : 'REFRESH'}</MilBtn>}
      />

      {error && (
        <div style={{ border: '1px solid rgba(255,59,48,0.4)', background: 'rgba(255,59,48,0.08)',
                      color: '#ff3b30', padding: 10, borderRadius: 3, fontSize: '0.7rem' }}>
          ENGINEERING SOURCE UNAVAILABLE — {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
        <StatCard label="ENGINE STATUS" value={data?.capabilities?.available ? 'READY' : 'DEGRADED'} />
        <StatCard label="DISCIPLINE SIGNALS" value={signals.length} />
        <StatCard label="SOURCE ENGINES" value={engines.length ? engines.join(' / ').toUpperCase() : '—'} />
        <StatCard label="ENGINEERING CAPABILITIES" value={caps.length} />
        <StatCard label="MODEL WRITES EXPOSED" value={data?.writes_exposed ? 'YES' : 'NO'} />
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {['signals', 'capabilities'].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? 'rgba(74,158,255,0.15)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${tab === t ? 'rgba(74,158,255,0.45)' : 'rgba(255,255,255,0.1)'}`,
            color: tab === t ? '#4a9eff' : '#8a9bb0', padding: '4px 12px', borderRadius: 2,
            fontSize: '0.6rem', letterSpacing: 1, cursor: 'pointer',
          }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === 'signals' && (
        <>
          {signals.length === 0 ? (
            <div style={{ color: '#8a9bb0', fontSize: '0.7rem', padding: 12,
                          border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 3 }}>
              NO DISCIPLINE SIGNALS IN THE CURRENT RUN — this is a truthful empty result, not an engine failure.
            </div>
          ) : (
            <MilTable
              rows={bySeverity}
              columns={[
                { key: 'severity', label: 'SEVERITY', render: (v) => <MilBadge status={v} /> },
                { key: 'engine', label: 'ENGINE' },
                { key: 'rule_id', label: 'RULE' },
                { key: 'rule_name', label: 'CHECK' },
                { key: 'entity', label: 'DISCIPLINE' },
                { key: 'actual', label: 'OBSERVED' },
              ]}
            />
          )}
        </>
      )}

      {tab === 'capabilities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            value={capQuery}
            onChange={(e) => setCapQuery(e.target.value)}
            placeholder="FILTER CAPABILITIES…"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                     color: '#e6edf3', padding: '6px 10px', borderRadius: 2, fontSize: '0.7rem' }}
          />
          {shownCaps.length === 0 ? (
            <div style={{ color: '#8a9bb0', fontSize: '0.7rem' }}>
              NO CAPABILITIES MATCH — canonical capability list is
              {' '}{data?.capabilities?.available ? 'available' : 'unavailable'}.
            </div>
          ) : (
            shownCaps.map((c) => (
              <div key={c.calculation_type} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, padding: 8 }}>
                <div style={{ fontSize: '0.65rem', color: '#4a9eff', letterSpacing: 1 }}>
                  {c.calculation_type}
                </div>
                <div style={{ fontSize: '0.55rem', color: '#8a9bb0', marginTop: 3 }}>
                  DISCIPLINE: {c.discipline || '—'} · ACCESS: {c.access || '—'} ·
                  {' '}APPROVAL REQUIRED: {c.engineering_approval_required ? 'YES' : 'NO'} ·
                  {' '}OUTPUT: {c.output_unit || '—'}
                </div>
                <pre style={{ margin: '4px 0 0', fontSize: '0.6rem', color: '#8a9bb0',
                              whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {JSON.stringify(c, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      )}

      {data && (
        <div style={{ fontSize: '0.55rem', color: '#6b8e23', letterSpacing: 0.5, lineHeight: 1.7 }}>
          <div>SOURCE: {data.source}</div>
          <div>SIGNAL PROVENANCE: {JSON.stringify(data.model_signals?.provenance || {})}</div>
          <div>FABRICATED DATA: {data.fabricated ? 'YES' : 'NO'} · MODEL WRITES EXPOSED:{' '}
            {data.writes_exposed ? 'YES' : 'NO'}</div>
        </div>
      )}
    </div>
  )
}

export default function BimEngineeringPage() {
  return (
    <ToastProvider>
      <EngineeringPage />
    </ToastProvider>
  )
}
