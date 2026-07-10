'use client'
import { useState, useEffect } from 'react'
import { PageHeader, StatCard, MilSpinner, ToastProvider, toast } from '@/lib/mil'

function getWeekStart(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay() + 1 + offset * 7)
  d.setHours(0,0,0,0)
  return d
}

export default function WorkloadPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [data, setData] = useState({ users: [], allocations: [] })
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])

  const weekStart = getWeekStart(weekOffset)
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/workload?weekStart=${weekStart.toISOString()}`).then(r=>r.json()),
      fetch('/api/projects').then(r=>r.json())
    ]).then(([w, p]) => { setData(w); setProjects(p) }).finally(() => setLoading(false))
  }, [weekOffset])

  const getUserAlloc = (userId) => data.allocations.filter(a => a.userId === userId)
  const getUserTotal = (userId) => getUserAlloc(userId).reduce((s, a) => s + a.hours, 0)

  const addAlloc = async (userId, projectId, hours) => {
    try {
      await fetch('/api/workload', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId, projectId, hours: parseFloat(hours), weekStart: weekStart.toISOString() }) })
      const w = await fetch(`/api/workload?weekStart=${weekStart.toISOString()}`).then(r=>r.json())
      setData(w)
      toast('Allocation saved')
    } catch(e) { toast(e.message, 'error') }
  }

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh' }}>
      <ToastProvider />
      <PageHeader title="WORKLOAD MANAGEMENT" subtitle="Team capacity and allocation by week"
        actions={
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button onClick={() => setWeekOffset(w => w-1)} style={{padding:'6px 12px',background:'transparent',border:'1px solid #4a7c59',color:'#e8d5a3',borderRadius:4,cursor:'pointer',fontFamily:'Rajdhani,sans-serif',fontWeight:700}}>← PREV</button>
            <span style={{fontFamily:'Orbitron,sans-serif',color:'#c8a84b',fontSize:12,padding:'0 12px'}}>
              {weekStart.toLocaleDateString()} — {weekEnd.toLocaleDateString()}
            </span>
            <button onClick={() => setWeekOffset(w => w+1)} style={{padding:'6px 12px',background:'transparent',border:'1px solid #4a7c59',color:'#e8d5a3',borderRadius:4,cursor:'pointer',fontFamily:'Rajdhani,sans-serif',fontWeight:700}}>NEXT →</button>
          </div>
        } />
      {loading ? <MilSpinner /> : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {data.users.map(user => {
            const total = getUserTotal(user.id)
            const pct = Math.min(100, Math.round((total / user.capacityHrs) * 100))
            const color = pct > 90 ? '#8b1a1a' : pct > 75 ? '#8b6914' : '#4a7c59'
            return (
              <div key={user.id} style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <div>
                    <div style={{fontFamily:'Rajdhani,sans-serif',color:'#e8d5a3',fontWeight:700,fontSize:15}}>{user.name}</div>
                    <div style={{fontFamily:'Rajdhani,sans-serif',color:'#6a7a60',fontSize:12}}>{user.title}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontFamily:'Orbitron,sans-serif',color,fontSize:18,fontWeight:700}}>{total}h</div>
                    <div style={{fontFamily:'Rajdhani,sans-serif',color:'#6a7a60',fontSize:12}}>of {user.capacityHrs}h capacity ({pct}%)</div>
                  </div>
                </div>
                <div style={{background:'#0d1108',borderRadius:2,height:8,overflow:'hidden',marginBottom:12}}>
                  <div style={{width:`${pct}%`,height:'100%',background:color,borderRadius:2,transition:'width 0.5s'}} />
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {getUserAlloc(user.id).map(a => (
                    <div key={a.id} style={{background:'#0d1108',border:'1px solid #2a3020',borderRadius:4,padding:'4px 10px',fontFamily:'Rajdhani,sans-serif',fontSize:12,color:'#a0a090'}}>
                      {a.project?.name || 'Unassigned'}: <strong style={{color:'#c8a84b'}}>{a.hours}h</strong>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
