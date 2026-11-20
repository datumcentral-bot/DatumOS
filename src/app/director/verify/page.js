'use client'
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilTextarea, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from '@/lib/mil'

const CATEGORIES = ['Model Geometry','Naming Convention','LOD Compliance','Clash Detection','CDE Upload','File Format','Metadata','Coordination','ISO 19650','Quality Check','Other']
const STATUS_OPTS = ['PENDING','PASS','FAIL','NOT_APPLICABLE','IN_REVIEW']
const EMPTY = { projectId:'', category:'', checkItem:'', status:'PENDING', result:'', notes:'', checkedBy:'' }

export default function BimVerifyPage() {
  const { data, loading, create, update, remove } = useCrud('/api/bim/verify')
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterCat, setFilterCat] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

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

  const filtered = data.filter(d =>
    (!filterCat || d.category === filterCat) &&
    (!filterStatus || d.status === filterStatus)
  )

  const passRate = data.length ? Math.round(data.filter(d=>d.status==='PASS').length / data.length * 100) : 0

  const cols = [
    { key: 'category', label: 'CATEGORY' },
    { key: 'checkItem', label: 'CHECK ITEM' },
    { key: 'status', label: 'STATUS', render: (v) => <MilBadge status={v} /> },
    { key: 'result', label: 'RESULT' },
    { key: 'checkedBy', label: 'CHECKED BY' },
    { key: 'project', label: 'PROJECT', render: (v) => v?.name || '—' },
  ]

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh' }}>
      <ToastProvider />
      <PageHeader title="BIM VERIFY" subtitle="Model verification checklist — ISO 19650 compliance checks"
        actions={<MilBtn onClick={openNew}>+ ADD CHECK</MilBtn>} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total Checks" value={data.length} color="#4a7c59" />
        <StatCard label="Pass" value={data.filter(d=>d.status==='PASS').length} color="#4a7c59" />
        <StatCard label="Fail" value={data.filter(d=>d.status==='FAIL').length} color="#8b1a1a" />
        <StatCard label="Pass Rate" value={`${passRate}%`} color={passRate >= 80 ? '#4a7c59' : '#8b6914'} />
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{ background:'#1a1f14', border:'1px solid #2a3020', color:'#e8d5a3', padding:'6px 12px', borderRadius:4, fontFamily:'Rajdhani,sans-serif', fontSize:12 }}>
          <option value="">ALL CATEGORIES</option>
          {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ background:'#1a1f14', border:'1px solid #2a3020', color:'#e8d5a3', padding:'6px 12px', borderRadius:4, fontFamily:'Rajdhani,sans-serif', fontSize:12 }}>
          <option value="">ALL STATUSES</option>
          {STATUS_OPTS.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={filtered} loading={loading} onEdit={openEdit} onDelete={remove} emptyMsg="No verification checks. Add checks to track BIM model compliance." />
      </div>
      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT CHECK' : 'ADD VERIFICATION CHECK'} width={700}>
        <form onSubmit={handleSubmit}>
          <FormField label="Category" required>
            <MilSelect value={form.category} onChange={f('category')} options={CATEGORIES} placeholder="Select category..." required />
          </FormField>
          <FormField label="Check Item" required>
            <MilInput value={form.checkItem} onChange={f('checkItem')} placeholder="e.g. All walls named per ISO 19650 convention" required />
          </FormField>
          <FormRow>
            <FormField label="Status">
              <MilSelect value={form.status} onChange={f('status')} options={STATUS_OPTS} />
            </FormField>
            <FormField label="Checked By">
              <MilInput value={form.checkedBy} onChange={f('checkedBy')} placeholder="Name of checker" />
            </FormField>
          </FormRow>
          <FormField label="Result / Evidence">
            <MilTextarea value={form.result} onChange={f('result')} placeholder="Describe the result or evidence..." rows={2} />
          </FormField>
          <FormField label="Project">
            <MilSelect value={form.projectId} onChange={f('projectId')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project (optional)..." />
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
