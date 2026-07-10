'use client'
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBtn, MilInput, MilTextarea, MilSelect, MilBadge, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from '@/lib/mil'

const STATUS_OPTS = ['ACTIVE','INACTIVE','PENDING']
const EMPTY = { name:'', organization:'', role:'', contactEmail:'', contactPhone:'', projectId:'', notes:'', status:'ACTIVE' }

export default function ExternalStakeholdersPage() {
  const { data, loading, create, update, remove } = useCrud('/api/external-stakeholders')
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

  const cols = [
    { key: 'name', label: 'NAME' },
    { key: 'organization', label: 'ORGANIZATION' },
    { key: 'role', label: 'ROLE' },
    { key: 'contactEmail', label: 'EMAIL' },
    { key: 'status', label: 'STATUS', render: (v) => <MilBadge status={v} /> },
    { key: 'projectId', label: 'PROJECT', render: (v) => projects.find(p=>p.id===v)?.name || '—' },
  ]

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh' }}>
      <ToastProvider />
      <PageHeader title="EXTERNAL STAKEHOLDERS" subtitle="External parties, consultants, and stakeholder contacts"
        actions={<MilBtn onClick={openNew}>+ ADD STAKEHOLDER</MilBtn>} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total" value={data.length} color="#4a7c59" />
        <StatCard label="Active" value={data.filter(d=>d.status==='ACTIVE').length} color="#2ecc71" />
        <StatCard label="Pending" value={data.filter(d=>d.status==='PENDING').length} color="#c8a84b" />
      </div>
      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={data} loading={loading} onEdit={openEdit} onDelete={remove} emptyMsg="No external stakeholders registered." />
      </div>
      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT STAKEHOLDER' : 'NEW EXTERNAL STAKEHOLDER'} width={600}>
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField label="Name" required><MilInput value={form.name} onChange={f('name')} placeholder="John Smith" required /></FormField>
            <FormField label="Organization"><MilInput value={form.organization} onChange={f('organization')} placeholder="BAGC Engineering" /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Role"><MilInput value={form.role} onChange={f('role')} placeholder="Client Representative" /></FormField>
            <FormField label="Status"><MilSelect value={form.status} onChange={f('status')} options={STATUS_OPTS} /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Email"><MilInput value={form.contactEmail} onChange={f('contactEmail')} placeholder="john@bagc.ae" /></FormField>
            <FormField label="Phone"><MilInput value={form.contactPhone} onChange={f('contactPhone')} placeholder="+971 50 123 4567" /></FormField>
          </FormRow>
          <FormField label="Project"><MilSelect value={form.projectId} onChange={f('projectId')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." /></FormField>
          <FormField label="Notes"><MilTextarea value={form.notes} onChange={f('notes')} placeholder="Additional notes..." rows={2} /></FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} submitLabel={editing ? 'UPDATE' : 'ADD STAKEHOLDER'} />
        </form>
      </MilModal>
    </div>
  )
}
