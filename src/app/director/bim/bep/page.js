'use client'
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilTextarea, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, MilTabs, ToastProvider, toast, useCrud } from '@/lib/mil'

const STATUS_OPTS = ['DRAFT','IN_REVIEW','APPROVED','SUPERSEDED']
const EMPTY = { projectId:'', title:'', version:'1.0', status:'DRAFT', projectInfo:'', objectives:'', standards:'', software:'', coordination:'', qualityPlan:'', deliveryPlan:'' }

export default function BepPage() {
  const { data: beps, loading, create, update, remove } = useCrud('/api/bim/bep')
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('list')

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
    { key: 'title', label: 'BEP TITLE' },
    { key: 'project', label: 'PROJECT', render: (v) => v?.name || '—' },
    { key: 'version', label: 'VERSION' },
    { key: 'status', label: 'STATUS', render: (v) => <MilBadge status={v} /> },
    { key: 'createdAt', label: 'CREATED', render: (v) => v ? new Date(v).toLocaleDateString() : '—' }
  ]

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh' }}>
      <ToastProvider />
      <PageHeader title="BIM EXECUTION PLANS" subtitle="ISO 19650 BEP management — create, edit, and track BEPs across all projects"
        actions={<MilBtn onClick={openNew}>+ NEW BEP</MilBtn>} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total BEPs" value={beps.length} color="#4a7c59" />
        <StatCard label="Approved" value={beps.filter(b=>b.status==='APPROVED').length} color="#4a7c59" />
        <StatCard label="In Review" value={beps.filter(b=>b.status==='IN_REVIEW').length} color="#8b6914" />
        <StatCard label="Draft" value={beps.filter(b=>b.status==='DRAFT').length} color="#234b84" />
      </div>
      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={beps} loading={loading} onEdit={openEdit} onDelete={remove} emptyMsg="No BEPs found. Create your first BEP." />
      </div>
      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT BEP' : 'NEW BIM EXECUTION PLAN'} width={800}>
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField label="BEP Title" required><MilInput value={form.title} onChange={f('title')} placeholder="e.g. BEP — Al Reem Tower Complex" required /></FormField>
            <FormField label="Project" required>
              <MilSelect value={form.projectId} onChange={f('projectId')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." required />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Version"><MilInput value={form.version} onChange={f('version')} placeholder="1.0" /></FormField>
            <FormField label="Status"><MilSelect value={form.status} onChange={f('status')} options={STATUS_OPTS} /></FormField>
          </FormRow>
          <FormField label="Project Information"><MilTextarea value={form.projectInfo} onChange={f('projectInfo')} placeholder="Project description, location, scope..." rows={3} /></FormField>
          <FormField label="BIM Objectives"><MilTextarea value={form.objectives} onChange={f('objectives')} placeholder="Key BIM objectives for this project..." rows={3} /></FormField>
          <FormRow>
            <FormField label="Standards & Codes"><MilTextarea value={form.standards} onChange={f('standards')} placeholder="ISO 19650, BS EN ISO 19650..." rows={2} /></FormField>
            <FormField label="Software & Tools"><MilTextarea value={form.software} onChange={f('software')} placeholder="Revit 2024, Navisworks, BIM 360..." rows={2} /></FormField>
          </FormRow>
          <FormField label="Coordination Strategy"><MilTextarea value={form.coordination} onChange={f('coordination')} placeholder="Clash detection frequency, federated model schedule..." rows={2} /></FormField>
          <FormRow>
            <FormField label="Quality Plan"><MilTextarea value={form.qualityPlan} onChange={f('qualityPlan')} placeholder="Model audit schedule, QA checklist..." rows={2} /></FormField>
            <FormField label="Delivery Plan"><MilTextarea value={form.deliveryPlan} onChange={f('deliveryPlan')} placeholder="Stage deliverables, milestones..." rows={2} /></FormField>
          </FormRow>
          <FormActions onCancel={() => setModal(false)} loading={saving} />
        </form>
      </MilModal>
    </div>
  )
}
