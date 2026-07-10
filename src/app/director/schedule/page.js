'use client'
import { useSocket } from '@/lib/useSocket';
import LiveToast from '@/components/LiveToast';
import OnlineUsers from '@/components/OnlineUsers';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilTextarea, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from '@/lib/mil'

const STATUS_OPTS = ['PLANNED','IN_PROGRESS','COMPLETE','DELAYED','CANCELLED']
const EMPTY = { projectId:'', title:'', description:'', startDate:'', endDate:'', status:'PLANNED', responsible:'', deliverable:'', notes:'' }

export default function DeliverySchedulePage() {
  const { data, loading, create, update, remove } = useCrud('/api/delivery-schedule')
  

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
  const { isConnected, onlineUsers, emitCrud } = useSocket('delivery', session?.user, handleLiveEvent);
const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => { fetch('/api/projects').then(r=>r.json()).then(setProjects) }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row, startDate: row.startDate ? row.startDate.split('T')[0] : '', endDate: row.endDate ? row.endDate.split('T')[0] : '' }); setModal(true) }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, startDate: form.startDate ? new Date(form.startDate).toISOString() : null, endDate: form.endDate ? new Date(form.endDate).toISOString() : null }
      if (editing) { const _updated = await update(editing.id, payload); emitCrud('updated', _updated || form); }
      else { const _created = await create(payload); emitCrud('created', _created || form); }
      setModal(false)
    } catch(err) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const filtered = filterStatus ? data.filter(d => d.status === filterStatus) : data

  const isOverdue = (d) => d.endDate && new Date(d.endDate) < new Date() && d.status !== 'COMPLETE'

  const cols = [
    { key: 'title', label: 'DELIVERABLE TITLE' },
    { key: 'project', label: 'PROJECT', render: (v) => v?.name || '—' },
    { key: 'startDate', label: 'START', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'endDate', label: 'DUE DATE', render: (v, row) => v ? <span style={{ color: isOverdue(row) ? '#c0392b' : '#e8d5a3' }}>{new Date(v).toLocaleDateString()}{isOverdue(row) ? ' ⚠' : ''}</span> : '—' },
    { key: 'status', label: 'STATUS', render: (v) => <MilBadge status={v} /> },
    { key: 'responsible', label: 'RESPONSIBLE' },
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

      <PageHeader title="DELIVERY SCHEDULE" subtitle="Project delivery timeline — track deliverables and milestones"
        actions={<MilBtn onClick={openNew}>+ ADD DELIVERABLE</MilBtn>} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total" value={data.length} color="#4a7c59" />
        <StatCard label="In Progress" value={data.filter(d=>d.status==='IN_PROGRESS').length} color="#8b6914" />
        <StatCard label="Complete" value={data.filter(d=>d.status==='COMPLETE').length} color="#4a7c59" />
        <StatCard label="Overdue" value={data.filter(isOverdue).length} color="#8b1a1a" />
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {['','PLANNED','IN_PROGRESS','COMPLETE','DELAYED'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{ padding:'6px 14px', background:filterStatus===s?'#4a7c59':'transparent', border:'1px solid #2a3020', color:filterStatus===s?'#e8d5a3':'#6a7a60', borderRadius:4, cursor:'pointer', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:12 }}>
            {s || 'ALL'}
          </button>
        ))}
      </div>
      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={filtered} loading={loading} onEdit={openEdit} onDelete={async (id) => { await remove(id); emitCrud('deleted', { id }); }} emptyMsg="No delivery items. Add deliverables to track project schedule." />
      </div>
      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT DELIVERABLE' : 'ADD DELIVERABLE'} width={700}>
        <form onSubmit={handleSubmit}>
          <FormField label="Title" required>
            <MilInput value={form.title} onChange={f('title')} placeholder="e.g. Architectural BIM Model — Level 3" required />
          </FormField>
          <FormField label="Project">
            <MilSelect value={form.projectId} onChange={f('projectId')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." />
          </FormField>
          <FormField label="Description">
            <MilTextarea value={form.description} onChange={f('description')} placeholder="Describe the deliverable..." rows={2} />
          </FormField>
          <FormRow>
            <FormField label="Start Date">
              <MilInput type="date" value={form.startDate} onChange={f('startDate')} />
            </FormField>
            <FormField label="Due Date">
              <MilInput type="date" value={form.endDate} onChange={f('endDate')} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Status">
              <MilSelect value={form.status} onChange={f('status')} options={STATUS_OPTS} />
            </FormField>
            <FormField label="Responsible">
              <MilInput value={form.responsible} onChange={f('responsible')} placeholder="Responsible person/team" />
            </FormField>
          </FormRow>
          <FormField label="Deliverable Format">
            <MilInput value={form.deliverable} onChange={f('deliverable')} placeholder="e.g. RVT, IFC, PDF, DWG" />
          </FormField>
          <FormField label="Notes">
            <MilTextarea value={form.notes} onChange={f('notes')} placeholder="Additional notes..." rows={2} />
          </FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} />
        </form>
      </MilModal>
    </div>
  )
}
