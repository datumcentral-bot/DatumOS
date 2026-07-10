#!/usr/bin/env python3
"""Generate all v13 frontend pages"""
import os

BASE = '/workspace/datumos_v13/src/app/director'

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f'  ✓ {path.replace(BASE, "")}')

# ─── BIM / BEP PAGE ──────────────────────────────────────────────────────────
write(f'{BASE}/bim/bep/page.js', '''\'use client\'
import { useState, useEffect } from \'react\'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilTextarea, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, MilTabs, ToastProvider, toast, useCrud } from \'@/lib/mil\'

const STATUS_OPTS = [\'DRAFT\',\'IN_REVIEW\',\'APPROVED\',\'SUPERSEDED\']
const EMPTY = { projectId:\'\', title:\'\', version:\'1.0\', status:\'DRAFT\', projectInfo:\'\', objectives:\'\', standards:\'\', software:\'\', coordination:\'\', qualityPlan:\'\', deliveryPlan:\'\' }

export default function BepPage() {
  const { data: beps, loading, create, update, remove } = useCrud(\'/api/bim/bep\')
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState(\'list\')

  useEffect(() => { fetch(\'/api/projects\').then(r=>r.json()).then(setProjects) }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setModal(true) }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) await update(editing.id, form)
      else await create(form)
      setModal(false)
    } catch(err) { toast(err.message, \'error\') }
    finally { setSaving(false) }
  }

  const cols = [
    { key: \'title\', label: \'BEP TITLE\' },
    { key: \'project\', label: \'PROJECT\', render: (v) => v?.name || \'—\' },
    { key: \'version\', label: \'VERSION\' },
    { key: \'status\', label: \'STATUS\', render: (v) => <MilBadge status={v} /> },
    { key: \'createdAt\', label: \'CREATED\', render: (v) => v ? new Date(v).toLocaleDateString() : \'—\' }
  ]

  return (
    <div style={{ padding: 24, background: \'#0d1108\', minHeight: \'100vh\' }}>
      <ToastProvider />
      <PageHeader title="BIM EXECUTION PLANS" subtitle="ISO 19650 BEP management — create, edit, and track BEPs across all projects"
        actions={<MilBtn onClick={openNew}>+ NEW BEP</MilBtn>} />
      <div style={{ display:\'grid\', gridTemplateColumns:\'repeat(4,1fr)\', gap:16, marginBottom:24 }}>
        <StatCard label="Total BEPs" value={beps.length} color="#4a7c59" />
        <StatCard label="Approved" value={beps.filter(b=>b.status===\'APPROVED\').length} color="#4a7c59" />
        <StatCard label="In Review" value={beps.filter(b=>b.status===\'IN_REVIEW\').length} color="#8b6914" />
        <StatCard label="Draft" value={beps.filter(b=>b.status===\'DRAFT\').length} color="#234b84" />
      </div>
      <div style={{ background:\'#1a1f14\', border:\'1px solid #2a3020\', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={beps} loading={loading} onEdit={openEdit} onDelete={remove} emptyMsg="No BEPs found. Create your first BEP." />
      </div>
      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? \'EDIT BEP\' : \'NEW BIM EXECUTION PLAN\'} width={800}>
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField label="BEP Title" required><MilInput value={form.title} onChange={f(\'title\')} placeholder="e.g. BEP — Al Reem Tower Complex" required /></FormField>
            <FormField label="Project" required>
              <MilSelect value={form.projectId} onChange={f(\'projectId\')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." required />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Version"><MilInput value={form.version} onChange={f(\'version\')} placeholder="1.0" /></FormField>
            <FormField label="Status"><MilSelect value={form.status} onChange={f(\'status\')} options={STATUS_OPTS} /></FormField>
          </FormRow>
          <FormField label="Project Information"><MilTextarea value={form.projectInfo} onChange={f(\'projectInfo\')} placeholder="Project description, location, scope..." rows={3} /></FormField>
          <FormField label="BIM Objectives"><MilTextarea value={form.objectives} onChange={f(\'objectives\')} placeholder="Key BIM objectives for this project..." rows={3} /></FormField>
          <FormRow>
            <FormField label="Standards & Codes"><MilTextarea value={form.standards} onChange={f(\'standards\')} placeholder="ISO 19650, BS EN ISO 19650..." rows={2} /></FormField>
            <FormField label="Software & Tools"><MilTextarea value={form.software} onChange={f(\'software\')} placeholder="Revit 2024, Navisworks, BIM 360..." rows={2} /></FormField>
          </FormRow>
          <FormField label="Coordination Strategy"><MilTextarea value={form.coordination} onChange={f(\'coordination\')} placeholder="Clash detection frequency, federated model schedule..." rows={2} /></FormField>
          <FormRow>
            <FormField label="Quality Plan"><MilTextarea value={form.qualityPlan} onChange={f(\'qualityPlan\')} placeholder="Model audit schedule, QA checklist..." rows={2} /></FormField>
            <FormField label="Delivery Plan"><MilTextarea value={form.deliveryPlan} onChange={f(\'deliveryPlan\')} placeholder="Stage deliverables, milestones..." rows={2} /></FormField>
          </FormRow>
          <FormActions onCancel={() => setModal(false)} loading={saving} />
        </form>
      </MilModal>
    </div>
  )
}
''')

# ─── BIM / CDE PAGE ──────────────────────────────────────────────────────────
write(f'{BASE}/bim/cde/page.js', '''\'use client\'
import { useState, useEffect } from \'react\'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from \'@/lib/mil\'

const STATUS_OPTS = [\'WIP\',\'SHARED\',\'PUBLISHED\',\'ARCHIVED\']
const DISC_OPTS = [\'Architecture\',\'Structure\',\'MEP\',\'Civil\',\'Landscape\',\'Federated\',\'Survey\',\'Heritage\',\'Other\']
const ACCESS_OPTS = [\'PRIVATE\',\'PROJECT\',\'ALL_TEAMS\']
const APPROVAL_OPTS = [\'PENDING\',\'IN_REVIEW\',\'APPROVED\',\'REJECTED\']
const EMPTY = { projectId:\'\', name:\'\', docCode:\'\', revision:\'P01\', status:\'WIP\', discipline:\'\', fileType:\'\', owner:\'\', access:\'PRIVATE\', approvalStatus:\'PENDING\' }

export default function CdePage() {
  const { data: docs, loading, create, update, remove } = useCrud(\'/api/bim/cde\')
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState(\'\')

  useEffect(() => { fetch(\'/api/projects\').then(r=>r.json()).then(setProjects) }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setModal(true) }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) await update(editing.id, form)
      else await create(form)
      setModal(false)
    } catch(err) { toast(err.message, \'error\') }
    finally { setSaving(false) }
  }

  const filtered = filterStatus ? docs.filter(d => d.status === filterStatus) : docs

  const statusFlow = { WIP: \'SHARED\', SHARED: \'PUBLISHED\', PUBLISHED: \'ARCHIVED\' }
  const advanceStatus = async (doc) => {
    const next = statusFlow[doc.status]
    if (!next) return
    try { await update(doc.id, { status: next }); toast(`Status advanced to ${next}`) }
    catch(e) { toast(e.message, \'error\') }
  }

  const cols = [
    { key: \'name\', label: \'DOCUMENT NAME\', render: (v) => <span style={{fontFamily:\'monospace\',fontSize:12}}>{v}</span> },
    { key: \'docCode\', label: \'CODE\' },
    { key: \'revision\', label: \'REV\' },
    { key: \'discipline\', label: \'DISCIPLINE\' },
    { key: \'status\', label: \'CDE STATUS\', render: (v, row) => (
      <div style={{display:\'flex\',gap:6,alignItems:\'center\'}}>
        <MilBadge status={v} />
        {statusFlow[v] && <button onClick={() => advanceStatus(row)} style={{padding:\'2px 8px\',background:\'#234b84\',border:\'none\',color:\'#e8d5a3\',borderRadius:3,cursor:\'pointer\',fontSize:10,fontFamily:\'Rajdhani,sans-serif\',fontWeight:700}}>→{statusFlow[v]}</button>}
      </div>
    )},
    { key: \'access\', label: \'ACCESS\', render: (v) => <MilBadge status={v} label={v} /> },
    { key: \'approvalStatus\', label: \'APPROVAL\', render: (v) => <MilBadge status={v} /> },
    { key: \'owner\', label: \'OWNER\' }
  ]

  return (
    <div style={{ padding: 24, background: \'#0d1108\', minHeight: \'100vh\' }}>
      <ToastProvider />
      <PageHeader title="COMMON DATA ENVIRONMENT" subtitle="CDE document management — WIP → Shared → Published → Archived"
        actions={<><MilBtn onClick={openNew}>+ NEW DOCUMENT</MilBtn></>} />
      <div style={{ display:\'grid\', gridTemplateColumns:\'repeat(4,1fr)\', gap:16, marginBottom:24 }}>
        {[\'WIP\',\'SHARED\',\'PUBLISHED\',\'ARCHIVED\'].map(s => (
          <StatCard key={s} label={s} value={docs.filter(d=>d.status===s).length} color={s===\'PUBLISHED\'?\'#4a7c59\':s===\'SHARED\'?\'#8b6914\':s===\'ARCHIVED\'?\'#3a3a3a\':\'#234b84\'} />
        ))}
      </div>
      <div style={{ display:\'flex\', gap:8, marginBottom:16 }}>
        {[\'\',\'WIP\',\'SHARED\',\'PUBLISHED\',\'ARCHIVED\'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{padding:\'6px 14px\',background:filterStatus===s?\'#4a7c59\':\'transparent\',border:\'1px solid #2a3020\',color:filterStatus===s?\'#e8d5a3\':\'#6a7a60\',borderRadius:4,cursor:\'pointer\',fontFamily:\'Rajdhani,sans-serif\',fontWeight:700,fontSize:12}}>
            {s || \'ALL\'}
          </button>
        ))}
      </div>
      <div style={{ background:\'#1a1f14\', border:\'1px solid #2a3020\', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={filtered} loading={loading} onEdit={openEdit} onDelete={remove} emptyMsg="No CDE documents found." />
      </div>
      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? \'EDIT CDE DOCUMENT\' : \'NEW CDE DOCUMENT\'} width={720}>
        <form onSubmit={handleSubmit}>
          <FormField label="Document Name" required><MilInput value={form.name} onChange={f(\'name\')} placeholder="e.g. ARITC-ARC-ZZ-XX-M3-A-0001" required /></FormField>
          <FormRow>
            <FormField label="Project" required>
              <MilSelect value={form.projectId} onChange={f(\'projectId\')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." required />
            </FormField>
            <FormField label="Document Code"><MilInput value={form.docCode} onChange={f(\'docCode\')} placeholder="ARC-0001" /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Revision"><MilInput value={form.revision} onChange={f(\'revision\')} placeholder="P01" /></FormField>
            <FormField label="Discipline"><MilSelect value={form.discipline} onChange={f(\'discipline\')} options={DISC_OPTS} placeholder="Select..." /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="CDE Status"><MilSelect value={form.status} onChange={f(\'status\')} options={STATUS_OPTS} /></FormField>
            <FormField label="File Type"><MilInput value={form.fileType} onChange={f(\'fileType\')} placeholder="RVT, PDF, NWD..." /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Access Level"><MilSelect value={form.access} onChange={f(\'access\')} options={ACCESS_OPTS} /></FormField>
            <FormField label="Approval Status"><MilSelect value={form.approvalStatus} onChange={f(\'approvalStatus\')} options={APPROVAL_OPTS} /></FormField>
          </FormRow>
          <FormField label="Owner / Responsible"><MilInput value={form.owner} onChange={f(\'owner\')} placeholder="Name of responsible person" /></FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} />
        </form>
      </MilModal>
    </div>
  )
}
''')

# ─── BIM / LOD PAGE ──────────────────────────────────────────────────────────
write(f'{BASE}/bim/lod/page.js', '''\'use client\'
import { useState, useEffect } from \'react\'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from \'@/lib/mil\'

const LOD_OPTS = [\'LOD 100\',\'LOD 200\',\'LOD 300\',\'LOD 350\',\'LOD 400\',\'LOD 500\']
const LOA_OPTS = [\'LOA 10\',\'LOA 20\',\'LOA 30\',\'LOA 40\',\'LOA 50\']
const DISC_OPTS = [\'Architecture\',\'Structure\',\'MEP\',\'Civil\',\'Landscape\',\'Interior\',\'Facade\',\'Other\']
const EMPTY = { projectId:\'\', element:\'\', discipline:\'\', lodLevel:\'LOD 200\', loaLevel:\'\', purpose:\'\', notes:\'\' }

export default function LodPage() {
  const { data: specs, loading, create, update, remove } = useCrud(\'/api/bim/lod\')
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterDisc, setFilterDisc] = useState(\'\')

  useEffect(() => { fetch(\'/api/projects\').then(r=>r.json()).then(setProjects) }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setModal(true) }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) await update(editing.id, form)
      else await create(form)
      setModal(false)
    } catch(err) { toast(err.message, \'error\') }
    finally { setSaving(false) }
  }

  const filtered = filterDisc ? specs.filter(s => s.discipline === filterDisc) : specs
  const lodColor = { \'LOD 100\':\'#3a3a3a\',\'LOD 200\':\'#234b84\',\'LOD 300\':\'#5a3e2b\',\'LOD 350\':\'#8b6914\',\'LOD 400\':\'#4a7c59\',\'LOD 500\':\'#2b4a5a\' }

  const cols = [
    { key: \'element\', label: \'ELEMENT\' },
    { key: \'discipline\', label: \'DISCIPLINE\' },
    { key: \'lodLevel\', label: \'LOD LEVEL\', render: (v) => <span style={{background:lodColor[v]||\'#3a3a3a\',color:\'#e8d5a3\',padding:\'2px 8px\',borderRadius:3,fontSize:11,fontFamily:\'Orbitron,sans-serif\',fontWeight:700}}>{v}</span> },
    { key: \'loaLevel\', label: \'LOA LEVEL\' },
    { key: \'purpose\', label: \'PURPOSE\' },
    { key: \'notes\', label: \'NOTES\', render: (v) => v ? v.substring(0,40)+(v.length>40?\'...\':\'\') : \'—\' }
  ]

  return (
    <div style={{ padding: 24, background: \'#0d1108\', minHeight: \'100vh\' }}>
      <ToastProvider />
      <PageHeader title="LOD SPECIFICATION MATRIX" subtitle="Level of Development requirements per element and discipline"
        actions={<MilBtn onClick={openNew}>+ ADD LOD SPEC</MilBtn>} />
      <div style={{ display:\'grid\', gridTemplateColumns:\'repeat(6,1fr)\', gap:12, marginBottom:24 }}>
        {Object.entries(lodColor).map(([lod, color]) => (
          <StatCard key={lod} label={lod} value={specs.filter(s=>s.lodLevel===lod).length} color={color} />
        ))}
      </div>
      <div style={{ display:\'flex\', gap:8, marginBottom:16, flexWrap:\'wrap\' }}>
        {[\'\', ...DISC_OPTS].map(d => (
          <button key={d} onClick={() => setFilterDisc(d)} style={{padding:\'5px 12px\',background:filterDisc===d?\'#4a7c59\':\'transparent\',border:\'1px solid #2a3020\',color:filterDisc===d?\'#e8d5a3\':\'#6a7a60\',borderRadius:4,cursor:\'pointer\',fontFamily:\'Rajdhani,sans-serif\',fontWeight:700,fontSize:11}}>
            {d || \'ALL\'}
          </button>
        ))}
      </div>
      <div style={{ background:\'#1a1f14\', border:\'1px solid #2a3020\', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={filtered} loading={loading} onEdit={openEdit} onDelete={remove} emptyMsg="No LOD specifications found." />
      </div>
      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? \'EDIT LOD SPEC\' : \'NEW LOD SPECIFICATION\'}>
        <form onSubmit={handleSubmit}>
          <FormField label="Project" required>
            <MilSelect value={form.projectId} onChange={f(\'projectId\')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." required />
          </FormField>
          <FormRow>
            <FormField label="Element" required><MilInput value={form.element} onChange={f(\'element\')} placeholder="e.g. Walls — External" required /></FormField>
            <FormField label="Discipline"><MilSelect value={form.discipline} onChange={f(\'discipline\')} options={DISC_OPTS} placeholder="Select..." /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="LOD Level" required><MilSelect value={form.lodLevel} onChange={f(\'lodLevel\')} options={LOD_OPTS} required /></FormField>
            <FormField label="LOA Level"><MilSelect value={form.loaLevel} onChange={f(\'loaLevel\')} options={[\'\', ...LOA_OPTS]} placeholder="Optional..." /></FormField>
          </FormRow>
          <FormField label="Purpose"><MilInput value={form.purpose} onChange={f(\'purpose\')} placeholder="e.g. 3D Coordination, Fabrication, FM Handover" /></FormField>
          <FormField label="Notes"><MilInput value={form.notes} onChange={f(\'notes\')} placeholder="Additional notes..." /></FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} />
        </form>
      </MilModal>
    </div>
  )
}
''')

# ─── BIM / CLASH PAGE ────────────────────────────────────────────────────────
write(f'{BASE}/bim/clash/page.js', '''\'use client\'
import { useState, useEffect } from \'react\'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilTextarea, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from \'@/lib/mil\'

const STATUS_OPTS = [\'OPEN\',\'IN_REVIEW\',\'RESOLVED\',\'CLOSED\',\'WONT_FIX\']
const SEV_OPTS = [\'LOW\',\'MEDIUM\',\'HIGH\',\'CRITICAL\']
const DISC_OPTS = [\'Architecture\',\'Structure\',\'MEP\',\'Civil\',\'Landscape\',\'Heritage\',\'Other\']
const EMPTY = { projectId:\'\', title:\'\', description:\'\', discipline1:\'\', discipline2:\'\', severity:\'MEDIUM\', status:\'OPEN\', assignedTo:\'\', notes:\'\' }

export default function ClashPage() {
  const { data: clashes, loading, create, update, remove } = useCrud(\'/api/bim/clash\')
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState(\'\')

  useEffect(() => { fetch(\'/api/projects\').then(r=>r.json()).then(setProjects) }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setModal(true) }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) await update(editing.id, form)
      else await create(form)
      setModal(false)
    } catch(err) { toast(err.message, \'error\') }
    finally { setSaving(false) }
  }

  const filtered = filterStatus ? clashes.filter(c => c.status === filterStatus) : clashes

  const cols = [
    { key: \'title\', label: \'CLASH DESCRIPTION\' },
    { key: \'project\', label: \'PROJECT\', render: (v) => v?.name || \'—\' },
    { key: \'discipline1\', label: \'DISC 1\' },
    { key: \'discipline2\', label: \'DISC 2\' },
    { key: \'severity\', label: \'SEVERITY\', render: (v) => <MilBadge status={v} /> },
    { key: \'status\', label: \'STATUS\', render: (v) => <MilBadge status={v} /> },
    { key: \'assignedTo\', label: \'ASSIGNED TO\' },
    { key: \'detectedAt\', label: \'DETECTED\', render: (v) => v ? new Date(v).toLocaleDateString() : \'—\' }
  ]

  return (
    <div style={{ padding: 24, background: \'#0d1108\', minHeight: \'100vh\' }}>
      <ToastProvider />
      <PageHeader title="CLASH DETECTION REGISTER" subtitle="Track and resolve model clashes across all disciplines"
        actions={<MilBtn onClick={openNew}>+ LOG CLASH</MilBtn>} />
      <div style={{ display:\'grid\', gridTemplateColumns:\'repeat(4,1fr)\', gap:16, marginBottom:24 }}>
        <StatCard label="Open" value={clashes.filter(c=>c.status===\'OPEN\').length} color="#8b1a1a" />
        <StatCard label="In Review" value={clashes.filter(c=>c.status===\'IN_REVIEW\').length} color="#8b6914" />
        <StatCard label="Resolved" value={clashes.filter(c=>c.status===\'RESOLVED\').length} color="#4a7c59" />
        <StatCard label="Critical" value={clashes.filter(c=>c.severity===\'CRITICAL\').length} color="#c0392b" />
      </div>
      <div style={{ display:\'flex\', gap:8, marginBottom:16 }}>
        {[\'\',\'OPEN\',\'IN_REVIEW\',\'RESOLVED\',\'CLOSED\'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{padding:\'6px 14px\',background:filterStatus===s?\'#4a7c59\':\'transparent\',border:\'1px solid #2a3020\',color:filterStatus===s?\'#e8d5a3\':\'#6a7a60\',borderRadius:4,cursor:\'pointer\',fontFamily:\'Rajdhani,sans-serif\',fontWeight:700,fontSize:12}}>
            {s || \'ALL\'}
          </button>
        ))}
      </div>
      <div style={{ background:\'#1a1f14\', border:\'1px solid #2a3020\', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={filtered} loading={loading} onEdit={openEdit} onDelete={remove} emptyMsg="No clashes logged. Great coordination!" />
      </div>
      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? \'EDIT CLASH\' : \'LOG NEW CLASH\'} width={720}>
        <form onSubmit={handleSubmit}>
          <FormField label="Clash Title" required><MilInput value={form.title} onChange={f(\'title\')} placeholder="e.g. HVAC vs Structural Beam — Level 5" required /></FormField>
          <FormField label="Project" required>
            <MilSelect value={form.projectId} onChange={f(\'projectId\')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." required />
          </FormField>
          <FormField label="Description"><MilTextarea value={form.description} onChange={f(\'description\')} placeholder="Detailed description of the clash..." rows={2} /></FormField>
          <FormRow>
            <FormField label="Discipline 1"><MilSelect value={form.discipline1} onChange={f(\'discipline1\')} options={DISC_OPTS} placeholder="Select..." /></FormField>
            <FormField label="Discipline 2"><MilSelect value={form.discipline2} onChange={f(\'discipline2\')} options={DISC_OPTS} placeholder="Select..." /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Severity"><MilSelect value={form.severity} onChange={f(\'severity\')} options={SEV_OPTS} /></FormField>
            <FormField label="Status"><MilSelect value={form.status} onChange={f(\'status\')} options={STATUS_OPTS} /></FormField>
          </FormRow>
          <FormField label="Assigned To"><MilInput value={form.assignedTo} onChange={f(\'assignedTo\')} placeholder="Name of responsible person" /></FormField>
          <FormField label="Notes / Resolution"><MilTextarea value={form.notes} onChange={f(\'notes\')} placeholder="Resolution notes, workaround..." rows={2} /></FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} />
        </form>
      </MilModal>
    </div>
  )
}
''')

# ─── BIM / RESPONSIBILITY MATRIX PAGE ────────────────────────────────────────
write(f'{BASE}/bim/responsibility-matrix/page.js', '''\'use client\'
import { useState, useEffect } from \'react\'
import { MilModal, MilTable, MilBtn, MilInput, MilSelect, FormField, FormRow, FormActions, PageHeader, ToastProvider, toast, useCrud } from \'@/lib/mil\'

const DISC_OPTS = [\'Architecture\',\'Structure\',\'MEP\',\'Civil\',\'Landscape\',\'Federated\',\'All\']
const ROLE_OPTS = [\'BIM Author\',\'BIM Coordinator\',\'BIM Manager\',\'BIM Lead\',\'Reviewer\',\'Approver\']
const EMPTY = { projectId:\'\', discipline:\'\', deliverable:\'\', role:\'\', responsible:\'\', accountable:\'\', consulted:\'\', informed:\'\', notes:\'\' }

export default function RaciPage() {
  const { data: matrix, loading, create, update, remove } = useCrud(\'/api/bim/responsibility-matrix\')
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch(\'/api/projects\').then(r=>r.json()).then(setProjects) }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setModal(true) }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) await update(editing.id, form)
      else await create(form)
      setModal(false)
    } catch(err) { toast(err.message, \'error\') }
    finally { setSaving(false) }
  }

  const cols = [
    { key: \'discipline\', label: \'DISCIPLINE\' },
    { key: \'deliverable\', label: \'DELIVERABLE\' },
    { key: \'role\', label: \'ROLE\' },
    { key: \'responsible\', label: \'R — RESPONSIBLE\' },
    { key: \'accountable\', label: \'A — ACCOUNTABLE\' },
    { key: \'consulted\', label: \'C — CONSULTED\' },
    { key: \'informed\', label: \'I — INFORMED\' }
  ]

  return (
    <div style={{ padding: 24, background: \'#0d1108\', minHeight: \'100vh\' }}>
      <ToastProvider />
      <PageHeader title="RESPONSIBILITY MATRIX" subtitle="RACI matrix — assign roles per discipline and deliverable"
        actions={<MilBtn onClick={openNew}>+ ADD ENTRY</MilBtn>} />
      <div style={{ background:\'#1a1f14\', border:\'1px solid #2a3020\', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={matrix} loading={loading} onEdit={openEdit} onDelete={remove} emptyMsg="No responsibility matrix entries found." />
      </div>
      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? \'EDIT RACI ENTRY\' : \'NEW RACI ENTRY\'} width={720}>
        <form onSubmit={handleSubmit}>
          <FormField label="Project" required>
            <MilSelect value={form.projectId} onChange={f(\'projectId\')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." required />
          </FormField>
          <FormRow>
            <FormField label="Discipline" required><MilSelect value={form.discipline} onChange={f(\'discipline\')} options={DISC_OPTS} placeholder="Select..." required /></FormField>
            <FormField label="Role"><MilSelect value={form.role} onChange={f(\'role\')} options={ROLE_OPTS} placeholder="Select..." /></FormField>
          </FormRow>
          <FormField label="Deliverable" required><MilInput value={form.deliverable} onChange={f(\'deliverable\')} placeholder="e.g. Architectural Model, Clash Report" required /></FormField>
          <FormRow>
            <FormField label="Responsible (R)"><MilInput value={form.responsible} onChange={f(\'responsible\')} placeholder="Who does the work" /></FormField>
            <FormField label="Accountable (A)"><MilInput value={form.accountable} onChange={f(\'accountable\')} placeholder="Who is ultimately accountable" /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Consulted (C)"><MilInput value={form.consulted} onChange={f(\'consulted\')} placeholder="Who is consulted" /></FormField>
            <FormField label="Informed (I)"><MilInput value={form.informed} onChange={f(\'informed\')} placeholder="Who is kept informed" /></FormField>
          </FormRow>
          <FormField label="Notes"><MilInput value={form.notes} onChange={f(\'notes\')} placeholder="Additional notes..." /></FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} />
        </form>
      </MilModal>
    </div>
  )
}
''')

# ─── BIM / NAMING CONVENTION PAGE ────────────────────────────────────────────
write(f'{BASE}/bim/naming-convention/page.js', '''\'use client\'
import { useState, useEffect } from \'react\'
import { MilModal, MilTable, MilBtn, MilInput, MilTextarea, MilSelect, FormField, FormRow, FormActions, PageHeader, ToastProvider, toast, useCrud } from \'@/lib/mil\'

const EMPTY = { projectId:\'\', name:\'\', pattern:\'\', description:\'\', fields:\'\', example:\'\' }

export default function NamingPage() {
  const { data: conventions, loading, create, update, remove } = useCrud(\'/api/bim/naming-convention\')
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch(\'/api/projects\').then(r=>r.json()).then(setProjects) }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setModal(true) }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) await update(editing.id, form)
      else await create(form)
      setModal(false)
    } catch(err) { toast(err.message, \'error\') }
    finally { setSaving(false) }
  }

  const cols = [
    { key: \'name\', label: \'CONVENTION NAME\' },
    { key: \'pattern\', label: \'PATTERN\', render: (v) => <code style={{background:\'#0d1108\',padding:\'2px 6px\',borderRadius:3,fontSize:11,color:\'#c8a84b\'}}>{v}</code> },
    { key: \'example\', label: \'EXAMPLE\', render: (v) => <code style={{background:\'#0d1108\',padding:\'2px 6px\',borderRadius:3,fontSize:11,color:\'#4a7c59\'}}>{v}</code> },
    { key: \'description\', label: \'DESCRIPTION\', render: (v) => v ? v.substring(0,50)+(v.length>50?\'...\':\'\') : \'—\' }
  ]

  return (
    <div style={{ padding: 24, background: \'#0d1108\', minHeight: \'100vh\' }}>
      <ToastProvider />
      <PageHeader title="NAMING CONVENTION MANAGER" subtitle="Define and manage document naming conventions per project"
        actions={<MilBtn onClick={openNew}>+ NEW CONVENTION</MilBtn>} />
      <div style={{ background:\'#1a1f14\', border:\'1px solid #2a3020\', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={conventions} loading={loading} onEdit={openEdit} onDelete={remove} emptyMsg="No naming conventions defined." />
      </div>
      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? \'EDIT CONVENTION\' : \'NEW NAMING CONVENTION\'} width={680}>
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField label="Convention Name" required><MilInput value={form.name} onChange={f(\'name\')} placeholder="e.g. Model File Naming" required /></FormField>
            <FormField label="Project" required>
              <MilSelect value={form.projectId} onChange={f(\'projectId\')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." required />
            </FormField>
          </FormRow>
          <FormField label="Pattern" required><MilInput value={form.pattern} onChange={f(\'pattern\')} placeholder="{ProjectCode}-{Discipline}-{Zone}-{Level}-{Type}-{Role}-{Number}" required /></FormField>
          <FormField label="Fields (comma-separated)"><MilInput value={form.fields} onChange={f(\'fields\')} placeholder="ProjectCode,Discipline,Zone,Level,Type,Role,Number" /></FormField>
          <FormField label="Example"><MilInput value={form.example} onChange={f(\'example\')} placeholder="ARITC-ARC-ZZ-XX-M3-A-0001" /></FormField>
          <FormField label="Description"><MilTextarea value={form.description} onChange={f(\'description\')} placeholder="Describe when and how to use this convention..." rows={2} /></FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} />
        </form>
      </MilModal>
    </div>
  )
}
''')

# ─── GLOBAL SEARCH PAGE ───────────────────────────────────────────────────────
write(f'{BASE}/search/page.js', '''\'use client\'
import { useState, useEffect, useCallback } from \'react\'
import { MilBadge, MilSpinner, PageHeader, ToastProvider } from \'@/lib/mil\'
import Link from \'next/link\'

export default function SearchPage() {
  const [q, setQ] = useState(\'\')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (query) => {
    if (!query || query.length < 2) { setResults(null); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      setResults(await res.json())
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => search(q), 300)
    return () => clearTimeout(t)
  }, [q, search])

  const Section = ({ title, items, renderItem }) => items?.length > 0 ? (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily:\'Orbitron,sans-serif\', color:\'#c8a84b\', fontSize:12, letterSpacing:2, marginBottom:12, paddingBottom:8, borderBottom:\'1px solid #2a3020\' }}>{title} ({items.length})</div>
      <div style={{ display:\'flex\', flexDirection:\'column\', gap:8 }}>{items.map(renderItem)}</div>
    </div>
  ) : null

  return (
    <div style={{ padding: 24, background: \'#0d1108\', minHeight: \'100vh\' }}>
      <ToastProvider />
      <PageHeader title="GLOBAL SEARCH" subtitle="Search across clients, projects, tasks, documents, and meetings" />
      <div style={{ maxWidth: 700, margin: \'0 auto\' }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search everything... (min 2 characters)" autoFocus
          style={{ width:\'100%\', background:\'#1a1f14\', border:\'1px solid #4a7c59\', borderRadius:6, padding:\'14px 20px\', color:\'#e8d5a3\', fontFamily:\'Rajdhani,sans-serif\', fontSize:16, outline:\'none\', boxSizing:\'border-box\', marginBottom:24 }} />
        {loading && <MilSpinner />}
        {results && !loading && (
          <div>
            <Section title="CLIENTS" items={results.clients} renderItem={c => (
              <Link key={c.id} href="/director/clients" style={{ display:\'block\', background:\'#1a1f14\', border:\'1px solid #2a3020\', borderRadius:4, padding:\'10px 16px\', textDecoration:\'none\', color:\'#e8d5a3\', fontFamily:\'Rajdhani,sans-serif\' }}>
                <div style={{fontWeight:700}}>{c.companyName}</div>
                <div style={{color:\'#6a7a60\',fontSize:12}}>{c.industry}</div>
              </Link>
            )} />
            <Section title="PROJECTS" items={results.projects} renderItem={p => (
              <Link key={p.id} href="/director/client-projects" style={{ display:\'block\', background:\'#1a1f14\', border:\'1px solid #2a3020\', borderRadius:4, padding:\'10px 16px\', textDecoration:\'none\', color:\'#e8d5a3\', fontFamily:\'Rajdhani,sans-serif\' }}>
                <div style={{display:\'flex\',justifyContent:\'space-between\',alignItems:\'center\'}}>
                  <div style={{fontWeight:700}}>{p.name}</div>
                  <MilBadge status={p.status} />
                </div>
                <div style={{color:\'#6a7a60\',fontSize:12}}>{p.code}</div>
              </Link>
            )} />
            <Section title="TASKS" items={results.tasks} renderItem={t => (
              <Link key={t.id} href="/director/tasks" style={{ display:\'block\', background:\'#1a1f14\', border:\'1px solid #2a3020\', borderRadius:4, padding:\'10px 16px\', textDecoration:\'none\', color:\'#e8d5a3\', fontFamily:\'Rajdhani,sans-serif\' }}>
                <div style={{display:\'flex\',justifyContent:\'space-between\',alignItems:\'center\'}}>
                  <div style={{fontWeight:700}}>{t.title}</div>
                  <div style={{display:\'flex\',gap:6}}><MilBadge status={t.priority} /><MilBadge status={t.status} /></div>
                </div>
              </Link>
            )} />
            <Section title="CDE DOCUMENTS" items={results.cdeDocs} renderItem={d => (
              <Link key={d.id} href="/director/bim/cde" style={{ display:\'block\', background:\'#1a1f14\', border:\'1px solid #2a3020\', borderRadius:4, padding:\'10px 16px\', textDecoration:\'none\', color:\'#e8d5a3\', fontFamily:\'Rajdhani,sans-serif\' }}>
                <div style={{display:\'flex\',justifyContent:\'space-between\',alignItems:\'center\'}}>
                  <div style={{fontWeight:700,fontFamily:\'monospace\',fontSize:12}}>{d.name}</div>
                  <MilBadge status={d.status} />
                </div>
                <div style={{color:\'#6a7a60\',fontSize:12}}>{d.discipline}</div>
              </Link>
            )} />
            <Section title="MEETINGS" items={results.meetings} renderItem={m => (
              <Link key={m.id} href="/director/meetings" style={{ display:\'block\', background:\'#1a1f14\', border:\'1px solid #2a3020\', borderRadius:4, padding:\'10px 16px\', textDecoration:\'none\', color:\'#e8d5a3\', fontFamily:\'Rajdhani,sans-serif\' }}>
                <div style={{display:\'flex\',justifyContent:\'space-between\',alignItems:\'center\'}}>
                  <div style={{fontWeight:700}}>{m.title}</div>
                  <MilBadge status={m.status} />
                </div>
                <div style={{color:\'#6a7a60\',fontSize:12}}>{new Date(m.scheduledAt).toLocaleDateString()}</div>
              </Link>
            )} />
            {Object.values(results).every(v => !v?.length) && (
              <div style={{textAlign:\'center\',padding:40,color:\'#4a5a40\',fontFamily:\'Rajdhani,sans-serif\'}}>No results found for "{q}"</div>
            )}
          </div>
        )}
        {!q && <div style={{textAlign:\'center\',padding:60,color:\'#4a5a40\',fontFamily:\'Rajdhani,sans-serif\',fontSize:14}}>Start typing to search across all DatumOS data...</div>}
      </div>
    </div>
  )
}
''')

# ─── WORKLOAD PAGE ────────────────────────────────────────────────────────────
write(f'{BASE}/workload/page.js', '''\'use client\'
import { useState, useEffect } from \'react\'
import { PageHeader, StatCard, MilSpinner, ToastProvider, toast } from \'@/lib/mil\'

function getWeekStart(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay() + 1 + offset * 7)
  d.setHours(0,0,0,0)
  return d
}

export default function WorkloadPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [data, setData] = useState({ users: [], allocations: [] })
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])

  const weekStart = getWeekStart(weekOffset)
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/workload?weekStart=${weekStart.toISOString()}`).then(r=>r.json()),
      fetch(\'/api/projects\').then(r=>r.json())
    ]).then(([w, p]) => { setData(w); setProjects(p) }).finally(() => setLoading(false))
  }, [weekOffset])

  const getUserAlloc = (userId) => data.allocations.filter(a => a.userId === userId)
  const getUserTotal = (userId) => getUserAlloc(userId).reduce((s, a) => s + a.hours, 0)

  const addAlloc = async (userId, projectId, hours) => {
    try {
      await fetch(\'/api/workload\', { method:\'POST\', headers:{\'Content-Type\':\'application/json\'}, body: JSON.stringify({ userId, projectId, hours: parseFloat(hours), weekStart: weekStart.toISOString() }) })
      const w = await fetch(`/api/workload?weekStart=${weekStart.toISOString()}`).then(r=>r.json())
      setData(w)
      toast(\'Allocation saved\')
    } catch(e) { toast(e.message, \'error\') }
  }

  return (
    <div style={{ padding: 24, background: \'#0d1108\', minHeight: \'100vh\' }}>
      <ToastProvider />
      <PageHeader title="WORKLOAD MANAGEMENT" subtitle="Team capacity and allocation by week"
        actions={
          <div style={{display:\'flex\',gap:8,alignItems:\'center\'}}>
            <button onClick={() => setWeekOffset(w => w-1)} style={{padding:\'6px 12px\',background:\'transparent\',border:\'1px solid #4a7c59\',color:\'#e8d5a3\',borderRadius:4,cursor:\'pointer\',fontFamily:\'Rajdhani,sans-serif\',fontWeight:700}}>← PREV</button>
            <span style={{fontFamily:\'Orbitron,sans-serif\',color:\'#c8a84b\',fontSize:12,padding:\'0 12px\'}}>
              {weekStart.toLocaleDateString()} — {weekEnd.toLocaleDateString()}
            </span>
            <button onClick={() => setWeekOffset(w => w+1)} style={{padding:\'6px 12px\',background:\'transparent\',border:\'1px solid #4a7c59\',color:\'#e8d5a3\',borderRadius:4,cursor:\'pointer\',fontFamily:\'Rajdhani,sans-serif\',fontWeight:700}}>NEXT →</button>
          </div>
        } />
      {loading ? <MilSpinner /> : (
        <div style={{ display:\'flex\', flexDirection:\'column\', gap:16 }}>
          {data.users.map(user => {
            const total = getUserTotal(user.id)
            const pct = Math.min(100, Math.round((total / user.capacityHrs) * 100))
            const color = pct > 90 ? \'#8b1a1a\' : pct > 75 ? \'#8b6914\' : \'#4a7c59\'
            return (
              <div key={user.id} style={{ background:\'#1a1f14\', border:\'1px solid #2a3020\', borderRadius:6, padding:20 }}>
                <div style={{ display:\'flex\', justifyContent:\'space-between\', alignItems:\'center\', marginBottom:12 }}>
                  <div>
                    <div style={{fontFamily:\'Rajdhani,sans-serif\',color:\'#e8d5a3\',fontWeight:700,fontSize:15}}>{user.name}</div>
                    <div style={{fontFamily:\'Rajdhani,sans-serif\',color:\'#6a7a60\',fontSize:12}}>{user.title}</div>
                  </div>
                  <div style={{textAlign:\'right\'}}>
                    <div style={{fontFamily:\'Orbitron,sans-serif\',color,fontSize:18,fontWeight:700}}>{total}h</div>
                    <div style={{fontFamily:\'Rajdhani,sans-serif\',color:\'#6a7a60\',fontSize:12}}>of {user.capacityHrs}h capacity ({pct}%)</div>
                  </div>
                </div>
                <div style={{background:\'#0d1108\',borderRadius:2,height:8,overflow:\'hidden\',marginBottom:12}}>
                  <div style={{width:`${pct}%`,height:\'100%\',background:color,borderRadius:2,transition:\'width 0.5s\'}} />
                </div>
                <div style={{ display:\'flex\', gap:8, flexWrap:\'wrap\' }}>
                  {getUserAlloc(user.id).map(a => (
                    <div key={a.id} style={{background:\'#0d1108\',border:\'1px solid #2a3020\',borderRadius:4,padding:\'4px 10px\',fontFamily:\'Rajdhani,sans-serif\',fontSize:12,color:\'#a0a090\'}}>
                      {a.project?.name || \'Unassigned\'}: <strong style={{color:\'#c8a84b\'}}>{a.hours}h</strong>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
''')

# ─── WEBRTC MEETING ROOM ──────────────────────────────────────────────────────
write(f'{BASE}/meetings/room/[id]/page.js', '''\'use client\'
import { useState, useEffect, useRef, useCallback } from \'react\'
import { MilBtn, MilInput, MilTextarea, FormField, ToastProvider, toast } from \'@/lib/mil\'
import { useParams } from \'next/navigation\'

export default function MeetingRoom() {
  const { id } = useParams()
  const [meeting, setMeeting] = useState(null)
  const [localStream, setLocalStream] = useState(null)
  const [screenStream, setScreenStream] = useState(null)
  const [recording, setRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [chatMsg, setChatMsg] = useState(\'\')
  const [chatLog, setChatLog] = useState([])
  const [minutes, setMinutes] = useState(\'\')
  const [actionTitle, setActionTitle] = useState(\'\')
  const [actionItems, setActionItems] = useState([])
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const localVideoRef = useRef(null)
  const screenVideoRef = useRef(null)
  const recordedChunks = useRef([])

  useEffect(() => {
    fetch(`/api/meetings/${id}`).then(r=>r.json()).then(m => {
      setMeeting(m)
      setActionItems(m.actionItems || [])
      const mins = (m.minutes || []).map(mn => mn.content).join(\'\\n\\n\')
      setMinutes(mins)
    })
  }, [id])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setLocalStream(stream)
      if (localVideoRef.current) localVideoRef.current.srcObject = stream
      toast(\'Camera and microphone started\')
    } catch(e) { toast(\'Camera access denied: \' + e.message, \'error\') }
  }

  const stopCamera = () => {
    localStream?.getTracks().forEach(t => t.stop())
    setLocalStream(null)
    if (localVideoRef.current) localVideoRef.current.srcObject = null
  }

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      setScreenStream(stream)
      if (screenVideoRef.current) screenVideoRef.current.srcObject = stream
      stream.getVideoTracks()[0].onended = () => { setScreenStream(null) }
      toast(\'Screen sharing started\')
    } catch(e) { toast(\'Screen share denied: \' + e.message, \'error\') }
  }

  const stopScreenShare = () => {
    screenStream?.getTracks().forEach(t => t.stop())
    setScreenStream(null)
    if (screenVideoRef.current) screenVideoRef.current.srcObject = null
  }

  const startRecording = () => {
    const stream = localStream || screenStream
    if (!stream) { toast(\'Start camera or screen share first\', \'warning\'); return }
    recordedChunks.current = []
    const mr = new MediaRecorder(stream)
    mr.ondataavailable = e => { if (e.data.size > 0) recordedChunks.current.push(e.data) }
    mr.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: \'video/webm\' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement(\'a\'); a.href = url; a.download = `meeting-${id}-recording.webm`; a.click()
      toast(\'Recording downloaded\')
    }
    mr.start()
    setMediaRecorder(mr)
    setRecording(true)
    toast(\'Recording started\')
  }

  const stopRecording = () => {
    mediaRecorder?.stop()
    setRecording(false)
    toast(\'Recording stopped — downloading...\')
  }

  const toggleMic = () => {
    localStream?.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
    setMicOn(m => !m)
  }

  const toggleCam = () => {
    localStream?.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
    setCamOn(c => !c)
  }

  const sendChat = () => {
    if (!chatMsg.trim()) return
    setChatLog(l => [...l, { text: chatMsg, time: new Date().toLocaleTimeString(), me: true }])
    setChatMsg(\'\')
  }

  const saveMinutes = async () => {
    try {
      await fetch(`/api/meeting-minutes`, { method:\'POST\', headers:{\'Content-Type\':\'application/json\'}, body: JSON.stringify({ meetingId: id, section: \'Meeting Minutes\', content: minutes, orderIndex: 1 }) })
      toast(\'Minutes saved\')
    } catch(e) { toast(e.message, \'error\') }
  }

  const addActionItem = async () => {
    if (!actionTitle.trim()) return
    try {
      const res = await fetch(\'/api/action-items\', { method:\'POST\', headers:{\'Content-Type\':\'application/json\'}, body: JSON.stringify({ meetingId: id, title: actionTitle, status: \'OPEN\' }) })
      const item = await res.json()
      setActionItems(a => [...a, item])
      setActionTitle(\'\')
      toast(\'Action item added\')
    } catch(e) { toast(e.message, \'error\') }
  }

  const btnStyle = (active, color=\'#4a7c59\') => ({ padding:\'8px 16px\', background: active ? color : \'#1a1f14\', border:`1px solid ${color}`, color:\'#e8d5a3\', borderRadius:4, cursor:\'pointer\', fontFamily:\'Rajdhani,sans-serif\', fontWeight:700, fontSize:12 })

  return (
    <div style={{ background:\'#0d1108\', minHeight:\'100vh\', padding:20 }}>
      <ToastProvider />
      <div style={{ fontFamily:\'Orbitron,sans-serif\', color:\'#c8a84b\', fontSize:18, marginBottom:4 }}>
        ◉ LIVE MEETING ROOM
      </div>
      <div style={{ fontFamily:\'Rajdhani,sans-serif\', color:\'#6a7a60\', fontSize:13, marginBottom:20 }}>
        {meeting?.title || \'Loading...\'} — {meeting?.scheduledAt ? new Date(meeting.scheduledAt).toLocaleString() : \'\'}
      </div>

      <div style={{ display:\'grid\', gridTemplateColumns:\'1fr 320px\', gap:20 }}>
        {/* VIDEO AREA */}
        <div>
          <div style={{ display:\'grid\', gridTemplateColumns: screenStream ? \'1fr 1fr\' : \'1fr\', gap:12, marginBottom:16 }}>
            <div style={{ background:\'#1a1f14\', border:\'1px solid #2a3020\', borderRadius:6, overflow:\'hidden\', aspectRatio:\'16/9\', position:\'relative\' }}>
              <video ref={localVideoRef} autoPlay muted playsInline style={{ width:\'100%\', height:\'100%\', objectFit:\'cover\' }} />
              {!localStream && <div style={{position:\'absolute\',inset:0,display:\'flex\',alignItems:\'center\',justifyContent:\'center\',color:\'#4a5a40\',fontFamily:\'Rajdhani,sans-serif\'}}>📷 Camera Off</div>}
              <div style={{position:\'absolute\',bottom:8,left:8,background:\'rgba(0,0,0,0.7)\',padding:\'2px 8px\',borderRadius:3,fontFamily:\'Rajdhani,sans-serif\',color:\'#e8d5a3\',fontSize:11}}>YOU</div>
            </div>
            {screenStream && (
              <div style={{ background:\'#1a1f14\', border:\'1px solid #4a7c59\', borderRadius:6, overflow:\'hidden\', aspectRatio:\'16/9\', position:\'relative\' }}>
                <video ref={screenVideoRef} autoPlay playsInline style={{ width:\'100%\', height:\'100%\', objectFit:\'contain\' }} />
                <div style={{position:\'absolute\',bottom:8,left:8,background:\'rgba(0,0,0,0.7)\',padding:\'2px 8px\',borderRadius:3,fontFamily:\'Rajdhani,sans-serif\',color:\'#4a7c59\',fontSize:11}}>SCREEN SHARE</div>
              </div>
            )}
          </div>

          {/* CONTROLS */}
          <div style={{ display:\'flex\', gap:8, flexWrap:\'wrap\', marginBottom:20 }}>
            {!localStream ? <button onClick={startCamera} style={btnStyle(false)}>📷 START CAMERA</button> : <button onClick={stopCamera} style={btnStyle(true,\'#8b1a1a\')}>📷 STOP CAMERA</button>}
            {localStream && <button onClick={toggleMic} style={btnStyle(micOn)}>🎤 {micOn ? \'MIC ON\' : \'MIC OFF\'}</button>}
            {localStream && <button onClick={toggleCam} style={btnStyle(camOn)}>📹 {camOn ? \'CAM ON\' : \'CAM OFF\'}</button>}
            {!screenStream ? <button onClick={startScreenShare} style={btnStyle(false,\'#234b84\')}>🖥 SHARE SCREEN</button> : <button onClick={stopScreenShare} style={btnStyle(true,\'#8b1a1a\')}>🖥 STOP SHARE</button>}
            {!recording ? <button onClick={startRecording} style={btnStyle(false,\'#8b6914\')}>⏺ RECORD</button> : <button onClick={stopRecording} style={btnStyle(true,\'#8b1a1a\')}>⏹ STOP REC</button>}
          </div>

          {/* PARTICIPANTS */}
          <div style={{ background:\'#1a1f14\', border:\'1px solid #2a3020\', borderRadius:6, padding:16, marginBottom:16 }}>
            <div style={{fontFamily:\'Orbitron,sans-serif\',color:\'#c8a84b\',fontSize:12,marginBottom:12}}>PARTICIPANTS ({meeting?.participants?.length || 0})</div>
            <div style={{display:\'flex\',gap:8,flexWrap:\'wrap\'}}>
              {(meeting?.participants || []).map(p => (
                <div key={p.id} style={{background:\'#0d1108\',border:\'1px solid #2a3020\',borderRadius:4,padding:\'4px 10px\',fontFamily:\'Rajdhani,sans-serif\',fontSize:12,color:\'#a0a090\'}}>
                  {p.name} <span style={{color:\'#4a5a40\',fontSize:10}}>({p.role})</span>
                </div>
              ))}
            </div>
          </div>

          {/* MINUTES */}
          <div style={{ background:\'#1a1f14\', border:\'1px solid #2a3020\', borderRadius:6, padding:16, marginBottom:16 }}>
            <div style={{fontFamily:\'Orbitron,sans-serif\',color:\'#c8a84b\',fontSize:12,marginBottom:12}}>MEETING MINUTES</div>
            <textarea value={minutes} onChange={e => setMinutes(e.target.value)} rows={6} placeholder="Type meeting minutes here..." style={{width:\'100%\',background:\'#0d1108\',border:\'1px solid #2a3020\',borderRadius:4,padding:\'8px 12px\',color:\'#e8d5a3\',fontFamily:\'Rajdhani,sans-serif\',fontSize:13,resize:\'vertical\',boxSizing:\'border-box\'}} />
            <button onClick={saveMinutes} style={{marginTop:8,...btnStyle(false)}}>💾 SAVE MINUTES</button>
          </div>

          {/* ACTION ITEMS */}
          <div style={{ background:\'#1a1f14\', border:\'1px solid #2a3020\', borderRadius:6, padding:16 }}>
            <div style={{fontFamily:\'Orbitron,sans-serif\',color:\'#c8a84b\',fontSize:12,marginBottom:12}}>ACTION ITEMS</div>
            <div style={{display:\'flex\',gap:8,marginBottom:12}}>
              <input value={actionTitle} onChange={e => setActionTitle(e.target.value)} onKeyDown={e => e.key===\'Enter\' && addActionItem()} placeholder="Add action item..." style={{flex:1,background:\'#0d1108\',border:\'1px solid #2a3020\',borderRadius:4,padding:\'6px 10px\',color:\'#e8d5a3\',fontFamily:\'Rajdhani,sans-serif\',fontSize:13}} />
              <button onClick={addActionItem} style={btnStyle(false)}>+ ADD</button>
            </div>
            {actionItems.map((a, i) => (
              <div key={a.id || i} style={{display:\'flex\',alignItems:\'center\',gap:8,padding:\'6px 0\',borderBottom:\'1px solid #1a1f14\'}}>
                <span style={{color:\'#4a7c59\',fontSize:14}}>◻</span>
                <span style={{fontFamily:\'Rajdhani,sans-serif\',color:\'#c8c8b0\',fontSize:13,flex:1}}>{a.title}</span>
                {a.assignee && <span style={{color:\'#6a7a60\',fontSize:11}}>{a.assignee.name}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* CHAT PANEL */}
        <div style={{ background:\'#1a1f14\', border:\'1px solid #2a3020\', borderRadius:6, display:\'flex\', flexDirection:\'column\', height:\'calc(100vh - 120px)\' }}>
          <div style={{padding:\'12px 16px\',borderBottom:\'1px solid #2a3020\',fontFamily:\'Orbitron,sans-serif\',color:\'#c8a84b\',fontSize:12}}>LIVE CHAT</div>
          <div style={{flex:1,overflow:\'auto\',padding:12,display:\'flex\',flexDirection:\'column\',gap:8}}>
            {chatLog.map((m, i) => (
              <div key={i} style={{background:m.me?\'#234b84\':\'#0d1108\',border:\'1px solid #2a3020\',borderRadius:4,padding:\'6px 10px\'}}>
                <div style={{fontFamily:\'Rajdhani,sans-serif\',color:\'#e8d5a3\',fontSize:13}}>{m.text}</div>
                <div style={{fontFamily:\'Rajdhani,sans-serif\',color:\'#4a5a40\',fontSize:10,marginTop:2}}>{m.time}</div>
              </div>
            ))}
            {chatLog.length === 0 && <div style={{textAlign:\'center\',color:\'#4a5a40\',fontFamily:\'Rajdhani,sans-serif\',fontSize:12,marginTop:20}}>No messages yet</div>}
          </div>
          <div style={{padding:12,borderTop:\'1px solid #2a3020\',display:\'flex\',gap:8}}>
            <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key===\'Enter\' && sendChat()} placeholder="Type message..." style={{flex:1,background:\'#0d1108\',border:\'1px solid #2a3020\',borderRadius:4,padding:\'6px 10px\',color:\'#e8d5a3\',fontFamily:\'Rajdhani,sans-serif\',fontSize:13}} />
            <button onClick={sendChat} style={btnStyle(false)}>SEND</button>
          </div>
        </div>
      </div>
    </div>
  )
}
''')

print('\n✅ All frontend pages generated!')
