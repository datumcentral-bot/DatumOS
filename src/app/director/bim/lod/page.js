'use client'
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from '@/lib/mil'

const LOD_OPTS = ['LOD 100','LOD 200','LOD 300','LOD 350','LOD 400','LOD 500']
const LOA_OPTS = ['LOA 10','LOA 20','LOA 30','LOA 40','LOA 50']
const DISC_OPTS = ['Architecture','Structure','MEP','Civil','Landscape','Interior','Facade','Other']
const EMPTY = { projectId:'', element:'', discipline:'', lodLevel:'LOD 200', loaLevel:'', purpose:'', notes:'' }

export default function LodPage() {
  const { data: specs, loading, create, update, remove } = useCrud('/api/bim/lod')
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterDisc, setFilterDisc] = useState('')

  useEffect(() => { fetch('/api/pm-projects').then(r=>r.json()).then(d => setProjects(Array.isArray(d?.projects) ? d.projects : [])) }, [])

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

  const filtered = filterDisc ? specs.filter(s => s.discipline === filterDisc) : specs
  const lodColor = { 'LOD 100':'#3a3a3a','LOD 200':'#234b84','LOD 300':'#5a3e2b','LOD 350':'#8b6914','LOD 400':'#4a7c59','LOD 500':'#2b4a5a' }

  const cols = [
    { key: 'element', label: 'ELEMENT' },
    { key: 'discipline', label: 'DISCIPLINE' },
    { key: 'lodLevel', label: 'LOD LEVEL', render: (v) => <span style={{background:lodColor[v]||'#3a3a3a',color:'#e8d5a3',padding:'2px 8px',borderRadius:3,fontSize:11,fontFamily:'Orbitron,sans-serif',fontWeight:700}}>{v}</span> },
    { key: 'loaLevel', label: 'LOA LEVEL' },
    { key: 'purpose', label: 'PURPOSE' },
    { key: 'notes', label: 'NOTES', render: (v) => v ? v.substring(0,40)+(v.length>40?'...':'') : '—' }
  ]

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh' }}>
      <ToastProvider />
      <PageHeader title="LOD SPECIFICATION MATRIX" subtitle="Level of Development requirements per element and discipline"
        actions={<MilBtn onClick={openNew}>+ ADD LOD SPEC</MilBtn>} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12, marginBottom:24 }}>
        {Object.entries(lodColor).map(([lod, color]) => (
          <StatCard key={lod} label={lod} value={specs.filter(s=>s.lodLevel===lod).length} color={color} />
        ))}
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {['', ...DISC_OPTS].map(d => (
          <button key={d} onClick={() => setFilterDisc(d)} style={{padding:'5px 12px',background:filterDisc===d?'#4a7c59':'transparent',border:'1px solid #2a3020',color:filterDisc===d?'#e8d5a3':'#6a7a60',borderRadius:4,cursor:'pointer',fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:11}}>
            {d || 'ALL'}
          </button>
        ))}
      </div>
      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={filtered} loading={loading} onEdit={openEdit} onDelete={remove} emptyMsg="No LOD specifications found." />
      </div>
      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT LOD SPEC' : 'NEW LOD SPECIFICATION'}>
        <form onSubmit={handleSubmit}>
          <FormField label="Project" required>
            <MilSelect value={form.projectId} onChange={f('projectId')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." required />
          </FormField>
          <FormRow>
            <FormField label="Element" required><MilInput value={form.element} onChange={f('element')} placeholder="e.g. Walls — External" required /></FormField>
            <FormField label="Discipline"><MilSelect value={form.discipline} onChange={f('discipline')} options={DISC_OPTS} placeholder="Select..." /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="LOD Level" required><MilSelect value={form.lodLevel} onChange={f('lodLevel')} options={LOD_OPTS} required /></FormField>
            <FormField label="LOA Level"><MilSelect value={form.loaLevel} onChange={f('loaLevel')} options={['', ...LOA_OPTS]} placeholder="Optional..." /></FormField>
          </FormRow>
          <FormField label="Purpose"><MilInput value={form.purpose} onChange={f('purpose')} placeholder="e.g. 3D Coordination, Fabrication, FM Handover" /></FormField>
          <FormField label="Notes"><MilInput value={form.notes} onChange={f('notes')} placeholder="Additional notes..." /></FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} />
        </form>
      </MilModal>
    </div>
  )
}