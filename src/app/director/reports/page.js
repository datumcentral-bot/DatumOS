'use client'
import { useState, useEffect } from 'react'
import { PageHeader, StatCard, MilSpinner, MilBadge, ToastProvider } from '@/lib/mil'

function Bar({ label, value, max, color = '#4a7c59' }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:13, color:'#e8d5a3' }}>{label}</span>
        <span style={{ fontFamily:'Orbitron,sans-serif', fontSize:11, color }}>{value}</span>
      </div>
      <div style={{ height:8, background:'rgba(255,255,255,0.04)', borderRadius:4, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:color, transition:'width 0.5s ease' }} />
      </div>
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
      <div style={{ fontFamily:'Orbitron,sans-serif', color:'#c8a84b', fontSize:12, letterSpacing:2, marginBottom:16 }}>{title}</div>
      {children}
    </div>
  )
}

export default function ReportsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reports').then(r=>r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding:24, background:'#0d1108', minHeight:'100vh' }}><MilSpinner /></div>
  if (!data) return <div style={{ padding:24, background:'#0d1108', minHeight:'100vh', color:'#e8d5a3', fontFamily:'Rajdhani,sans-serif' }}>Failed to load reports.</div>

  const taskTotal = data.tasksByStatus?.reduce((s,t) => s+t._count.id, 0) || 1
  const clashTotal = data.clashByStatus?.reduce((s,c) => s+c._count.id, 0) || 1
  const cdeTotal = data.cdeByStatus?.reduce((s,c) => s+c._count.id, 0) || 1

  const fmt = (n) => (n||0).toLocaleString('en-AE', { minimumFractionDigits:0, maximumFractionDigits:0 })

  return (
    <div style={{ padding:24, background:'#0d1108', minHeight:'100vh' }}>
      <ToastProvider />
      <PageHeader title="REPORTS & ANALYTICS" subtitle="Real-time project metrics, financial summary, and BIM coordination status" />

      {/* KPI Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Active Projects" value={data.summary?.activeProjects || 0} color="#4a7c59" />
        <StatCard label="Total Revenue" value={`AED ${fmt(data.summary?.totalRevenue)}`} color="#4a7c59" />
        <StatCard label="Outstanding" value={`AED ${fmt(data.summary?.outstanding)}`} color="#8b6914" />
        <StatCard label="Total Projects" value={data.summary?.totalProjects || 0} color="#234b84" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        {/* Project Status */}
        <Panel title="PROJECT STATUS">
          {data.projects?.length === 0 ? <div style={{ color:'#4a5a40', fontFamily:'Rajdhani,sans-serif' }}>No projects.</div> :
            data.projects?.map(p => (
              <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #1e2418' }}>
                <div>
                  <div style={{ fontFamily:'Rajdhani,sans-serif', color:'#e8d5a3', fontWeight:700, fontSize:13 }}>{p.name}</div>
                  <div style={{ fontFamily:'Rajdhani,sans-serif', color:'#6a7a60', fontSize:11 }}>{p.code}</div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <div style={{ fontFamily:'Orbitron,sans-serif', color:'#c8a84b', fontSize:11 }}>{p.progressPct || 0}%</div>
                  <MilBadge status={p.status} />
                </div>
              </div>
            ))
          }
        </Panel>

        {/* Task Distribution */}
        <Panel title="TASK DISTRIBUTION">
          {data.tasksByStatus?.map(t => (
            <Bar key={t.status} label={t.status.replace(/_/g,' ')} value={t._count.id} max={taskTotal} color={t.status==='DONE'?'#4a7c59':t.status==='IN_PROGRESS'?'#8b6914':'#234b84'} />
          ))}
          {(!data.tasksByStatus || data.tasksByStatus.length === 0) && <div style={{ color:'#4a5a40', fontFamily:'Rajdhani,sans-serif' }}>No tasks.</div>}
        </Panel>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20, marginBottom:20 }}>
        {/* Clash Status */}
        <Panel title="CLASH DETECTION">
          {data.clashByStatus?.map(c => (
            <Bar key={c.status} label={c.status.replace(/_/g,' ')} value={c._count.id} max={clashTotal} color={c.status==='OPEN'?'#8b1a1a':c.status==='RESOLVED'?'#4a7c59':'#8b6914'} />
          ))}
          {(!data.clashByStatus || data.clashByStatus.length === 0) && <div style={{ color:'#4a5a40', fontFamily:'Rajdhani,sans-serif' }}>No clashes.</div>}
        </Panel>

        {/* CDE Status */}
        <Panel title="CDE DOCUMENTS">
          {data.cdeByStatus?.map(c => (
            <Bar key={c.status} label={c.status} value={c._count.id} max={cdeTotal} color={c.status==='PUBLISHED'?'#4a7c59':c.status==='WIP'?'#234b84':'#8b6914'} />
          ))}
          {(!data.cdeByStatus || data.cdeByStatus.length === 0) && <div style={{ color:'#4a5a40', fontFamily:'Rajdhani,sans-serif' }}>No CDE docs.</div>}
        </Panel>

        {/* CRM Pipeline */}
        <Panel title="CRM PIPELINE">
          {data.leadsByStage?.map(l => (
            <div key={l.stage} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #1e2418' }}>
              <span style={{ fontFamily:'Rajdhani,sans-serif', color:'#e8d5a3', fontSize:13 }}>{l.stage?.replace(/_/g,' ')}</span>
              <span style={{ fontFamily:'Orbitron,sans-serif', color:'#c8a84b', fontSize:12 }}>{l._count.id}</span>
            </div>
          ))}
          {(!data.leadsByStage || data.leadsByStage.length === 0) && <div style={{ color:'#4a5a40', fontFamily:'Rajdhani,sans-serif' }}>No leads.</div>}
        </Panel>
      </div>

      {/* Team Utilization */}
      <Panel title="TEAM UTILIZATION">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:12 }}>
          {data.users?.map(u => {
            const alloc = u.resourceAllocations?.reduce((s,r) => s + (r.allocatedHrs||0), 0) || 0
            const util = u.capacityHrs ? Math.min(100, Math.round(alloc / u.capacityHrs * 100)) : 0
            return (
              <div key={u.id} style={{ background:'#0d1108', border:'1px solid #2a3020', borderRadius:4, padding:12 }}>
                <div style={{ fontFamily:'Rajdhani,sans-serif', color:'#e8d5a3', fontWeight:700, fontSize:13 }}>{u.name}</div>
                <div style={{ fontFamily:'Rajdhani,sans-serif', color:'#6a7a60', fontSize:11, marginBottom:8 }}>{u.title || u.role}</div>
                <Bar label={`${util}% utilized`} value={util} max={100} color={util>90?'#8b1a1a':util>70?'#8b6914':'#4a7c59'} />
                <div style={{ fontFamily:'Rajdhani,sans-serif', color:'#6a7a60', fontSize:11 }}>{u._count?.tasks || 0} active tasks</div>
              </div>
            )
          })}
          {(!data.users || data.users.length === 0) && <div style={{ color:'#4a5a40', fontFamily:'Rajdhani,sans-serif' }}>No team members.</div>}
        </div>
      </Panel>
    </div>
  )
}
