'use client'
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBtn, MilInput, MilTextarea, MilSelect, MilBadge, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from '@/lib/mil'

const STATUS_OPTS = ['PENDING','IN_PROGRESS','COMPLETED','BLOCKED']
const EMPTY = { task:'', responsible:'', dueDate:'', status:'PENDING', projectId:'', notes:'' }

export default function MobilizationPage() {
  const { data, loading, create, update, remove } = useCrud('/api/mobilization')
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch('/api/projects').then(r=>r.json()).then(setProjects) }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row, dueDate: row.dueDate ? String(row.dueDate).slice(0,10) : '' }); setModal(true) }
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

  const cols = [
    { key: 'task', label: 'MOBILIZATION TASK' },
    { key: 'responsible', label: 'RESPONSIBLE' },
    { key: 'dueDate', label: 'DUE DATE', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'status', label: 'STATUS', render: (v) => <MilBadge status={v} /> },
    { key: 'projectId', label: 'PROJECT', render: (v) => projects.find(p=>p.id===v)?.name || '—' },
  ]

  const pct = data.length ? Math.round(data.filter(d=>d.status==='COMPLETED').length / data.length * 100) : 0

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh' }}>
      <ToastProvider />
      <PageHeader title="MOBILIZATION CHECKLIST" subtitle="Project mobilization tasks, responsibilities, and status tracking"
        actions={<MilBtn onClick={openNew}>+ ADD TASK</MilBtn>} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total Tasks" value={data.length} color="#4a7c59" />
        <StatCard label="Completed" value={data.filter(d=>d.status==='COMPLETED').length} color="#2ecc71" />
        <StatCard label="In Progress" value={data.filter(d=>d.status==='IN_PROGRESS').length} color="#c8a84b" />
        <StatCard label="Progress" value={`${pct}%`} color="#3498db" />
      </div>
      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={data} loading={loading} onEdit={openEdit} onDelete={remove} emptyMsg="No mobilization tasks. Add checklist items." />
      </div>
      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT TASK' : 'NEW MOBILIZATION TASK'} width={600}>
        <form onSubmit={handleSubmit}>
          <FormField label="Task" required><MilInput value={form.task} onChange={f('task')} placeholder="e.g. Set up BIM collaboration platform" required /></FormField>
          <FormRow>
            <FormField label="Responsible"><MilInput value={form.responsible} onChange={f('responsible')} placeholder="Ahmed Hassan" /></FormField>
            <FormField label="Status"><MilSelect value={form.status} onChange={f('status')} options={STATUS_OPTS} /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Due Date"><input type="date" value={form.dueDate} onChange={e=>f('dueDate')(e.target.value)} style={{ width:'100%', background:'#1a1f14', border:'1px solid #2a3020', borderRadius:4, padding:'8px 12px', color:'#e8d5a3', fontFamily:'Rajdhani,sans-serif', fontSize:14 }} /></FormField>
            <FormField label="Project"><MilSelect value={form.projectId} onChange={f('projectId')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." /></FormField>
          </FormRow>
          <FormField label="Notes"><MilTextarea value={form.notes} onChange={f('notes')} placeholder="Additional notes..." rows={2} /></FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} submitLabel={editing ? 'UPDATE' : 'ADD TASK'} />
        </form>
      </MilModal>
    </div>
  )
}
