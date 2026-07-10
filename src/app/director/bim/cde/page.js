'use client'
import { useSocket } from '@/lib/useSocket';
import LiveToast from '@/components/LiveToast';
import OnlineUsers from '@/components/OnlineUsers';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from '@/lib/mil'
import { FileUpload, FileDownloadBtn } from '@/components/FileUpload'

const STATUS_OPTS = ['WIP','SHARED','PUBLISHED','ARCHIVED']
const DISC_OPTS = ['Architecture','Structure','MEP','Civil','Landscape','Federated','Survey','Heritage','Other']
const ACCESS_OPTS = ['PRIVATE','PROJECT','ALL_TEAMS']
const APPROVAL_OPTS = ['PENDING','IN_REVIEW','APPROVED','REJECTED']
const EMPTY = { projectId:'', name:'', docCode:'', revision:'P01', status:'WIP', discipline:'', fileType:'', owner:'', access:'PRIVATE', approvalStatus:'PENDING', fileUrl:'', fileName:'', fileSize:0, fileMime:'' }

export default function CdePage() {
  const { data: docs, loading, load, create, update, remove } = useCrud('/api/bim/cde')
  

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
  const { isConnected, onlineUsers, emitCrud } = useSocket('cde', session?.user, handleLiveEvent);
const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [previewDoc, setPreviewDoc] = useState(null)

  useEffect(() => { fetch('/api/projects').then(r=>r.json()).then(d => setProjects(Array.isArray(d) ? d : [])).catch(()=>{}) }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...EMPTY, ...row }); setModal(true) }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  const handleFileChange = (fileData) => {
    setForm(p => ({ ...p, fileUrl: fileData.url, fileName: fileData.fileName, fileSize: fileData.fileSize, fileMime: fileData.fileMime }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) { const _updated = await update(editing.id, form); emitCrud('updated', _updated || form); }
      else { const _created = await create(form); emitCrud('created', _created || form); }
      setModal(false)
      toast(editing ? 'Document updated' : 'Document created', 'success')
    } catch(err) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const filtered = filterStatus ? docs.filter(d => d.status === filterStatus) : docs

  const statusFlow = { WIP: 'SHARED', SHARED: 'PUBLISHED', PUBLISHED: 'ARCHIVED' }
  const advanceStatus = async (doc) => {
    const next = statusFlow[doc.status]
    if (!next) return
    try { const _updated = await update(doc.id, { status: next }); emitCrud('updated', _updated || form); toast(`Status advanced to ${next}`, 'success') }
    catch(e) { toast(e.message, 'error') }
  }

  const cols = [
    { key: 'name', label: 'DOCUMENT NAME', render: (v) => <span style={{fontFamily:'monospace',fontSize:12}}>{v}</span> },
    { key: 'docCode', label: 'CODE' },
    { key: 'revision', label: 'REV' },
    { key: 'discipline', label: 'DISCIPLINE' },
    { key: 'status', label: 'CDE STATUS', render: (v, row) => (
      <div style={{display:'flex',gap:6,alignItems:'center'}}>
        <MilBadge status={v} />
        {statusFlow[v] && <button onClick={() => advanceStatus(row)} style={{padding:'2px 8px',background:'#234b84',border:'none',color:'#e8d5a3',borderRadius:3,cursor:'pointer',fontSize:10,fontFamily:'Rajdhani,sans-serif',fontWeight:700}}>→{statusFlow[v]}</button>}
      </div>
    )},
    { key: 'fileUrl', label: 'FILE', render: (v, row) => <FileDownloadBtn url={v} fileName={row.fileName} /> },
    { key: 'access', label: 'ACCESS', render: (v) => <MilBadge status={v} label={v} /> },
    { key: 'approvalStatus', label: 'APPROVAL', render: (v) => <MilBadge status={v} /> },
    { key: 'owner', label: 'OWNER' }
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

      <PageHeader title="COMMON DATA ENVIRONMENT" subtitle="CDE document management — WIP → Shared → Published → Archived"
        actions={<><MilBtn onClick={openNew}>+ NEW DOCUMENT</MilBtn></>} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {['WIP','SHARED','PUBLISHED','ARCHIVED'].map(s => (
          <StatCard key={s} label={s} value={docs.filter(d=>d.status===s).length} color={s==='PUBLISHED'?'#4a7c59':s==='SHARED'?'#8b6914':s==='ARCHIVED'?'#3a3a3a':'#234b84'} />
        ))}
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {['','WIP','SHARED','PUBLISHED','ARCHIVED'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{padding:'6px 14px',background:filterStatus===s?'#4a7c59':'transparent',border:'1px solid #2a3020',color:filterStatus===s?'#e8d5a3':'#6a7a60',borderRadius:4,cursor:'pointer',fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:12}}>
            {s || 'ALL'}
          </button>
        ))}
      </div>
      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={filtered} loading={loading} onEdit={openEdit} onDelete={async (id) => { await remove(id); emitCrud('deleted', { id }); }} emptyMsg="No CDE documents found." />
      </div>

      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT CDE DOCUMENT' : 'NEW CDE DOCUMENT'} width={760}>
        <form onSubmit={handleSubmit}>
          <FormField label="Document Name" required><MilInput value={form.name} onChange={f('name')} placeholder="e.g. ARITC-ARC-ZZ-XX-M3-A-0001" required /></FormField>
          <FormRow>
            <FormField label="Project" required>
              <MilSelect value={form.projectId} onChange={f('projectId')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." required />
            </FormField>
            <FormField label="Document Code"><MilInput value={form.docCode} onChange={f('docCode')} placeholder="ARC-0001" /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Revision"><MilInput value={form.revision} onChange={f('revision')} placeholder="P01" /></FormField>
            <FormField label="Discipline"><MilSelect value={form.discipline} onChange={f('discipline')} options={DISC_OPTS} placeholder="Select..." /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="CDE Status"><MilSelect value={form.status} onChange={f('status')} options={STATUS_OPTS} /></FormField>
            <FormField label="File Type"><MilInput value={form.fileType} onChange={f('fileType')} placeholder="RVT, PDF, NWD..." /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Access Level"><MilSelect value={form.access} onChange={f('access')} options={ACCESS_OPTS} /></FormField>
            <FormField label="Approval Status"><MilSelect value={form.approvalStatus} onChange={f('approvalStatus')} options={APPROVAL_OPTS} /></FormField>
          </FormRow>
          <FormField label="Owner / Responsible"><MilInput value={form.owner} onChange={f('owner')} placeholder="Name of responsible person" /></FormField>
          <FormField label="File Attachment">
            <FileUpload
              category="cde"
              value={form.fileUrl ? { url: form.fileUrl, fileName: form.fileName, fileSize: form.fileSize } : null}
              onChange={handleFileChange}
              label="UPLOAD CDE FILE (PDF, IFC, RVT, DWG...)"
            />
          </FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} />
        </form>
      </MilModal>
    </div>
  )
}
