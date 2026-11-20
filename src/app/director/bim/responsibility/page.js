'use client'
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilTextarea, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from '@/lib/mil'

const DISCIPLINES = ['Architecture','Structure','MEP','Civil','Landscape','Heritage','Federated','All']
const ROLES = ['BIM Manager','BIM Coordinator','BIM Modeller','Project Manager','Design Lead','QA/QC','Client','Contractor']
const EMPTY = { projectId:'', discipline:'Architecture', deliverable:'', role:'BIM Coordinator', responsible:'', accountable:'', consulted:'', informed:'', notes:'' }

export default function ResponsibilityMatrixPage() {
  const { data, loading, create, update, remove } = useCrud('/api/bim/responsibility')
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterDiscipline, setFilterDiscipline] = useState('')

  useEffect(() => { fetch('/api/projects').then(r=>r.json()).then(d => setProjects(Array.isArray(d) ? d : [])).catch(()=>{}) }, [])

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

  const filtered = filterDiscipline ? data.filter(d => d.discipline === filterDiscipline) : data

  const cols = [
    { key: 'discipline', label: 'DISCIPLINE', render: (v) => <MilBadge status={v} label={v} /> },
    { key: 'deliverable', label: 'DELIVERABLE' },
    { key: 'role', label: 'ROLE' },
    { key: 'responsible', label: 'R — RESPONSIBLE' },
    { key: 'accountable', label: 'A — ACCOUNTABLE' },
    { key: 'consulted', label: 'C — CONSULTED' },
    { key: 'informed', label: 'I — INFORMED' },
    { key: 'project', label: 'PROJECT', render: (v) => v?.name || '—' },
  ]

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh' }}>
      <ToastProvider />
      <PageHeader title="RESPONSIBILITY MATRIX" subtitle="RACI-style BIM responsibility assignments per discipline and deliverable"
        actions={<MilBtn onClick={openNew}>+ NEW ENTRY</MilBtn>} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total Entries" value={data.length} color="#4a7c59" />
        <StatCard label="Disciplines" value={[...new Set(data.map(d=>d.discipline))].length} color="#8b6914" />
        <StatCard label="Deliverables" value={[...new Set(data.map(d=>d.deliverable))].length} color="#4a7c59" />
        <StatCard label="Roles" value={[...new Set(data.map(d=>d.role))].length} color="#8b6914" />
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {['', ...DISCIPLINES].map(d => (
          <button key={d} onClick={() => setFilterDiscipline(d)}
            style={{ padding:'6px 14px', background:filterDiscipline===d?'#4a7c59':'transparent', border:'1px solid #2a3020', color:filterDiscipline===d?'#e8d5a3':'#6a7a60', borderRadius:4, cursor:'pointer', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:12 }}>
            {d || 'ALL'}
          </button>
        ))}
      </div>
      <MilTable columns={cols} data={filtered} loading={loading}
        onEdit={openEdit} onDelete={(row) => { if(confirm('Delete this entry?')) remove(row.id) }} />

      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT ENTRY' : 'NEW RESPONSIBILITY ENTRY'}>
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField label="PROJECT">
              <MilSelect value={form.projectId} onChange={f('projectId')} options={[{value:'',label:'— No Project —'},...projects.map(p=>({value:p.id,label:p.name}))]} />
            </FormField>
            <FormField label="DISCIPLINE *">
              <MilSelect value={form.discipline} onChange={f('discipline')} options={DISCIPLINES.map(d=>({value:d,label:d}))} required />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="DELIVERABLE *">
              <MilInput value={form.deliverable} onChange={f('deliverable')} placeholder="e.g. Architectural Model" required />
            </FormField>
            <FormField label="ROLE">
              <MilSelect value={form.role} onChange={f('role')} options={ROLES.map(r=>({value:r,label:r}))} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="RESPONSIBLE (R)">
              <MilInput value={form.responsible} onChange={f('responsible')} placeholder="Who does the work" />
            </FormField>
            <FormField label="ACCOUNTABLE (A)">
              <MilInput value={form.accountable} onChange={f('accountable')} placeholder="Who is answerable" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="CONSULTED (C)">
              <MilInput value={form.consulted} onChange={f('consulted')} placeholder="Who provides input" />
            </FormField>
            <FormField label="INFORMED (I)">
              <MilInput value={form.informed} onChange={f('informed')} placeholder="Who is kept updated" />
            </FormField>
          </FormRow>
          <FormField label="NOTES">
            <MilTextarea value={form.notes} onChange={f('notes')} rows={2} />
          </FormField>
          <FormActions>
            <MilBtn type="button" variant="ghost" onClick={() => setModal(false)}>CANCEL</MilBtn>
            {editing && <MilBtn type="button" variant="danger" onClick={() => { remove(editing.id); setModal(false) }}>DELETE</MilBtn>}
            <MilBtn type="submit" loading={saving}>{editing ? 'UPDATE' : 'CREATE'}</MilBtn>
          </FormActions>
        </form>
      </MilModal>
    </div>
  )
}
