'use client'
import { useSocket } from '@/lib/useSocket';
import LiveToast from '@/components/LiveToast';
import OnlineUsers from '@/components/OnlineUsers';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilTextarea, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from '@/lib/mil'

const STATUS_OPTS = ['DRAFT','IN_PROGRESS','SHARED','PUBLISHED','ARCHIVED']
const LOD_OPTS = ['LOD 100','LOD 200','LOD 300','LOD 350','LOD 400','LOD 500']
const FORMAT_OPTS = ['RVT','IFC','DWG','PDF','NWD','NWC','XLS','DOC']
const EMPTY = { projectId:'', title:'', version:'1.0', description:'', status:'DRAFT', issueDate:'', revisionDate:'' }
const DELIV_EMPTY = { title:'', discipline:'', format:'RVT', lodRequired:'LOD 300', status:'PENDING', plannedDate:'', actualDate:'', notes:'' }

export default function MidpPage() {
  const { data: midps, loading, load, create, update, remove } = useCrud('/api/bim/midp')
  

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
  const { isConnected, onlineUsers, emitCrud } = useSocket('midp', session?.user, handleLiveEvent);
const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState(null)
  const [deliverables, setDeliverables] = useState([])
  const [delivModal, setDelivModal] = useState(false)
  const [delivEditing, setDelivEditing] = useState(null)
  const [delivForm, setDelivForm] = useState(DELIV_EMPTY)
  const [delivSaving, setDelivSaving] = useState(false)

  useEffect(() => {
    fetch('/api/pm-projects').then(r=>r.json()).then(d => {
      setProjects(Array.isArray(d?.projects) ? d.projects : Array.isArray(d) ? d : [])
    })
  }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row, issueDate: row.issueDate?.slice(0,10)||'', revisionDate: row.revisionDate?.slice(0,10)||'' }); setModal(true) }
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

  const openDeliverables = async (item) => {
    setSelected(item)
    const d = await fetch(`/api/bim/midp/${item.id}`).then(r=>r.json())
    setDeliverables(d.deliverables || [])
  }

  const saveDeliv = async (e) => {
    e.preventDefault(); setDelivSaving(true)
    try {
      const url = delivEditing ? `/api/bim/midp/${selected.id}/deliverables/${delivEditing.id}` : `/api/bim/midp/${selected.id}/deliverables`
      const method = delivEditing ? 'PUT' : 'POST'
      await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify({...delivForm, midpId: selected.id}) })
      toast(delivEditing ? 'Deliverable updated' : 'Deliverable added', 'success')
      setDelivModal(false)
      const d = await fetch(`/api/bim/midp/${selected.id}`).then(r=>r.json())
      setDeliverables(d.deliverables || [])
    } catch(err) { toast(err.message, 'error') }
    finally { setDelivSaving(false) }
  }

  const delDeliv = async (id) => {
    await fetch(`/api/bim/midp/${selected.id}/deliverables/${id}`, { method:'DELETE' })
    toast('Deliverable deleted', 'success')
    const d = await fetch(`/api/bim/midp/${selected.id}`).then(r=>r.json())
    setDeliverables(d.deliverables || [])
  }

  const df = (k) => (v) => setDelivForm(p => ({ ...p, [k]: v }))

  const cols = [
    { key: 'title', label: 'MIDP TITLE' },
    { key: 'version', label: 'VER' },
    { key: 'project', label: 'PROJECT', render: (v) => v?.name || '—' },
    { key: 'status', label: 'STATUS', render: (v) => <MilBadge status={v} /> },
    { key: 'issueDate', label: 'ISSUE DATE', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'deliverables', label: 'DELIVERABLES', render: (v, row) => (
      <MilBtn size="sm" onClick={() => openDeliverables(row)}>{row.deliverables?.length || 0} items</MilBtn>
    )}
  ]

  const delivCols = [
    { key: 'title', label: 'DELIVERABLE' },
    { key: 'discipline', label: 'DISCIPLINE' },
    { key: 'format', label: 'FORMAT' },
    { key: 'lodRequired', label: 'LOD' },
    { key: 'status', label: 'STATUS', render: (v) => <MilBadge status={v} /> },
    { key: 'plannedDate', label: 'PLANNED', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
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

      <PageHeader title="MIDP" subtitle="Master Information Delivery Plan — ISO 19650 deliverable tracking per project"
        actions={<MilBtn onClick={openNew}>+ NEW MIDP</MilBtn>} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total MIDPs" value={midps.length} color="#4a7c59" />
        <StatCard label="In Progress" value={midps.filter(i=>i.status==='IN_PROGRESS').length} color="#8b6914" />
        <StatCard label="Published" value={midps.filter(i=>i.status==='PUBLISHED').length} color="#4a7c59" />
        <StatCard label="Total Deliverables" value={midps.reduce((a,i)=>a+(i.deliverables?.length||0),0)} color="#c8a84b" />
      </div>

      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={midps} loading={loading} onEdit={openEdit} onDelete={async (id) => { await remove(id); emitCrud('deleted', { id }); }} emptyMsg="No MIDPs found. Create your first Master Information Delivery Plan." />
      </div>

      {/* MIDP Form Modal */}
      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT MIDP' : 'NEW MASTER INFORMATION DELIVERY PLAN'} width={800}>
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField label="MIDP Title" required><MilInput value={form.title} onChange={f('title')} placeholder="e.g. Diriyah Gate MIDP v1.0" required /></FormField>
            <FormField label="Version"><MilInput value={form.version} onChange={f('version')} placeholder="1.0" /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Project">
              <MilSelect value={form.projectId} onChange={f('projectId')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." />
            </FormField>
            <FormField label="Status">
              <MilSelect value={form.status} onChange={f('status')} options={STATUS_OPTS} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Issue Date"><MilInput type="date" value={form.issueDate} onChange={f('issueDate')} /></FormField>
            <FormField label="Revision Date"><MilInput type="date" value={form.revisionDate} onChange={f('revisionDate')} /></FormField>
          </FormRow>
          <FormField label="Description"><MilTextarea value={form.description} onChange={f('description')} placeholder="Scope and purpose of this MIDP..." rows={3} /></FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} submitLabel={editing ? 'UPDATE MIDP' : 'CREATE MIDP'} />
        </form>
      </MilModal>

      {/* Deliverables Panel */}
      {selected && (
        <MilModal open={!!selected} onClose={() => setSelected(null)} title={`DELIVERABLES — ${selected.title}`} width={900}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <span style={{ fontFamily:'Rajdhani,sans-serif', color:'#6a7a60', fontSize:13 }}>{deliverables.length} deliverables in this MIDP</span>
            <MilBtn onClick={() => { setDelivEditing(null); setDelivForm(DELIV_EMPTY); setDelivModal(true) }}>+ ADD DELIVERABLE</MilBtn>
          </div>
          <MilTable columns={delivCols} data={deliverables}
            onEdit={(row) => { setDelivEditing(row); setDelivForm({...row, plannedDate:row.plannedDate?.slice(0,10)||'', actualDate:row.actualDate?.slice(0,10)||''}); setDelivModal(true) }}
            onDelete={delDeliv}
            emptyMsg="No deliverables yet — add your first deliverable" />
        </MilModal>
      )}

      {/* Deliverable Form Modal */}
      <MilModal open={delivModal} onClose={() => setDelivModal(false)} title={delivEditing ? 'EDIT DELIVERABLE' : 'ADD DELIVERABLE'} width={700}>
        <form onSubmit={saveDeliv}>
          <FormRow>
            <FormField label="Deliverable Title" required><MilInput value={delivForm.title} onChange={df('title')} placeholder="e.g. Architectural Model — Level 1" required /></FormField>
            <FormField label="Discipline"><MilInput value={delivForm.discipline} onChange={df('discipline')} placeholder="Architecture, Structure, MEP..." /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Format"><MilSelect value={delivForm.format} onChange={df('format')} options={FORMAT_OPTS} /></FormField>
            <FormField label="LOD Required"><MilSelect value={delivForm.lodRequired} onChange={df('lodRequired')} options={LOD_OPTS} /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Status"><MilSelect value={delivForm.status} onChange={df('status')} options={['PENDING','IN_PROGRESS','SHARED','PUBLISHED','ARCHIVED']} /></FormField>
            <FormField label="Planned Date"><MilInput type="date" value={delivForm.plannedDate} onChange={df('plannedDate')} /></FormField>
          </FormRow>
          <FormField label="Actual Date"><MilInput type="date" value={delivForm.actualDate} onChange={df('actualDate')} /></FormField>
          <FormField label="Notes"><MilTextarea value={delivForm.notes} onChange={df('notes')} rows={2} /></FormField>
          <FormActions onCancel={() => setDelivModal(false)} loading={delivSaving} submitLabel={delivEditing ? 'UPDATE' : 'ADD DELIVERABLE'} />
        </form>
      </MilModal>
    </div>
  )
}
