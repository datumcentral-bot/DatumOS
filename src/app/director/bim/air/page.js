'use client'
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilTextarea, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from '@/lib/mil'

const STATUS_OPTS = ['DRAFT','IN_REVIEW','APPROVED','ISSUED','SUPERSEDED']
const EMPTY = { projectId:'', title:'', version:'1.0', status:'DRAFT', assetOwner:'', assetType:'', operationalPurpose:'', dataRequirements:'', attributeRequirements:'', geometryRequirements:'', deliveryMilestones:'', issueDate:'' }
const SEC_EMPTY = { title:'', content:'', assetClass:'', priority:'MEDIUM', order:0 }

export default function AirPage() {
  const { data: airs, loading, create, update, remove } = useCrud('/api/bim/air')
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

  const openSections = async (air) => {
    setSelected(air)
    const d = await fetch(`/api/bim/air/${air.id}`).then(r=>r.json())
    setSections(d.sections || [])
  }

  const saveSec = async (e) => {
    e.preventDefault(); setSecSaving(true)
    try {
      const url = secEditing ? `/api/bim/air/${selected.id}/sections/${secEditing.id}` : `/api/bim/air/${selected.id}/sections`
      const method = secEditing ? 'PUT' : 'POST'
      await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify({...secForm, airId: selected.id}) })
      toast(secEditing ? 'Section updated' : 'Section added', 'success')
      setSecModal(false)
      const d = await fetch(`/api/bim/air/${selected.id}`).then(r=>r.json())
      setSections(d.sections || [])
    } catch(err) { toast(err.message, 'error') }
    finally { setSecSaving(false) }
  }

  const delSec = async (id) => {
    await fetch(`/api/bim/air/${selected.id}/sections/${id}`, { method:'DELETE' })
    toast('Section deleted', 'success')
    const d = await fetch(`/api/bim/air/${selected.id}`).then(r=>r.json())
    setSections(d.sections || [])
  }

  const sf = (k) => (v) => setSecForm(p => ({ ...p, [k]: v }))

  const cols = [
    { key: 'title', label: 'AIR TITLE' },
    { key: 'version', label: 'VER' },
    { key: 'project', label: 'PROJECT', render: (v) => v?.name || '—' },
    { key: 'assetOwner', label: 'ASSET OWNER' },
    { key: 'assetType', label: 'ASSET TYPE' },
    { key: 'status', label: 'STATUS', render: (v) => <MilBadge status={v} /> },
    { key: 'sections', label: 'SECTIONS', render: (v, row) => (
      <MilBtn size="sm" onClick={() => openSections(row)}>{row.sections?.length || 0} sections</MilBtn>
    )}
  ]

  const secCols = [
    { key: 'order', label: '#' },
    { key: 'title', label: 'SECTION TITLE' },
    { key: 'assetClass', label: 'ASSET CLASS' },
    { key: 'priority', label: 'PRIORITY', render: (v) => <MilBadge status={v} label={v} /> },
    { key: 'content', label: 'CONTENT', render: (v) => v ? v.substring(0,80)+'...' : '—' },
  ]

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh' }}>
      <ToastProvider />
      <PageHeader title="AIR" subtitle="Asset Information Requirements — operational data requirements for asset management"
        actions={<MilBtn onClick={openNew}>+ NEW AIR</MilBtn>} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total AIRs" value={airs.length} color="#4a7c59" />
        <StatCard label="Approved" value={airs.filter(i=>i.status==='APPROVED').length} color="#4a7c59" />
        <StatCard label="In Review" value={airs.filter(i=>i.status==='IN_REVIEW').length} color="#8b6914" />
        <StatCard label="Draft" value={airs.filter(i=>i.status==='DRAFT').length} color="#234b84" />
      </div>

      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={airs} loading={loading} onEdit={openEdit} onDelete={remove} emptyMsg="No AIRs found. Create your first Asset Information Requirements document." />
      </div>

      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT AIR' : 'NEW ASSET INFORMATION REQUIREMENTS'} width={900}>
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField label="AIR Title" required><MilInput value={form.title} onChange={f('title')} placeholder="e.g. Diriyah Gate AIR v1.0" required /></FormField>
            <FormField label="Version"><MilInput value={form.version} onChange={f('version')} placeholder="1.0" /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Project">
              <MilSelect value={form.projectId} onChange={f('projectId')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." />
            </FormField>
            <FormField label="Status"><MilSelect value={form.status} onChange={f('status')} options={STATUS_OPTS} /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Asset Owner"><MilInput value={form.assetOwner} onChange={f('assetOwner')} placeholder="e.g. Diriyah Gate Development Authority" /></FormField>
            <FormField label="Asset Type"><MilInput value={form.assetType} onChange={f('assetType')} placeholder="e.g. Commercial, Residential, Infrastructure" /></FormField>
          </FormRow>
          <FormField label="Operational Purpose"><MilTextarea value={form.operationalPurpose} onChange={f('operationalPurpose')} placeholder="How the asset will be operated and maintained..." rows={2} /></FormField>
          <FormRow>
            <FormField label="Data Requirements"><MilTextarea value={form.dataRequirements} onChange={f('dataRequirements')} placeholder="Required data attributes for asset management..." rows={2} /></FormField>
            <FormField label="Attribute Requirements"><MilTextarea value={form.attributeRequirements} onChange={f('attributeRequirements')} placeholder="Specific attribute fields required per asset type..." rows={2} /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Geometry Requirements"><MilTextarea value={form.geometryRequirements} onChange={f('geometryRequirements')} placeholder="LOD, LOA, spatial accuracy requirements..." rows={2} /></FormField>
            <FormField label="Delivery Milestones"><MilTextarea value={form.deliveryMilestones} onChange={f('deliveryMilestones')} placeholder="When asset information must be delivered..." rows={2} /></FormField>
          </FormRow>
          <FormField label="Issue Date"><MilInput type="date" value={form.issueDate} onChange={f('issueDate')} /></FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} submitLabel={editing ? 'UPDATE AIR' : 'CREATE AIR'} />
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
            emptyMsg="No sections yet — add your first AIR section" />
        </MilModal>
      )}

      <MilModal open={secModal} onClose={() => setSecModal(false)} title={secEditing ? 'EDIT SECTION' : 'ADD AIR SECTION'} width={700}>
        <form onSubmit={saveSec}>
          <FormRow>
            <FormField label="Section Title" required><MilInput value={secForm.title} onChange={sf('title')} placeholder="e.g. Mechanical Asset Data Requirements" required /></FormField>
            <FormField label="Asset Class"><MilInput value={secForm.assetClass} onChange={sf('assetClass')} placeholder="e.g. HVAC, Electrical, Plumbing" /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Priority"><MilSelect value={secForm.priority} onChange={sf('priority')} options={['LOW','MEDIUM','HIGH','CRITICAL']} /></FormField>
            <FormField label="Order"><MilInput type="number" value={secForm.order} onChange={sf('order')} /></FormField>
          </FormRow>
          <FormField label="Content" required><MilTextarea value={secForm.content} onChange={sf('content')} placeholder="Detailed asset information requirements for this section..." rows={6} /></FormField>
          <FormActions onCancel={() => setSecModal(false)} loading={secSaving} submitLabel={secEditing ? 'UPDATE' : 'ADD SECTION'} />
        </form>
      </MilModal>
    </div>
  )
}
