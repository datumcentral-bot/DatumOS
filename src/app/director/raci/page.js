'use client'
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBtn, MilInput, MilSelect, MilBadge, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from '@/lib/mil'

const ROLE_OPTS = ['R','A','C','I']
const EMPTY = { task:'', person:'', role:'R', projectId:'', notes:'' }

export default function RaciPage() {
  const { data, loading, create, update, remove } = useCrud('/api/raci')
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch('/api/projects').then(r=>r.json()).then(setProjects) }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setModal(true) }
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

  const roleColor = { R:'#c0392b', A:'#e67e22', C:'#2980b9', I:'#27ae60' }

  const cols = [
    { key: 'task', label: 'TASK / ACTIVITY' },
    { key: 'person', label: 'PERSON / ROLE' },
    { key: 'role', label: 'RACI', render: (v) => <span style={{ fontFamily:'Orbitron,sans-serif', fontSize:13, fontWeight:700, color: roleColor[v] || '#c8a84b', background: (roleColor[v] || '#c8a84b') + '22', padding:'2px 10px', borderRadius:4 }}>{v}</span> },
    { key: 'project', label: 'PROJECT', render: (v,row) => projects.find(p=>p.id===row.projectId)?.name || '—' },
    { key: 'notes', label: 'NOTES', render: (v) => v?.substring(0,50) || '—' },
  ]

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh' }}>
      <ToastProvider />
      <PageHeader title="RACI MATRIX" subtitle="Responsibility assignment matrix — R=Responsible, A=Accountable, C=Consulted, I=Informed"
        actions={<MilBtn onClick={openNew}>+ ADD ENTRY</MilBtn>} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {['R','A','C','I'].map(r => (
          <StatCard key={r} label={r==='R'?'Responsible':r==='A'?'Accountable':r==='C'?'Consulted':'Informed'} value={data.filter(d=>d.role===r).length} color={roleColor[r]} />
        ))}
      </div>
      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={data} loading={loading} onEdit={openEdit} onDelete={remove} emptyMsg="No RACI entries. Add responsibilities." />
      </div>
      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT RACI ENTRY' : 'NEW RACI ENTRY'} width={600}>
        <form onSubmit={handleSubmit}>
          <FormField label="Task / Activity" required><MilInput value={form.task} onChange={f('task')} placeholder="e.g. BIM Model Review" required /></FormField>
          <FormRow>
            <FormField label="Person / Role" required><MilInput value={form.person} onChange={f('person')} placeholder="e.g. BIM Manager" required /></FormField>
            <FormField label="RACI Role" required><MilSelect value={form.role} onChange={f('role')} options={ROLE_OPTS} required /></FormField>
          </FormRow>
          <FormField label="Project">
            <MilSelect value={form.projectId} onChange={f('projectId')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." />
          </FormField>
          <FormField label="Notes"><MilInput value={form.notes} onChange={f('notes')} placeholder="Additional notes..." /></FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} submitLabel={editing ? 'UPDATE' : 'ADD ENTRY'} />
        </form>
      </MilModal>
    </div>
  )
}
