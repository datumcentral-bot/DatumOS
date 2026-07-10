'use client'
import { useSocket } from '@/lib/useSocket';
import LiveToast from '@/components/LiveToast';
import OnlineUsers from '@/components/OnlineUsers';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilTextarea, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from '@/lib/mil'

const STATUS_OPTS = ['OPEN','IN_REVIEW','RESOLVED','CLOSED','WONT_FIX']
const SEV_OPTS = ['LOW','MEDIUM','HIGH','CRITICAL']
const DISC_OPTS = ['Architecture','Structure','MEP','Civil','Landscape','Heritage','Other']
const EMPTY = { projectId:'', title:'', description:'', discipline1:'', discipline2:'', severity:'MEDIUM', status:'OPEN', assignedTo:'', notes:'' }

const AI_SEV_COLORS = { CRITICAL: '#ff3b30', MAJOR: '#ff9500', MINOR: '#ffcc00', INFO: '#4a9eff' }

function AIClassifyButton({ clash, onClassified }) {
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const classify = async (e) => {
    e.stopPropagation()
    setLoading(true)
    try {
      const r = await fetch('/api/ai/clash-classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clashId: clash.id, title: clash.title, description: clash.description, discipline1: clash.discipline1, discipline2: clash.discipline2, severity: clash.severity, notes: clash.notes }),
      })
      const result = await r.json()
      onClassified(clash.id, result)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const sev = clash.aiSeverity
  const color = AI_SEV_COLORS[sev] || '#8a9bb0'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {sev ? (
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.5rem', color, background: `${color}20`, padding: '2px 6px', borderRadius: 2, letterSpacing: 0.5 }}>
            {sev}
          </span>
        ) : null}
        <button onClick={classify} disabled={loading} style={{ background: 'rgba(74,158,255,0.08)', border: '1px solid rgba(74,158,255,0.25)', borderRadius: 2, color: '#4a9eff', padding: '2px 7px', fontFamily: "'Orbitron', sans-serif", fontSize: '0.45rem', cursor: 'pointer', letterSpacing: 0.5, opacity: loading ? 0.6 : 1 }}>
          {loading ? '⟳' : '🤖'}
        </button>
        {clash.aiRecommendation && (
          <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }} style={{ background: 'none', border: 'none', color: '#6b8e23', cursor: 'pointer', fontSize: '0.6rem', padding: '2px 4px' }}>
            {expanded ? '▲' : '▼'}
          </button>
        )}
      </div>
      {expanded && clash.aiRecommendation && (
        <div style={{ fontSize: '0.7rem', color: '#8a9bb0', background: 'rgba(74,158,255,0.05)', border: '1px solid rgba(74,158,255,0.15)', borderRadius: 3, padding: '6px 8px', lineHeight: 1.5, maxWidth: 280 }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.4rem', color: '#4a9eff', letterSpacing: 1, marginBottom: 3 }}>AI RECOMMENDATION</div>
          {clash.aiRecommendation}
          {clash.aiCategory && <div style={{ marginTop: 4, fontFamily: "'Orbitron', sans-serif", fontSize: '0.4rem', color: '#6b8e23' }}>CATEGORY: {clash.aiCategory}</div>}
        </div>
      )}
    </div>
  )
}

export default function ClashPage() {
  const { data: clashes, loading, load, create, update, remove } = useCrud('/api/bim/clash')
  const [localClashes, setLocalClashes] = useState([])

  useEffect(() => { setLocalClashes(clashes) }, [clashes])

  const handleClassified = (clashId, result) => {
    setLocalClashes(prev => prev.map(c => c.id === clashId ? { ...c, aiSeverity: result.severity, aiCategory: result.category, aiRecommendation: result.recommendation } : c))
  }

  const { data: session } = useSession();
  const [liveEvents, setLiveEvents] = useState([]);
  const handleLiveEvent = (ev) => {
    setLiveEvents(prev => [...prev, { ...ev, id: Date.now() + Math.random() }]);
    if (ev.action === 'created' || ev.action === 'updated' || ev.action === 'deleted') { load(); }
  };
  const { isConnected, onlineUsers, emitCrud } = useSocket('clash', session?.user, handleLiveEvent);
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => { fetch('/api/projects').then(r=>r.json()).then(setProjects) }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setModal(true) }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) { const _updated = await update(editing.id, form); emitCrud('updated', _updated || form); }
      else { const _created = await create(form); emitCrud('created', _created || form); }
      setModal(false)
    } catch(err) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const displayClashes = localClashes.length > 0 ? localClashes : clashes
  const filtered = filterStatus ? displayClashes.filter(c => c.status === filterStatus) : displayClashes

  const cols = [
    { key: 'title', label: 'CLASH DESCRIPTION' },
    { key: 'project', label: 'PROJECT', render: (v) => v?.name || '—' },
    { key: 'discipline1', label: 'DISC 1' },
    { key: 'discipline2', label: 'DISC 2' },
    { key: 'severity', label: 'SEVERITY', render: (v) => <MilBadge status={v} /> },
    { key: 'status', label: 'STATUS', render: (v) => <MilBadge status={v} /> },
    { key: 'assignedTo', label: 'ASSIGNED TO' },
    { key: 'id', label: 'AI CLASSIFY', render: (v, row) => <AIClassifyButton clash={row} onClassified={handleClassified} /> },
    { key: 'detectedAt', label: 'DETECTED', render: (v) => v ? new Date(v).toLocaleDateString() : '—' }
  ]

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

      <PageHeader title="CLASH DETECTION REGISTER" subtitle="Track and resolve model clashes across all disciplines — AI-powered severity classification"
        actions={<MilBtn onClick={openNew}>+ LOG CLASH</MilBtn>} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Open" value={displayClashes.filter(c=>c.status==='OPEN').length} color="#8b1a1a" />
        <StatCard label="In Review" value={displayClashes.filter(c=>c.status==='IN_REVIEW').length} color="#8b6914" />
        <StatCard label="Resolved" value={displayClashes.filter(c=>c.status==='RESOLVED').length} color="#4a7c59" />
        <StatCard label="Critical" value={displayClashes.filter(c=>c.severity==='CRITICAL').length} color="#c0392b" />
        <StatCard label="AI Classified" value={displayClashes.filter(c=>c.aiSeverity).length} color="#4a9eff" />
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {['','OPEN','IN_REVIEW','RESOLVED','CLOSED'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{padding:'6px 14px',background:filterStatus===s?'#4a7c59':'transparent',border:'1px solid #2a3020',color:filterStatus===s?'#e8d5a3':'#6a7a60',borderRadius:4,cursor:'pointer',fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:12}}>
            {s || 'ALL'}
          </button>
        ))}
      </div>
      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={filtered} loading={loading} onEdit={openEdit} onDelete={async (id) => { await remove(id); emitCrud('deleted', { id }); }} emptyMsg="No clashes logged. Great coordination!" />
      </div>
      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT CLASH' : 'LOG NEW CLASH'} width={720}>
        <form onSubmit={handleSubmit}>
          <FormField label="Clash Title" required><MilInput value={form.title} onChange={f('title')} placeholder="e.g. HVAC vs Structural Beam — Level 5" required /></FormField>
          <FormField label="Project" required>
            <MilSelect value={form.projectId} onChange={f('projectId')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." required />
          </FormField>
          <FormField label="Description"><MilTextarea value={form.description} onChange={f('description')} placeholder="Detailed description of the clash..." rows={2} /></FormField>
          <FormRow>
            <FormField label="Discipline 1"><MilSelect value={form.discipline1} onChange={f('discipline1')} options={DISC_OPTS} placeholder="Select..." /></FormField>
            <FormField label="Discipline 2"><MilSelect value={form.discipline2} onChange={f('discipline2')} options={DISC_OPTS} placeholder="Select..." /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Severity"><MilSelect value={form.severity} onChange={f('severity')} options={SEV_OPTS} /></FormField>
            <FormField label="Status"><MilSelect value={form.status} onChange={f('status')} options={STATUS_OPTS} /></FormField>
          </FormRow>
          <FormField label="Assigned To"><MilInput value={form.assignedTo} onChange={f('assignedTo')} placeholder="Name of responsible person" /></FormField>
          <FormField label="Notes / Resolution"><MilTextarea value={form.notes} onChange={f('notes')} placeholder="Resolution notes, workaround..." rows={2} /></FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} />
        </form>
      </MilModal>
    </div>
  )
}