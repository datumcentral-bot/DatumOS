'use client'
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilTextarea, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, ProgressBar, ToastProvider, toast, useCrud } from '@/lib/mil'

const STATUS_OPTS = ['PENDING','IN_PROGRESS','COMPLETE','OVERDUE','CANCELLED']
const EMPTY = { projectId:'', title:'', description:'', dueDate:'', completedAt:'', status:'PENDING', responsible:'', notes:'' }

export default function DeliveryMilestonesPage() {
  const { data: milestones, loading, create, update, remove } = useCrud('/api/bim/delivery-milestones')
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('ALL')

  useEffect(() => {
    fetch('/api/pm-projects').then(r=>r.json()).then(d => {
      setProjects(Array.isArray(d?.projects) ? d.projects : Array.isArray(d) ? d : [])
    })
  }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row, dueDate: row.dueDate?.slice(0,10)||'', completedAt: row.completedAt?.slice(0,10)||'' }); setModal(true) }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) await update(editing.id, form)
      else await create(form)
      setModal(false)
    } catch(err) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const filtered = filterStatus === 'ALL' ? milestones : milestones.filter(m => m.status === filterStatus)
  const overdue = milestones.filter(m => m.status !== 'COMPLETE' && m.status !== 'CANCELLED' && new Date(m.dueDate) < new Date())
  const complete = milestones.filter(m => m.status === 'COMPLETE')
  const completePct = milestones.length ? Math.round((complete.length / milestones.length) * 100) : 0

  const cols = [
    { key: 'title', label: 'MILESTONE' },
    { key: 'project', label: 'PROJECT', render: (v) => v?.name || '—' },
    { key: 'responsible', label: 'RESPONSIBLE' },
    { key: 'dueDate', label: 'DUE DATE', render: (v) => {
      if (!v) return '—'
      const d = new Date(v)
      const isOverdue = d < new Date()
      return <span style={{ color: isOverdue ? '#f44336' : '#e8d5a3', fontFamily:'Rajdhani,sans-serif' }}>{d.toLocaleDateString()}</span>
    }},
    { key: 'completedAt', label: 'COMPLETED', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'status', label: 'STATUS', render: (v) => <MilBadge status={v} /> },
  ]

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh' }}>
      <ToastProvider />
      <PageHeader title="INFORMATION DELIVERY MILESTONES" subtitle="BIM delivery milestone tracking — monitor key information delivery dates and status"
        actions={<MilBtn onClick={openNew}>+ ADD MILESTONE</MilBtn>} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total Milestones" value={milestones.length} color="#4a7c59" />
        <StatCard label="Complete" value={complete.length} color="#4a7c59" />
        <StatCard label="Overdue" value={overdue.length} color="#8b1a1a" />
        <StatCard label="Pending" value={milestones.filter(m=>m.status==='PENDING').length} color="#234b84" />
      </div>

      {milestones.length > 0 && (
        <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20, marginBottom:16 }}>
          <ProgressBar value={completePct} label={`Overall Delivery Progress — ${completePct}% complete`} color="#4a7c59" />
        </div>
      )}

      {/* Status filter */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {['ALL', ...STATUS_OPTS].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{ padding:'4px 12px', background: filterStatus===s ? '#4a7c59' : 'transparent', border:'1px solid #2a3020', color: filterStatus===s ? '#e8d5a3' : '#6a7a60', borderRadius:4, cursor:'pointer', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:12, letterSpacing:1 }}>
            {s}
          </button>
        ))}
      </div>

      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={filtered} loading={loading} onEdit={openEdit} onDelete={remove} emptyMsg="No delivery milestones found. Add your first information delivery milestone." />
      </div>

      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT MILESTONE' : 'ADD INFORMATION DELIVERY MILESTONE'} width={800}>
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField label="Milestone Title" required><MilInput value={form.title} onChange={f('title')} placeholder="e.g. Stage 2 — Architectural Model Delivery" required /></FormField>
            <FormField label="Status"><MilSelect value={form.status} onChange={f('status')} options={STATUS_OPTS} /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Project">
              <MilSelect value={form.projectId} onChange={f('projectId')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." />
            </FormField>
            <FormField label="Responsible"><MilInput value={form.responsible} onChange={f('responsible')} placeholder="Team or person responsible" /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Due Date" required><MilInput type="date" value={form.dueDate} onChange={f('dueDate')} required /></FormField>
            <FormField label="Completed Date"><MilInput type="date" value={form.completedAt} onChange={f('completedAt')} /></FormField>
          </FormRow>
          <FormField label="Description"><MilTextarea value={form.description} onChange={f('description')} placeholder="What information must be delivered at this milestone..." rows={3} /></FormField>
          <FormField label="Notes"><MilTextarea value={form.notes} onChange={f('notes')} rows={2} /></FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} submitLabel={editing ? 'UPDATE MILESTONE' : 'ADD MILESTONE'} />
        </form>
      </MilModal>
    </div>
  )
}
