'use client'
import { useSocket } from '@/lib/useSocket';
import LiveToast from '@/components/LiveToast';
import OnlineUsers from '@/components/OnlineUsers';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react'
import { PageHeader, StatCard, ToastProvider, toast, useCrud, MilModal, MilBtn, MilInput, MilSelect, FormField, FormRow, FormActions } from '@/lib/mil'

const DISCIPLINES = ['Architecture','Structure','MEP','Civil','Landscape','Heritage','Federated']
const LOD_COLORS = { '': '#141910', '100': '#1a3a2a', '200': '#1e4a2e', '300': '#2a5c3a', '350': '#3a6e4a', '400': '#4a7c59', '500': '#5a9c6a' }
const LOD_TEXT = { '': '#2a3a28', '100': '#6aaa80', '200': '#7aba90', '300': '#8acaa0', '350': '#9adab0', '400': '#c8a84b', '500': '#e8d5a3' }
const BIM_ELEMENTS = ['Site & Topography','Foundations','Structural Frame','Floors & Slabs','Roof Structure','External Walls','Internal Walls','Doors & Windows','Stairs & Ramps','HVAC Systems','Plumbing & Drainage','Electrical Systems','Fire Protection','Facade System','Ceilings & Finishes','Furniture & Equipment']
const EMPTY = { element: '', discipline: '', lodLevel: '200', notes: '', projectId: '' }

export default function BimScopeMatrixPage() {
  const { data: entries, loading, load, create, update, remove } = useCrud('/api/bim/scope')
  

  const { data: session } = useSession();
  const [liveEvents, setLiveEvents] = useState([]);
  const handleLiveEvent = (ev) => {
    setLiveEvents(prev => [...prev, { ...ev, id: Date.now() + Math.random() }]);
    // Auto-refresh data list
    if (ev.action === 'created' || ev.action === 'updated' || ev.action === 'deleted') {
      // Re-fetch from DB to get the latest data
      load();
    }
  };
  const { isConnected, onlineUsers, emitCrud } = useSocket('scope', session?.user, handleLiveEvent);
const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [cellCtx, setCellCtx] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [filterProject, setFilterProject] = useState('')

  useEffect(() => { fetch('/api/projects').then(r=>r.json()).then(setProjects) }, [])
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  const getCell = useCallback((element, discipline) => {
    const src = filterProject ? entries.filter(e => e.projectId === filterProject) : entries
    return src.find(e => e.element === element && e.discipline === discipline)
  }, [entries, filterProject])

  const openCell = (element, discipline) => {
    const existing = getCell(element, discipline)
    if (existing) { setEditing(existing); setForm({ ...existing }) }
    else { setEditing(null); setForm({ ...EMPTY, element, discipline }) }
    setCellCtx({ element, discipline }); setModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) { const _updated = await update(editing.id, form); emitCrud('updated', _updated || form); }
      else { const _created = await create(form); emitCrud('created', _created || form); }
      setModal(false); setCellCtx(null)
    } catch(err) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!editing || !confirm('Remove this LOD assignment?')) return
    await remove(editing.id); emitCrud('deleted', { id: editing.id }); setModal(false); setCellCtx(null)
  }

  const pct = Math.round(entries.length / (BIM_ELEMENTS.length * DISCIPLINES.length) * 100)

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh' }}>
      <ToastProvider />
      <LiveToast events={liveEvents} />
      
<style>{`
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
`}</style>

      <PageHeader title="BIM SCOPE MATRIX" subtitle="Plannerly-style LOD specification grid — click any cell to assign LOD level"
        actions={
          <div style={{ display:'flex', gap:8 }}>
            {['grid','list'].map(v => (
              <button key={v} onClick={() => setViewMode(v)} style={{ padding:'6px 14px', background: viewMode===v ? '#4a7c59' : 'transparent', border:'1px solid #2a3020', color: viewMode===v ? '#e8d5a3' : '#6a7a60', borderRadius:4, cursor:'pointer', fontFamily:'Orbitron,sans-serif', fontSize:10, letterSpacing:1 }}>{v.toUpperCase()}</button>
            ))}
            <MilBtn onClick={() => { setEditing(null); setForm(EMPTY); setCellCtx(null); setModal(true) }}>+ ADD ENTRY</MilBtn>
          </div>
        } />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total Entries" value={entries.length} color="#4a7c59" />
        <StatCard label="Matrix Coverage" value={`${pct}%`} color="#c8a84b" />
        <StatCard label="LOD 400+" value={entries.filter(e=>parseInt(e.lodLevel)>=400).length} color="#2ecc71" />
        <StatCard label="Elements" value={BIM_ELEMENTS.length} color="#3498db" />
      </div>

      <div style={{ marginBottom:16, display:'flex', gap:8, alignItems:'center' }}>
        <span style={{ fontFamily:'Rajdhani,sans-serif', color:'#6a7a60', fontSize:13 }}>FILTER BY PROJECT:</span>
        <select value={filterProject} onChange={e=>setFilterProject(e.target.value)} style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:4, padding:'6px 12px', color:'#e8d5a3', fontFamily:'Rajdhani,sans-serif', fontSize:13 }}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {viewMode === 'grid' ? (
        <div style={{ overflowX:'auto' }}>
          <table style={{ borderCollapse:'collapse', width:'100%', minWidth:900 }}>
            <thead>
              <tr>
                <th style={{ background:'#1a1f14', border:'1px solid #2a3020', padding:'8px 12px', fontFamily:'Orbitron,sans-serif', fontSize:10, color:'#c8a84b', letterSpacing:1, textAlign:'left', minWidth:160 }}>ELEMENT</th>
                {DISCIPLINES.map(d => (
                  <th key={d} style={{ background:'#1a1f14', border:'1px solid #2a3020', padding:'8px 10px', fontFamily:'Orbitron,sans-serif', fontSize:9, color:'#c8a84b', letterSpacing:1, textAlign:'center', minWidth:90 }}>{d.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BIM_ELEMENTS.map((element, ri) => (
                <tr key={element}>
                  <td style={{ background: ri%2===0 ? '#141910' : '#111610', border:'1px solid #2a3020', padding:'7px 12px', fontFamily:'Rajdhani,sans-serif', fontSize:13, color:'#e8d5a3', fontWeight:600 }}>{element}</td>
                  {DISCIPLINES.map(discipline => {
                    const cell = getCell(element, discipline)
                    const lod = cell?.lodLevel || ''
                    return (
                      <td key={discipline} onClick={() => openCell(element, discipline)}
                        title={lod ? `LOD ${lod}${cell?.notes ? ' — ' + cell.notes : ''}` : 'Click to assign LOD'}
                        style={{ background: LOD_COLORS[lod] || (ri%2===0 ? '#141910' : '#111610'), border:'1px solid #2a3020', padding:'6px 8px', textAlign:'center', cursor:'pointer', transition:'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.outline = '2px solid #c8a84b'; e.currentTarget.style.zIndex = '2' }}
                        onMouseLeave={e => { e.currentTarget.style.outline = 'none'; e.currentTarget.style.zIndex = '1' }}>
                        {lod ? (
                          <span style={{ fontFamily:'Orbitron,sans-serif', fontSize:10, fontWeight:700, color: LOD_TEXT[lod] }}>{lod}</span>
                        ) : (
                          <span style={{ color:'#2a3a28', fontSize:14 }}>+</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop:12, display:'flex', gap:12, flexWrap:'wrap' }}>
            {Object.entries(LOD_COLORS).filter(([k]) => k).map(([lod, bg]) => (
              <div key={lod} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:20, height:14, background:bg, border:`1px solid ${LOD_TEXT[lod]}44`, borderRadius:2 }} />
                <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:12, color:'#6a7a60' }}>LOD {lod}</span>
              </div>
            ))}
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:20, height:14, background:'#141910', border:'1px solid #2a3020', borderRadius:2 }} />
              <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:12, color:'#6a7a60' }}>Not assigned</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['ELEMENT','DISCIPLINE','LOD','NOTES'].map(h => <th key={h} style={{ padding:'8px 12px', fontFamily:'Orbitron,sans-serif', fontSize:10, color:'#c8a84b', letterSpacing:1, textAlign:'left', borderBottom:'1px solid #2a3020' }}>{h}</th>)}
                <th style={{ padding:'8px 12px', fontFamily:'Orbitron,sans-serif', fontSize:10, color:'#c8a84b', letterSpacing:1, textAlign:'right', borderBottom:'1px solid #2a3020' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan={5} style={{ padding:32, textAlign:'center', color:'#3a4a30', fontFamily:'Rajdhani,sans-serif' }}>No entries. Click cells in grid view to assign LOD levels.</td></tr>
              ) : entries.map((row, i) => (
                <tr key={row.id} style={{ background: i%2===0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding:'8px 12px', fontFamily:'Rajdhani,sans-serif', fontSize:13, color:'#e8d5a3', borderBottom:'1px solid #1a1f14' }}>{row.element}</td>
                  <td style={{ padding:'8px 12px', fontFamily:'Rajdhani,sans-serif', fontSize:13, color:'#e8d5a3', borderBottom:'1px solid #1a1f14' }}>{row.discipline}</td>
                  <td style={{ padding:'8px 12px', borderBottom:'1px solid #1a1f14' }}>
                    <span style={{ fontFamily:'Orbitron,sans-serif', fontSize:11, fontWeight:700, color: LOD_TEXT[row.lodLevel] || '#c8a84b', background: LOD_COLORS[row.lodLevel] || '#1a1f14', padding:'2px 8px', borderRadius:3 }}>LOD {row.lodLevel}</span>
                  </td>
                  <td style={{ padding:'8px 12px', fontFamily:'Rajdhani,sans-serif', fontSize:13, color:'#a0a090', borderBottom:'1px solid #1a1f14' }}>{row.notes?.substring(0,50) || '—'}</td>
                  <td style={{ padding:'8px 12px', textAlign:'right', borderBottom:'1px solid #1a1f14' }}>
                    <button onClick={() => { setEditing(row); setForm({...row}); setCellCtx(null); setModal(true) }} style={{ background:'transparent', border:'1px solid #2a3020', color:'#c8a84b', padding:'3px 10px', borderRadius:3, cursor:'pointer', fontFamily:'Rajdhani,sans-serif', fontSize:12, marginRight:6 }}>EDIT</button>
                    <button onClick={() => remove(row.id)} style={{ background:'transparent', border:'1px solid #8b1a1a', color:'#e74c3c', padding:'3px 10px', borderRadius:3, cursor:'pointer', fontFamily:'Rajdhani,sans-serif', fontSize:12 }}>DEL</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MilModal open={modal} onClose={() => { setModal(false); setCellCtx(null) }}
        title={cellCtx ? `LOD — ${cellCtx.element} × ${cellCtx.discipline}` : (editing ? 'EDIT LOD ENTRY' : 'NEW LOD ENTRY')} width={520}>
        <form onSubmit={handleSubmit}>
          {!cellCtx && (
            <FormRow>
              <FormField label="Element" required>
                <MilSelect value={form.element} onChange={f('element')} options={BIM_ELEMENTS} placeholder="Select element..." required />
              </FormField>
              <FormField label="Discipline" required>
                <MilSelect value={form.discipline} onChange={f('discipline')} options={DISCIPLINES} placeholder="Select discipline..." required />
              </FormField>
            </FormRow>
          )}
          <FormRow>
            <FormField label="LOD Level" required>
              <MilSelect value={form.lodLevel} onChange={f('lodLevel')} options={['100','200','300','350','400','500']} required />
            </FormField>
            <FormField label="Project">
              <MilSelect value={form.projectId} onChange={f('projectId')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." />
            </FormField>
          </FormRow>
          <FormField label="Notes"><MilInput value={form.notes} onChange={f('notes')} placeholder="LOD specification notes..." /></FormField>
          <div style={{ display:'flex', gap:12, justifyContent:'space-between', marginTop:24, paddingTop:16, borderTop:'1px solid #2a3020' }}>
            {editing && <button type="button" onClick={handleDelete} style={{ padding:'8px 16px', background:'transparent', border:'1px solid #8b1a1a', color:'#e74c3c', borderRadius:4, cursor:'pointer', fontFamily:'Rajdhani,sans-serif', fontWeight:600 }}>REMOVE</button>}
            <div style={{ display:'flex', gap:12, marginLeft:'auto' }}>
              <button type="button" onClick={() => { setModal(false); setCellCtx(null) }} style={{ padding:'8px 20px', background:'transparent', border:'1px solid #4a7c59', color:'#a0a090', borderRadius:4, cursor:'pointer', fontFamily:'Rajdhani,sans-serif', fontWeight:600 }}>CANCEL</button>
              <button type="submit" disabled={saving} style={{ padding:'8px 24px', background:'#4a7c59', border:'none', color:'#e8d5a3', borderRadius:4, cursor:saving?'not-allowed':'pointer', fontFamily:'Rajdhani,sans-serif', fontWeight:700, opacity:saving?0.7:1 }}>
                {saving ? 'SAVING...' : (editing ? 'UPDATE' : 'ASSIGN LOD')}
              </button>
            </div>
          </div>
        </form>
      </MilModal>
    </div>
  )
}
