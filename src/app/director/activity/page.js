'use client'
import { useState, useEffect } from 'react'
import { MilBadge, MilSpinner, PageHeader, StatCard, ToastProvider } from '@/lib/mil'

const ACTION_COLORS = { CREATE: '#4a7c59', UPDATE: '#8b6914', DELETE: '#8b1a1a', LOGIN: '#234b84', EXPORT: '#2b4a5a', VIEW: '#3a3a3a' }

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterEntity, setFilterEntity] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/activity-log').then(r=>r.json()).then(d => { setLogs(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const entities = [...new Set(logs.map(l=>l.entity))].filter(Boolean)
  const actions = [...new Set(logs.map(l=>l.action))].filter(Boolean)

  const filtered = logs.filter(l =>
    (!filterEntity || l.entity === filterEntity) &&
    (!filterAction || l.action === filterAction) &&
    (!search || JSON.stringify(l).toLowerCase().includes(search.toLowerCase()))
  )

  const timeAgo = (d) => {
    const diff = Date.now() - new Date(d).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return new Date(d).toLocaleDateString()
  }

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh' }}>
      <ToastProvider />
      <PageHeader title="ACTIVITY LOG" subtitle="System-wide audit trail — all CRUD operations and user actions" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total Events" value={logs.length} color="#4a7c59" />
        <StatCard label="Creates" value={logs.filter(l=>l.action==='CREATE').length} color="#4a7c59" />
        <StatCard label="Updates" value={logs.filter(l=>l.action==='UPDATE').length} color="#8b6914" />
        <StatCard label="Deletes" value={logs.filter(l=>l.action==='DELETE').length} color="#8b1a1a" />
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search logs..." style={{ background:'#1a1f14', border:'1px solid #2a3020', color:'#e8d5a3', padding:'6px 12px', borderRadius:4, fontFamily:'Rajdhani,sans-serif', fontSize:12, width:200 }} />
        <select value={filterEntity} onChange={e=>setFilterEntity(e.target.value)} style={{ background:'#1a1f14', border:'1px solid #2a3020', color:'#e8d5a3', padding:'6px 12px', borderRadius:4, fontFamily:'Rajdhani,sans-serif', fontSize:12 }}>
          <option value="">ALL ENTITIES</option>
          {entities.map(e=><option key={e} value={e}>{e}</option>)}
        </select>
        <select value={filterAction} onChange={e=>setFilterAction(e.target.value)} style={{ background:'#1a1f14', border:'1px solid #2a3020', color:'#e8d5a3', padding:'6px 12px', borderRadius:4, fontFamily:'Rajdhani,sans-serif', fontSize:12 }}>
          <option value="">ALL ACTIONS</option>
          {actions.map(a=><option key={a} value={a}>{a}</option>)}
        </select>
        <button onClick={load} style={{ padding:'6px 14px', background:'transparent', border:'1px solid #4a7c59', color:'#4a7c59', borderRadius:4, cursor:'pointer', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:12 }}>↻ REFRESH</button>
      </div>
      {loading ? <MilSpinner /> : (
        <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, overflow:'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding:40, textAlign:'center', color:'#4a5a40', fontFamily:'Rajdhani,sans-serif' }}>No activity logs found. Actions will appear here as users interact with the system.</div>
          ) : filtered.map((log, i) => (
            <div key={log.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'12px 20px', borderBottom: i < filtered.length-1 ? '1px solid #1e2418' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background: ACTION_COLORS[log.action] || '#3a3a3a', flexShrink:0 }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                  <span style={{ background: ACTION_COLORS[log.action] || '#3a3a3a', color:'#e8d5a3', padding:'1px 8px', borderRadius:3, fontSize:10, fontFamily:'Rajdhani,sans-serif', fontWeight:700, letterSpacing:1 }}>{log.action}</span>
                  <span style={{ color:'#c8a84b', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:13 }}>{log.entity}</span>
                  {log.entityId && <span style={{ color:'#4a5a40', fontFamily:'monospace', fontSize:11 }}>#{log.entityId.slice(-8)}</span>}
                </div>
                {log.details && <div style={{ color:'#8a9a80', fontFamily:'Rajdhani,sans-serif', fontSize:12, marginTop:2 }}>{log.details}</div>}
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ color:'#6a7a60', fontFamily:'Rajdhani,sans-serif', fontSize:12 }}>{log.user?.name || 'System'}</div>
                <div style={{ color:'#4a5a40', fontFamily:'Rajdhani,sans-serif', fontSize:11 }}>{timeAgo(log.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
