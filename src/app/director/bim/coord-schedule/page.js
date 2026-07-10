'use client'
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilTextarea, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from '@/lib/mil'

const STATUS_OPTS = ['SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED','POSTPONED']
const EMPTY = { projectId:'', title:'', meetingDate:'', location:'', attendees:'', agenda:'', minutes:'', actionItems:'', status:'SCHEDULED' }

export default function CoordSchedulePage() {
  const { data: meetings, loading, create, update, remove } = useCrud('/api/bim/coord-schedule')
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [detailItem, setDetailItem] = useState(null)

  useEffect(() => {
    fetch('/api/pm-projects').then(r=>r.json()).then(d => {
      setProjects(Array.isArray(d?.projects) ? d.projects : Array.isArray(d) ? d : [])
    })
  }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row, meetingDate: row.meetingDate?.slice(0,16)||'' }); setModal(true) }
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
    { key: 'project', label: 'PROJECT', render: (v) => v?.name || '—' },
    { key: 'meetingDate', label: 'DATE', render: (v) => v ? new Date(v).toLocaleString() : '—' },
    { key: 'location', label: 'LOCATION' },
    { key: 'status', label: 'STATUS', render: (v) => <MilBadge status={v} /> },
    { key: 'detail', label: '', render: (v, row) => (
      <MilBtn size="sm" variant="secondary" onClick={() => setDetailItem(row)}>VIEW</MilBtn>
    )}
  ]

  const upcoming = meetings.filter(m => m.status === 'SCHEDULED' && new Date(m.meetingDate) > new Date())
  const completed = meetings.filter(m => m.status === 'COMPLETED')

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh' }}>
      <ToastProvider />
      <PageHeader title="BIM COORDINATION SCHEDULE" subtitle="Coordination meeting schedule — agenda, attendees, minutes, and action items"
        actions={<MilBtn onClick={openNew}>+ SCHEDULE MEETING</MilBtn>} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total Meetings" value={meetings.length} color="#4a7c59" />
        <StatCard label="Upcoming" value={upcoming.length} color="#8b6914" />
        <StatCard label="Completed" value={completed.length} color="#4a7c59" />
        <StatCard label="Cancelled" value={meetings.filter(m=>m.status==='CANCELLED').length} color="#8b1a1a" />
      </div>

      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={meetings} loading={loading} onEdit={openEdit} onDelete={remove} emptyMsg="No coordination meetings scheduled. Schedule your first BIM coordination meeting." />
      </div>

      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT COORDINATION MEETING' : 'SCHEDULE BIM COORDINATION MEETING'} width={800}>
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField label="Meeting Title" required><MilInput value={form.title} onChange={f('title')} placeholder="e.g. Weekly BIM Coordination — Tower A" required /></FormField>
            <FormField label="Status"><MilSelect value={form.status} onChange={f('status')} options={STATUS_OPTS} /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Project">
              <MilSelect value={form.projectId} onChange={f('projectId')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." />
            </FormField>
            <FormField label="Meeting Date & Time" required><MilInput type="datetime-local" value={form.meetingDate} onChange={f('meetingDate')} required /></FormField>
          </FormRow>
          <FormField label="Location / Platform"><MilInput value={form.location} onChange={f('location')} placeholder="e.g. BIM 360 Meeting Room / Teams / Site Office" /></FormField>
          <FormField label="Attendees"><MilTextarea value={form.attendees} onChange={f('attendees')} placeholder="List attendees (name, role, company)..." rows={3} /></FormField>
          <FormField label="Agenda"><MilTextarea value={form.agenda} onChange={f('agenda')} placeholder="Meeting agenda items..." rows={4} /></FormField>
          <FormField label="Minutes"><MilTextarea value={form.minutes} onChange={f('minutes')} placeholder="Meeting minutes (fill after meeting)..." rows={4} /></FormField>
          <FormField label="Action Items"><MilTextarea value={form.actionItems} onChange={f('actionItems')} placeholder="Action items with owners and due dates..." rows={3} /></FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} submitLabel={editing ? 'UPDATE MEETING' : 'SCHEDULE MEETING'} />
        </form>
      </MilModal>

      {detailItem && (
        <MilModal open={!!detailItem} onClose={() => setDetailItem(null)} title={detailItem.title} width={800}>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div><span style={{ fontFamily:'Rajdhani,sans-serif', color:'#6a7a60', fontSize:12, fontWeight:700 }}>DATE</span><p style={{ fontFamily:'Rajdhani,sans-serif', color:'#e8d5a3', margin:'4px 0' }}>{detailItem.meetingDate ? new Date(detailItem.meetingDate).toLocaleString() : '—'}</p></div>
              <div><span style={{ fontFamily:'Rajdhani,sans-serif', color:'#6a7a60', fontSize:12, fontWeight:700 }}>LOCATION</span><p style={{ fontFamily:'Rajdhani,sans-serif', color:'#e8d5a3', margin:'4px 0' }}>{detailItem.location || '—'}</p></div>
            </div>
            {detailItem.attendees && <div><span style={{ fontFamily:'Rajdhani,sans-serif', color:'#6a7a60', fontSize:12, fontWeight:700 }}>ATTENDEES</span><p style={{ fontFamily:'Rajdhani,sans-serif', color:'#e8d5a3', margin:'4px 0', whiteSpace:'pre-wrap' }}>{detailItem.attendees}</p></div>}
            {detailItem.agenda && <div><span style={{ fontFamily:'Rajdhani,sans-serif', color:'#6a7a60', fontSize:12, fontWeight:700 }}>AGENDA</span><p style={{ fontFamily:'Rajdhani,sans-serif', color:'#e8d5a3', margin:'4px 0', whiteSpace:'pre-wrap' }}>{detailItem.agenda}</p></div>}
            {detailItem.minutes && <div><span style={{ fontFamily:'Rajdhani,sans-serif', color:'#6a7a60', fontSize:12, fontWeight:700 }}>MINUTES</span><p style={{ fontFamily:'Rajdhani,sans-serif', color:'#e8d5a3', margin:'4px 0', whiteSpace:'pre-wrap' }}>{detailItem.minutes}</p></div>}
            {detailItem.actionItems && <div><span style={{ fontFamily:'Rajdhani,sans-serif', color:'#6a7a60', fontSize:12, fontWeight:700 }}>ACTION ITEMS</span><p style={{ fontFamily:'Rajdhani,sans-serif', color:'#e8d5a3', margin:'4px 0', whiteSpace:'pre-wrap' }}>{detailItem.actionItems}</p></div>}
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <MilBtn variant="secondary" onClick={() => { setDetailItem(null); openEdit(detailItem) }}>EDIT</MilBtn>
              <MilBtn variant="secondary" onClick={() => setDetailItem(null)}>CLOSE</MilBtn>
            </div>
          </div>
        </MilModal>
      )}
    </div>
  )
}
