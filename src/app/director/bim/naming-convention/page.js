'use client'
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilTextarea, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from '@/lib/mil'

const CATEGORIES = ['Model Files','Drawing Sheets','Documents','Zones','Levels','Grids','Families','Sheets','Views','Schedules','Other']
const EMPTY = { projectId:'', name:'', pattern:'', description:'', fields:'', example:'', category:'Model Files' }

export default function NamingConventionsPage() {
  const { data, loading, create, update, remove } = useCrud('/api/bim/naming')
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

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

  const cols = [
    { key: 'name', label: 'CONVENTION NAME' },
    { key: 'category', label: 'CATEGORY', render: (v) => <MilBadge status={v} label={v} /> },
    { key: 'pattern', label: 'PATTERN', render: (v) => <code style={{ fontFamily:'monospace', background:'#1a2010', padding:'2px 6px', borderRadius:3, color:'#c8a84b', fontSize:12 }}>{v}</code> },
    { key: 'example', label: 'EXAMPLE', render: (v) => <span style={{ color:'#8acaa0', fontFamily:'monospace', fontSize:12 }}>{v}</span> },
    { key: 'description', label: 'DESCRIPTION' },
    { key: 'project', label: 'PROJECT', render: (v) => v?.name || '—' },
  ]

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh' }}>
      <ToastProvider />
      <PageHeader title="NAMING CONVENTIONS" subtitle="ISO 19650-compliant file and element naming standards"
        actions={<MilBtn onClick={openNew}>+ NEW CONVENTION</MilBtn>} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total Conventions" value={data.length} color="#4a7c59" />
        <StatCard label="Categories" value={[...new Set(data.map(d=>d.category))].length} color="#8b6914" />
        <StatCard label="Projects Covered" value={[...new Set(data.filter(d=>d.projectId).map(d=>d.projectId))].length} color="#4a7c59" />
      </div>
      <MilTable columns={cols} data={data} loading={loading}
        onEdit={openEdit} onDelete={(row) => { if(confirm('Delete this convention?')) remove(row.id) }} />

      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT CONVENTION' : 'NEW NAMING CONVENTION'}>
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField label="CONVENTION NAME *">
              <MilInput value={form.name} onChange={f('name')} placeholder="e.g. Model File Naming" required />
            </FormField>
            <FormField label="CATEGORY">
              <MilSelect value={form.category} onChange={f('category')} options={CATEGORIES.map(c=>({value:c,label:c}))} />
            </FormField>
          </FormRow>
          <FormField label="PATTERN *">
            <MilInput value={form.pattern} onChange={f('pattern')} placeholder="e.g. {ProjectCode}-{Discipline}-{Zone}-{Level}-{Type}" required />
          </FormField>
          <FormField label="EXAMPLE">
            <MilInput value={form.example} onChange={f('example')} placeholder="e.g. PROJ001-AR-Z01-L02-M3D" />
          </FormField>
          <FormField label="FIELDS / SEGMENTS">
            <MilInput value={form.fields} onChange={f('fields')} placeholder="e.g. ProjectCode, Discipline, Zone, Level, Type" />
          </FormField>
          <FormField label="DESCRIPTION">
            <MilTextarea value={form.description} onChange={f('description')} rows={2} />
          </FormField>
          <FormField label="PROJECT">
            <MilSelect value={form.projectId} onChange={f('projectId')} options={[{value:'',label:'— Global Convention —'},...projects.map(p=>({value:p.id,label:p.name}))]} />
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
