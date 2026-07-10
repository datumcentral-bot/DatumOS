'use client'
import { useSocket } from '@/lib/useSocket';
import LiveToast from '@/components/LiveToast';
import OnlineUsers from '@/components/OnlineUsers';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilTextarea, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud, ProgressBar } from '@/lib/mil'

const CLAUSES = [
  '5.1 Organizational information requirements','5.2 Project information requirements','5.3 Asset information requirements',
  '6.1 Appointment','6.2 Information management','6.3 Mobilization','6.4 Collaborative production',
  '6.5 Information model delivery','6.6 Close-out','7.1 BIM Execution Plan','7.2 MIDP','7.3 TIDP',
  '8.1 CDE','8.2 Naming conventions','8.3 File formats','8.4 Metadata','9.1 Clash detection','9.2 Quality review'
]
const STATUS_OPTS = ['NOT_STARTED','IN_PROGRESS','COMPLETE','NOT_APPLICABLE','NEEDS_REVIEW']
const EMPTY = { projectId:'', clause:'', title:'', description:'', status:'NOT_STARTED', evidence:'', responsible:'', dueDate:'', notes:'' }

export default function Iso19650Page() {
  const { data, loading, create, update, remove } = useCrud('/api/iso19650')
  

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
  const { isConnected, onlineUsers, emitCrud } = useSocket('iso19650', session?.user, handleLiveEvent);
const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => { fetch('/api/projects').then(r=>r.json()).then(setProjects) }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row, dueDate: row.dueDate ? row.dueDate.split('T')[0] : '' }); setModal(true) }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null }
      if (editing) { const _updated = await update(editing.id, payload); emitCrud('updated', _updated || form); }
      else { const _created = await create(payload); emitCrud('created', _created || form); }
      setModal(false)
    } catch(err) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const filtered = filterStatus ? data.filter(d => d.status === filterStatus) : data
  const compliant = data.filter(d=>d.status==='COMPLETE').length
  const complianceRate = data.length ? Math.round(compliant / data.length * 100) : 0

  const cols = [
    { key: 'clause', label: 'CLAUSE' },
    { key: 'title', label: 'REQUIREMENT' },
    { key: 'status', label: 'STATUS', render: (v) => <MilBadge status={v} /> },
    { key: 'responsible', label: 'RESPONSIBLE' },
    { key: 'dueDate', label: 'DUE DATE', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'evidence', label: 'EVIDENCE' },
    { key: 'project', label: 'PROJECT', render: (v) => v?.name || '—' },
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

      <PageHeader title="ISO 19650 COMPLIANCE" subtitle="Track compliance with ISO 19650 BIM information management standard"
        actions={<MilBtn onClick={openNew}>+ ADD REQUIREMENT</MilBtn>} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total Requirements" value={data.length} color="#4a7c59" />
        <StatCard label="Compliant" value={compliant} color="#4a7c59" />
        <StatCard label="In Progress" value={data.filter(d=>d.status==='IN_PROGRESS').length} color="#8b6914" />
        <StatCard label="Compliance Rate" value={`${complianceRate}%`} color={complianceRate >= 80 ? '#4a7c59' : '#8b1a1a'} />
      </div>
      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:16, marginBottom:16 }}>
        <div style={{ fontFamily:'Rajdhani,sans-serif', color:'#8a9a80', fontSize:12, marginBottom:8 }}>OVERALL COMPLIANCE</div>
        <ProgressBar value={complianceRate} max={100} color={complianceRate >= 80 ? '#4a7c59' : '#8b6914'} label={`${complianceRate}%`} />
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {['','NOT_STARTED','IN_PROGRESS','COMPLETE','NEEDS_REVIEW'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{ padding:'6px 14px', background:filterStatus===s?'#4a7c59':'transparent', border:'1px solid #2a3020', color:filterStatus===s?'#e8d5a3':'#6a7a60', borderRadius:4, cursor:'pointer', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:12 }}>
            {s || 'ALL'}
          </button>
        ))}
      </div>
      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={filtered} loading={loading} onEdit={openEdit} onDelete={async (id) => { await remove(id); emitCrud('deleted', { id }); }} emptyMsg="No ISO 19650 requirements tracked. Add requirements to monitor compliance." />
      </div>
      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT REQUIREMENT' : 'ADD ISO 19650 REQUIREMENT'} width={720}>
        <form onSubmit={handleSubmit}>
          <FormField label="Clause" required>
            <MilSelect value={form.clause} onChange={f('clause')} options={CLAUSES} placeholder="Select clause..." required />
          </FormField>
          <FormField label="Requirement Title" required>
            <MilInput value={form.title} onChange={f('title')} placeholder="e.g. BIM Execution Plan approved by all parties" required />
          </FormField>
          <FormField label="Description">
            <MilTextarea value={form.description} onChange={f('description')} placeholder="Describe the requirement..." rows={2} />
          </FormField>
          <FormRow>
            <FormField label="Status">
              <MilSelect value={form.status} onChange={f('status')} options={STATUS_OPTS} />
            </FormField>
            <FormField label="Responsible">
              <MilInput value={form.responsible} onChange={f('responsible')} placeholder="Responsible person/team" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Due Date">
              <MilInput type="date" value={form.dueDate} onChange={f('dueDate')} />
            </FormField>
            <FormField label="Project">
              <MilSelect value={form.projectId} onChange={f('projectId')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." />
            </FormField>
          </FormRow>
          <FormField label="Evidence / Reference">
            <MilTextarea value={form.evidence} onChange={f('evidence')} placeholder="Document reference, link, or evidence description..." rows={2} />
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
