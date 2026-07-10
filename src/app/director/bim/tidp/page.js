'use client'
import { useSocket } from '@/lib/useSocket';
import LiveToast from '@/components/LiveToast';
import OnlineUsers from '@/components/OnlineUsers';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilTextarea, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from '@/lib/mil'

const STATUS_OPTS = ['DRAFT','IN_PROGRESS','SHARED','PUBLISHED','ARCHIVED']
const LOD_OPTS = ['LOD 100','LOD 200','LOD 300','LOD 350','LOD 400','LOD 500']
const EMPTY = { midpId:'', projectId:'', title:'', discipline:'', version:'1.0', status:'DRAFT', taskTeam:'', description:'' }
const ITEM_EMPTY = { title:'', element:'', format:'RVT', lodRequired:'LOD 300', status:'PENDING', plannedDate:'', responsible:'', notes:'' }

export default function TidpPage() {
  const { data: tidps, loading, load, create, update, remove } = useCrud('/api/bim/tidp')
  

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
  const { isConnected, onlineUsers, emitCrud } = useSocket('tidp', session?.user, handleLiveEvent);
const [midps, setMidps] = useState([])
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState(null)
  const [items, setItems] = useState([])
  const [itemModal, setItemModal] = useState(false)
  const [itemEditing, setItemEditing] = useState(null)
  const [itemForm, setItemForm] = useState(ITEM_EMPTY)
  const [itemSaving, setItemSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/bim/midp').then(r=>r.json()),
      fetch('/api/pm-projects').then(r=>r.json())
    ]).then(([m, p]) => {
      setMidps(Array.isArray(m) ? m : [])
      setProjects(Array.isArray(p?.projects) ? p.projects : Array.isArray(p) ? p : [])
    })
  }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setModal(true) }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) { const _updated = await update(editing.id, form); emitCrud('updated', _updated || form); }
      else { const _created = await create(form); emitCrud('created', _created || form); }
      setModal(false)
    } catch(err) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const openItems = async (tidp) => {
    setSelected(tidp)
    const d = await fetch(`/api/bim/tidp/${tidp.id}`).then(r=>r.json())
    setItems(d.items || [])
  }

  const saveItem = async (e) => {
    e.preventDefault(); setItemSaving(true)
    try {
      const url = itemEditing ? `/api/bim/tidp/${selected.id}/items/${itemEditing.id}` : `/api/bim/tidp/${selected.id}/items`
      const method = itemEditing ? 'PUT' : 'POST'
      await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify({...itemForm, tidpId: selected.id}) })
      toast(itemEditing ? 'Item updated' : 'Item added', 'success')
      setItemModal(false)
      const d = await fetch(`/api/bim/tidp/${selected.id}`).then(r=>r.json())
      setItems(d.items || [])
    } catch(err) { toast(err.message, 'error') }
    finally { setItemSaving(false) }
  }

  const delItem = async (id) => {
    await fetch(`/api/bim/tidp/${selected.id}/items/${id}`, { method:'DELETE' })
    toast('Item deleted', 'success')
    const d = await fetch(`/api/bim/tidp/${selected.id}`).then(r=>r.json())
    setItems(d.items || [])
  }

  const itf = (k) => (v) => setItemForm(p => ({ ...p, [k]: v }))

  const cols = [
    { key: 'title', label: 'TIDP TITLE' },
    { key: 'discipline', label: 'DISCIPLINE' },
    { key: 'midp', label: 'MIDP', render: (v) => v?.title || '—' },
    { key: 'taskTeam', label: 'TASK TEAM' },
    { key: 'status', label: 'STATUS', render: (v) => <MilBadge status={v} /> },
    { key: 'version', label: 'VER' },
    { key: 'items', label: 'ITEMS', render: (v, row) => (
      <MilBtn size="sm" onClick={() => openItems(row)}>{row.items?.length || 0} items</MilBtn>
    )}
  ]

  const itemCols = [
    { key: 'title', label: 'ITEM' },
    { key: 'element', label: 'ELEMENT' },
    { key: 'format', label: 'FORMAT' },
    { key: 'lodRequired', label: 'LOD' },
    { key: 'responsible', label: 'RESPONSIBLE' },
    { key: 'status', label: 'STATUS', render: (v) => <MilBadge status={v} /> },
    { key: 'plannedDate', label: 'PLANNED', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
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

      <PageHeader title="TIDP" subtitle="Task Information Delivery Plan — task-team level deliverables linked to MIDP"
        actions={<MilBtn onClick={openNew}>+ NEW TIDP</MilBtn>} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total TIDPs" value={tidps.length} color="#4a7c59" />
        <StatCard label="In Progress" value={tidps.filter(i=>i.status==='IN_PROGRESS').length} color="#8b6914" />
        <StatCard label="Published" value={tidps.filter(i=>i.status==='PUBLISHED').length} color="#4a7c59" />
        <StatCard label="Total Items" value={tidps.reduce((a,i)=>a+(i.items?.length||0),0)} color="#c8a84b" />
      </div>

      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={tidps} loading={loading} onEdit={openEdit} onDelete={async (id) => { await remove(id); emitCrud('deleted', { id }); }} emptyMsg="No TIDPs found. Create your first Task Information Delivery Plan." />
      </div>

      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT TIDP' : 'NEW TASK INFORMATION DELIVERY PLAN'} width={800}>
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField label="TIDP Title" required><MilInput value={form.title} onChange={f('title')} placeholder="e.g. Architectural TIDP — Tower A" required /></FormField>
            <FormField label="Discipline"><MilInput value={form.discipline} onChange={f('discipline')} placeholder="Architecture, Structure, MEP..." /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Parent MIDP">
              <MilSelect value={form.midpId} onChange={f('midpId')} options={midps.map(m=>({value:m.id,label:m.title}))} placeholder="Select MIDP..." />
            </FormField>
            <FormField label="Project">
              <MilSelect value={form.projectId} onChange={f('projectId')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Task Team"><MilInput value={form.taskTeam} onChange={f('taskTeam')} placeholder="e.g. FIRE Architecture Team" /></FormField>
            <FormField label="Status"><MilSelect value={form.status} onChange={f('status')} options={STATUS_OPTS} /></FormField>
          </FormRow>
          <FormField label="Description"><MilTextarea value={form.description} onChange={f('description')} placeholder="Scope of this TIDP..." rows={3} /></FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} submitLabel={editing ? 'UPDATE TIDP' : 'CREATE TIDP'} />
        </form>
      </MilModal>

      {selected && (
        <MilModal open={!!selected} onClose={() => setSelected(null)} title={`ITEMS — ${selected.title}`} width={900}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <span style={{ fontFamily:'Rajdhani,sans-serif', color:'#6a7a60', fontSize:13 }}>{items.length} items in this TIDP</span>
            <MilBtn onClick={() => { setItemEditing(null); setItemForm(ITEM_EMPTY); setItemModal(true) }}>+ ADD ITEM</MilBtn>
          </div>
          <MilTable columns={itemCols} data={items}
            onEdit={(row) => { setItemEditing(row); setItemForm({...row, plannedDate:row.plannedDate?.slice(0,10)||''}); setItemModal(true) }}
            onDelete={delItem}
            emptyMsg="No items yet — add your first TIDP item" />
        </MilModal>
      )}

      <MilModal open={itemModal} onClose={() => setItemModal(false)} title={itemEditing ? 'EDIT ITEM' : 'ADD TIDP ITEM'} width={700}>
        <form onSubmit={saveItem}>
          <FormRow>
            <FormField label="Item Title" required><MilInput value={itemForm.title} onChange={itf('title')} placeholder="e.g. Interior Walls — Level 1" required /></FormField>
            <FormField label="Element"><MilInput value={itemForm.element} onChange={itf('element')} placeholder="e.g. Interior Walls" /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Format"><MilSelect value={itemForm.format} onChange={itf('format')} options={['RVT','IFC','DWG','PDF','NWD','NWC']} /></FormField>
            <FormField label="LOD Required"><MilSelect value={itemForm.lodRequired} onChange={itf('lodRequired')} options={LOD_OPTS} /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Responsible"><MilInput value={itemForm.responsible} onChange={itf('responsible')} placeholder="Team or person responsible" /></FormField>
            <FormField label="Status"><MilSelect value={itemForm.status} onChange={itf('status')} options={STATUS_OPTS} /></FormField>
          </FormRow>
          <FormField label="Planned Date"><MilInput type="date" value={itemForm.plannedDate} onChange={itf('plannedDate')} /></FormField>
          <FormField label="Notes"><MilTextarea value={itemForm.notes} onChange={itf('notes')} rows={2} /></FormField>
          <FormActions onCancel={() => setItemModal(false)} loading={itemSaving} submitLabel={itemEditing ? 'UPDATE' : 'ADD ITEM'} />
        </form>
      </MilModal>
    </div>
  )
}
