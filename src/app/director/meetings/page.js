'use client'
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBtn, MilInput, MilTextarea, MilSelect, MilBadge, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from '@/lib/mil'

const STATUS_OPTS = ['SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED']
const EMPTY = { title:'', date:'', attendees:'', agenda:'', minutes:'', actionItems:'', projectId:'', status:'SCHEDULED' }

export default function BimMeetingsPage() {
  const { data, loading, create, update, remove } = useCrud('/api/bim-meetings')
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch('/api/projects').then(r=>r.json()).then(setProjects) }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row, date: row.date ? String(row.date).slice(0,10) : '' }); setModal(true) }
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
    { key: 'title', label: 'MEETING TITLE' },
    { key: 'date', label: 'DATE', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'status', label: 'STATUS', render: (v) => <MilBadge status={v} /> },
    { key: 'attendees', label: 'ATTENDEES', render: (v) => v?.substring(0,40) || '—' },
    { key: 'projectId', label: 'PROJECT', render: (v) => projects.find(p=>p.id===v)?.name || '—' },
  ]

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh' }}>
      <ToastProvider />
      <PageHeader title="BIM MEETINGS" subtitle="BIM coordination meeting minutes, agendas, and action items"
        actions={<MilBtn onClick={openNew}>+ NEW MEETING</MilBtn>} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total" value={data.length} color="#4a7c59" />
        <StatCard label="Scheduled" value={data.filter(d=>d.status==='SCHEDULED').length} color="#c8a84b" />
        <StatCard label="Completed" value={data.filter(d=>d.status==='COMPLETED').length} color="#2ecc71" />
        <StatCard label="Cancelled" value={data.filter(d=>d.status==='CANCELLED').length} color="#e74c3c" />
      </div>
      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={data} loading={loading} onEdit={openEdit} onDelete={remove} emptyMsg="No meetings scheduled." />
      </div>
      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT MEETING' : 'NEW BIM MEETING'} width={720}>
        <form onSubmit={handleSubmit}>
          <FormField label="Meeting Title" required><MilInput value={form.title} onChange={f('title')} placeholder="BIM Coordination Meeting #12" required /></FormField>
          <FormRow>
            <FormField label="Date"><input type="date" value={form.date} onChange={e=>f('date')(e.target.value)} style={{ width:'100%', background:'#1a1f14', border:'1px solid #2a3020', borderRadius:4, padding:'8px 12px', color:'#e8d5a3', fontFamily:'Rajdhani,sans-serif', fontSize:14 }} /></FormField>
            <FormField label="Status"><MilSelect value={form.status} onChange={f('status')} options={STATUS_OPTS} /></FormField>
          </FormRow>
          <FormField label="Project"><MilSelect value={form.projectId} onChange={f('projectId')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." /></FormField>
          <FormField label="Attendees"><MilInput value={form.attendees} onChange={f('attendees')} placeholder="Ahmed Hassan, Omar Khalid, Fatima..." /></FormField>
          <FormField label="Agenda"><MilTextarea value={form.agenda} onChange={f('agenda')} placeholder="1. Clash review\n2. CDE status\n3. MIDP update..." rows={3} /></FormField>
          <FormField label="Minutes"><MilTextarea value={form.minutes} onChange={f('minutes')} placeholder="Meeting minutes..." rows={3} /></FormField>
          <FormField label="Action Items"><MilTextarea value={form.actionItems} onChange={f('actionItems')} placeholder="1. Ahmed to resolve clash #5 by Friday\n2. Omar to update MIDP..." rows={2} /></FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} submitLabel={editing ? 'UPDATE' : 'CREATE MEETING'} />
        </form>
      </MilModal>
    </div>
  )
}
