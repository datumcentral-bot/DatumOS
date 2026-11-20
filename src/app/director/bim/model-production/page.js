'use client'
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilTextarea, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from '@/lib/mil'
import { FileUpload, FileDownloadBtn } from '@/components/FileUpload'

const STATUS_OPTS = ['NOT_STARTED','IN_PROGRESS','COMPLETE','ON_HOLD','CANCELLED']
const LOD_OPTS = ['LOD 100','LOD 200','LOD 300','LOD 350','LOD 400','LOD 500']
const FORMAT_OPTS = ['RVT','IFC','DWG','NWD','NWC','PDF','XLS','DOC']
const DISC_OPTS = ['Architecture','Structure','MEP','Civil','Landscape','Federated','Interior','Facade']
const EMPTY = { projectId:'', discipline:'Architecture', element:'', deliverable:'', format:'RVT', lodRequired:'LOD 300', assigneeId:'', plannedDate:'', actualDate:'', status:'NOT_STARTED', notes:'', fileUrl:'', fileName:'', fileSize:0, fileMime:'' }

export default function ModelProductionPage() {
  const { data: items, loading, create, update, remove } = useCrud('/api/bim/model-production')
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterDisc, setFilterDisc] = useState('ALL')

  useEffect(() => {
    Promise.all([
      fetch('/api/pm-projects').then(r=>r.json()).catch(()=>[]),
      fetch('/api/team').then(r=>r.json()).catch(()=>[])
    ]).then(([p, u]) => {
      setProjects(Array.isArray(p?.projects) ? p.projects : Array.isArray(p) ? p : [])
      setUsers(Array.isArray(u) ? u : [])
    })
  }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...EMPTY, ...row, plannedDate: row.plannedDate?.slice(0,10)||'', actualDate: row.actualDate?.slice(0,10)||'' }); setModal(true) }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  const handleFileChange = (fileData) => {
    setForm(p => ({ ...p, fileUrl: fileData.url || '', fileName: fileData.fileName || '', fileSize: fileData.fileSize || 0, fileMime: fileData.fileMime || '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) await update(editing.id, form)
      else await create(form)
      setModal(false)
      toast(editing ? 'Deliverable updated' : 'Deliverable added', 'success')
    } catch(err) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const filtered = filterDisc === 'ALL' ? items : items.filter(i => i.discipline === filterDisc)

  const cols = [
    { key: 'discipline', label: 'DISCIPLINE', render: (v) => <MilBadge status={v} label={v} /> },
    { key: 'element', label: 'ELEMENT' },
    { key: 'deliverable', label: 'DELIVERABLE' },
    { key: 'format', label: 'FORMAT' },
    { key: 'lodRequired', label: 'LOD' },
    { key: 'assignee', label: 'ASSIGNEE', render: (v) => v?.name || '—' },
    { key: 'plannedDate', label: 'PLANNED', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'actualDate', label: 'ACTUAL', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'status', label: 'STATUS', render: (v) => <MilBadge status={v} /> },
    { key: 'fileUrl', label: 'FILE', render: (v, row) => <FileDownloadBtn url={v} fileName={row.fileName} /> },
  ]

  const byDisc = DISC_OPTS.reduce((a,d) => ({ ...a, [d]: items.filter(i=>i.discipline===d).length }), {})

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh' }}>
      <ToastProvider />
      <PageHeader title="MODEL PRODUCTION DELIVERY TABLE" subtitle="BIM deliverable schedule — track model production by discipline, element, and LOD"
        actions={<MilBtn onClick={openNew}>+ ADD DELIVERABLE</MilBtn>} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total Deliverables" value={items.length} color="#4a7c59" />
        <StatCard label="In Progress" value={items.filter(i=>i.status==='IN_PROGRESS').length} color="#8b6914" />
        <StatCard label="Complete" value={items.filter(i=>i.status==='COMPLETE').length} color="#4a7c59" />
        <StatCard label="Not Started" value={items.filter(i=>i.status==='NOT_STARTED').length} color="#234b84" />
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {['ALL', ...DISC_OPTS].map(d => (
          <button key={d} onClick={() => setFilterDisc(d)} style={{ padding:'4px 12px', background: filterDisc===d ? '#4a7c59' : 'transparent', border:'1px solid #2a3020', color: filterDisc===d ? '#e8d5a3' : '#6a7a60', borderRadius:4, cursor:'pointer', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:12, letterSpacing:1 }}>
            {d}{d!=='ALL' && byDisc[d] ? ` (${byDisc[d]})` : ''}
          </button>
        ))}
      </div>

      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={filtered} loading={loading} onEdit={openEdit} onDelete={remove} emptyMsg="No deliverables found. Add your first model production entry." />
      </div>

      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT DELIVERABLE' : 'ADD MODEL PRODUCTION DELIVERABLE'} width={800}>
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField label="Discipline" required><MilSelect value={form.discipline} onChange={f('discipline')} options={DISC_OPTS} /></FormField>
            <FormField label="Element" required><MilInput value={form.element} onChange={f('element')} placeholder="e.g. Interior Walls, Columns, HVAC Ducts" required /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Deliverable" required><MilInput value={form.deliverable} onChange={f('deliverable')} placeholder="e.g. Architectural Model — Level 1-5" required /></FormField>
            <FormField label="Format"><MilSelect value={form.format} onChange={f('format')} options={FORMAT_OPTS} /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="LOD Required"><MilSelect value={form.lodRequired} onChange={f('lodRequired')} options={LOD_OPTS} /></FormField>
            <FormField label="Status"><MilSelect value={form.status} onChange={f('status')} options={STATUS_OPTS} /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Project">
              <MilSelect value={form.projectId} onChange={f('projectId')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." />
            </FormField>
            <FormField label="Assignee">
              <MilSelect value={form.assigneeId} onChange={f('assigneeId')} options={users.map(u=>({value:u.id,label:u.name}))} placeholder="Select assignee..." />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Planned Date"><MilInput type="date" value={form.plannedDate} onChange={f('plannedDate')} /></FormField>
            <FormField label="Actual Date"><MilInput type="date" value={form.actualDate} onChange={f('actualDate')} /></FormField>
          </FormRow>
          <FormField label="Notes"><MilTextarea value={form.notes} onChange={f('notes')} rows={2} /></FormField>
          <FormField label="Deliverable File Attachment">
            <FileUpload
              category="model-production"
              value={form.fileUrl ? { url: form.fileUrl, fileName: form.fileName, fileSize: form.fileSize } : null}
              onChange={handleFileChange}
              label="UPLOAD DELIVERABLE FILE (RVT, IFC, NWD, PDF...)"
            />
          </FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} submitLabel={editing ? 'UPDATE' : 'ADD DELIVERABLE'} />
        </form>
      </MilModal>
    </div>
  )
}
