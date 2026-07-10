'use client'
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilTextarea, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from '@/lib/mil'

const STATUS_OPTS = ['DRAFT','IN_REVIEW','APPROVED','ISSUED','SUPERSEDED']
const EMPTY = { projectId:'', title:'', version:'1.0', status:'DRAFT', appointingParty:'', projectDescription:'', bimPurpose:'', deliverables:'', standards:'', softwareRequirements:'', coordinationRequirements:'', securityRequirements:'', issueDate:'' }
const SEC_EMPTY = { title:'', content:'', category:'GENERAL', order:0 }

export default function EirPage() {
  const { data: eirs, loading, create, update, remove } = useCrud('/api/bim/eir')
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState(null)
  const [sections, setSections] = useState([])
  const [secModal, setSecModal] = useState(false)
  const [secEditing, setSecEditing] = useState(null)
  const [secForm, setSecForm] = useState(SEC_EMPTY)
  const [secSaving, setSecSaving] = useState(false)

  useEffect(() => {
    fetch('/api/pm-projects').then(r=>r.json()).then(d => {
      setProjects(Array.isArray(d?.projects) ? d.projects : Array.isArray(d) ? d : [])
    })
  }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row, issueDate: row.issueDate?.slice(0,10)||'' }); setModal(true) }
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

  const openSections = async (eir) => {
    setSelected(eir)
    const d = await fetch(`/api/bim/eir/${eir.id}`).then(r=>r.json())
    setSections(d.sections || [])
  }

  const saveSec = async (e) => {
    e.preventDefault(); setSecSaving(true)
    try {
      const url = secEditing ? `/api/bim/eir/${selected.id}/sections/${secEditing.id}` : `/api/bim/eir/${selected.id}/sections`
      const method = secEditing ? 'PUT' : 'POST'
      await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify({...secForm, eirId: selected.id}) })
      toast(secEditing ? 'Section updated' : 'Section added', 'success')
      setSecModal(false)
      const d = await fetch(`/api/bim/eir/${selected.id}`).then(r=>r.json())
      setSections(d.sections || [])
    } catch(err) { toast(err.message, 'error') }
    finally { setSecSaving(false) }
  }

  const delSec = async (id) => {
    await fetch(`/api/bim/eir/${selected.id}/sections/${id}`, { method:'DELETE' })
    toast('Section deleted', 'success')
    const d = await fetch(`/api/bim/eir/${selected.id}`).then(r=>r.json())
    setSections(d.sections || [])
  }

  const sf = (k) => (v) => setSecForm(p => ({ ...p, [k]: v }))

  const cols = [
    { key: 'title', label: 'EIR TITLE' },
    { key: 'version', label: 'VER' },
    { key: 'project', label: 'PROJECT', render: (v) => v?.name || '—' },
    { key: 'appointingParty', label: 'APPOINTING PARTY' },
    { key: 'status', label: 'STATUS', render: (v) => <MilBadge status={v} /> },
    { key: 'issueDate', label: 'ISSUE DATE', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'sections', label: 'SECTIONS', render: (v, row) => (
      <MilBtn size="sm" onClick={() => openSections(row)}>{row.sections?.length || 0} sections</MilBtn>
    )}
  ]

  const secCols = [
    { key: 'order', label: '#' },
    { key: 'title', label: 'SECTION TITLE' },
    { key: 'category', label: 'CATEGORY', render: (v) => <MilBadge status={v} label={v} /> },
    { key: 'content', label: 'CONTENT', render: (v) => v ? v.substring(0,80)+'...' : '—' },
  ]

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh' }}>
      <ToastProvider />
      <PageHeader title="EIR" subtitle="Employer's Information Requirements — ISO 19650 information requirements from the appointing party"
        actions={<MilBtn onClick={openNew}>+ NEW EIR</MilBtn>} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total EIRs" value={eirs.length} color="#4a7c59" />
        <StatCard label="Approved" value={eirs.filter(i=>i.status==='APPROVED').length} color="#4a7c59" />
        <StatCard label="In Review" value={eirs.filter(i=>i.status==='IN_REVIEW').length} color="#8b6914" />
        <StatCard label="Draft" value={eirs.filter(i=>i.status==='DRAFT').length} color="#234b84" />
      </div>

      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={eirs} loading={loading} onEdit={openEdit} onDelete={remove} emptyMsg="No EIRs found. Create your first Employer's Information Requirements document." />
      </div>

      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT EIR' : "NEW EMPLOYER'S INFORMATION REQUIREMENTS"} width={900}>
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField label="EIR Title" required><MilInput value={form.title} onChange={f('title')} placeholder="e.g. Diriyah Gate EIR v1.0" required /></FormField>
            <FormField label="Version"><MilInput value={form.version} onChange={f('version')} placeholder="1.0" /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Project">
              <MilSelect value={form.projectId} onChange={f('projectId')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." />
            </FormField>
            <FormField label="Status"><MilSelect value={form.status} onChange={f('status')} options={STATUS_OPTS} /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Appointing Party"><MilInput value={form.appointingParty} onChange={f('appointingParty')} placeholder="e.g. Diriyah Gate Development Authority" /></FormField>
            <FormField label="Issue Date"><MilInput type="date" value={form.issueDate} onChange={f('issueDate')} /></FormField>
          </FormRow>
          <FormField label="Project Description"><MilTextarea value={form.projectDescription} onChange={f('projectDescription')} placeholder="Brief description of the project..." rows={2} /></FormField>
          <FormField label="BIM Purpose & Objectives"><MilTextarea value={form.bimPurpose} onChange={f('bimPurpose')} placeholder="Key BIM uses and objectives required..." rows={2} /></FormField>
          <FormRow>
            <FormField label="Deliverables Required"><MilTextarea value={form.deliverables} onChange={f('deliverables')} placeholder="List of required information deliverables..." rows={2} /></FormField>
            <FormField label="Standards & Codes"><MilTextarea value={form.standards} onChange={f('standards')} placeholder="ISO 19650, BS EN ISO 19650, local standards..." rows={2} /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Software Requirements"><MilTextarea value={form.softwareRequirements} onChange={f('softwareRequirements')} placeholder="Required software, file formats, versions..." rows={2} /></FormField>
            <FormField label="Coordination Requirements"><MilTextarea value={form.coordinationRequirements} onChange={f('coordinationRequirements')} placeholder="Clash detection, federated model requirements..." rows={2} /></FormField>
          </FormRow>
          <FormField label="Security Requirements"><MilTextarea value={form.securityRequirements} onChange={f('securityRequirements')} placeholder="Data security, access control requirements..." rows={2} /></FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} submitLabel={editing ? 'UPDATE EIR' : 'CREATE EIR'} />
        </form>
      </MilModal>

      {selected && (
        <MilModal open={!!selected} onClose={() => setSelected(null)} title={`SECTIONS — ${selected.title}`} width={900}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <span style={{ fontFamily:'Rajdhani,sans-serif', color:'#6a7a60', fontSize:13 }}>{sections.length} sections</span>
            <MilBtn onClick={() => { setSecEditing(null); setSecForm(SEC_EMPTY); setSecModal(true) }}>+ ADD SECTION</MilBtn>
          </div>
          <MilTable columns={secCols} data={sections}
            onEdit={(row) => { setSecEditing(row); setSecForm({...row}); setSecModal(true) }}
            onDelete={delSec}
            emptyMsg="No sections yet — add your first EIR section" />
        </MilModal>
      )}

      <MilModal open={secModal} onClose={() => setSecModal(false)} title={secEditing ? 'EDIT SECTION' : 'ADD EIR SECTION'} width={700}>
        <form onSubmit={saveSec}>
          <FormRow>
            <FormField label="Section Title" required><MilInput value={secForm.title} onChange={sf('title')} placeholder="e.g. Information Delivery Milestones" required /></FormField>
            <FormField label="Category">
              <MilSelect value={secForm.category} onChange={sf('category')} options={['GENERAL','TECHNICAL','COMMERCIAL','LEGAL','SECURITY','COORDINATION']} />
            </FormField>
          </FormRow>
          <FormField label="Order"><MilInput type="number" value={secForm.order} onChange={sf('order')} /></FormField>
          <FormField label="Content" required><MilTextarea value={secForm.content} onChange={sf('content')} placeholder="Section content and requirements..." rows={6} /></FormField>
          <FormActions onCancel={() => setSecModal(false)} loading={secSaving} submitLabel={secEditing ? 'UPDATE' : 'ADD SECTION'} />
        </form>
      </MilModal>
    </div>
  )
}
