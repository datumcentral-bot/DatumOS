'use client'
import { useSocket } from '@/lib/useSocket';
import LiveToast from '@/components/LiveToast';
import OnlineUsers from '@/components/OnlineUsers';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilTextarea, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast, useCrud } from '@/lib/mil'

const TYPE_OPTS = ['INVOICE','PAYMENT','EXPENSE','BUDGET','VARIATION','RETENTION','ADVANCE']
const STATUS_OPTS = ['DRAFT','SENT','PAID','OVERDUE','CANCELLED','PARTIAL']
const CURRENCY_OPTS = ['AED','USD','GBP','EUR','SAR','QAR','KWD']
const EMPTY = { projectId:'', clientId:'', type:'INVOICE', title:'', amount:'', currency:'AED', status:'DRAFT', dueDate:'', invoiceNo:'', notes:'' }

export default function FinancialControlPage() {
  const { data, loading, create, update, remove } = useCrud('/api/financial')
  

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
  const { isConnected, onlineUsers, emitCrud } = useSocket('financial', session?.user, handleLiveEvent);
const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')

  useEffect(() => {
    fetch('/api/projects').then(r=>r.json()).then(setProjects)
    fetch('/api/clients').then(r=>r.json()).then(setClients)
  }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row, dueDate: row.dueDate ? row.dueDate.split('T')[0] : '', amount: String(row.amount) }); setModal(true) }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, amount: parseFloat(form.amount) || 0, dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null }
      if (editing) { const _updated = await update(editing.id, payload); emitCrud('updated', _updated || form); }
      else { const _created = await create(payload); emitCrud('created', _created || form); }
      setModal(false)
    } catch(err) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const filtered = data.filter(d =>
    (!filterStatus || d.status === filterStatus) &&
    (!filterType || d.type === filterType)
  )

  const totalInvoiced = data.filter(d=>d.type==='INVOICE').reduce((s,d)=>s+d.amount,0)
  const totalPaid = data.filter(d=>d.status==='PAID').reduce((s,d)=>s+d.amount,0)
  const totalOutstanding = data.filter(d=>['SENT','OVERDUE'].includes(d.status)).reduce((s,d)=>s+d.amount,0)

  const fmt = (n) => n.toLocaleString('en-AE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const cols = [
    { key: 'invoiceNo', label: 'REF NO' },
    { key: 'title', label: 'DESCRIPTION' },
    { key: 'type', label: 'TYPE', render: (v) => <MilBadge status={v} label={v} /> },
    { key: 'amount', label: 'AMOUNT', render: (v, row) => `${row.currency} ${fmt(v)}` },
    { key: 'status', label: 'STATUS', render: (v) => <MilBadge status={v} /> },
    { key: 'dueDate', label: 'DUE DATE', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'client', label: 'CLIENT', render: (v) => v?.companyName || '—' },
    { key: 'project', label: 'PROJECT', render: (v) => v?.name || '—' },
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

      <PageHeader title="FINANCIAL CONTROL" subtitle="Budget tracking, invoices, payments and cost control"
        actions={<MilBtn onClick={openNew}>+ NEW ENTRY</MilBtn>} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total Invoiced" value={`AED ${fmt(totalInvoiced)}`} color="#4a7c59" />
        <StatCard label="Collected" value={`AED ${fmt(totalPaid)}`} color="#4a7c59" />
        <StatCard label="Outstanding" value={`AED ${fmt(totalOutstanding)}`} color="#8b6914" />
        <StatCard label="Overdue" value={data.filter(d=>d.status==='OVERDUE').length} color="#8b1a1a" />
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{ background:'#1a1f14', border:'1px solid #2a3020', color:'#e8d5a3', padding:'6px 12px', borderRadius:4, fontFamily:'Rajdhani,sans-serif', fontSize:12 }}>
          <option value="">ALL TYPES</option>
          {TYPE_OPTS.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ background:'#1a1f14', border:'1px solid #2a3020', color:'#e8d5a3', padding:'6px 12px', borderRadius:4, fontFamily:'Rajdhani,sans-serif', fontSize:12 }}>
          <option value="">ALL STATUSES</option>
          {STATUS_OPTS.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={filtered} loading={loading} onEdit={openEdit} onDelete={async (id) => { await remove(id); emitCrud('deleted', { id }); }} emptyMsg="No financial entries. Add invoices, payments or expenses." />
      </div>
      <MilModal open={modal} onClose={() => setModal(false)} title={editing ? 'EDIT ENTRY' : 'NEW FINANCIAL ENTRY'} width={720}>
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField label="Type">
              <MilSelect value={form.type} onChange={f('type')} options={TYPE_OPTS} />
            </FormField>
            <FormField label="Invoice / Ref No">
              <MilInput value={form.invoiceNo} onChange={f('invoiceNo')} placeholder="e.g. INV-2026-001" />
            </FormField>
          </FormRow>
          <FormField label="Description" required>
            <MilInput value={form.title} onChange={f('title')} placeholder="e.g. BIM Modeling Services — Phase 1" required />
          </FormField>
          <FormRow>
            <FormField label="Amount" required>
              <MilInput type="number" value={form.amount} onChange={f('amount')} placeholder="0.00" required />
            </FormField>
            <FormField label="Currency">
              <MilSelect value={form.currency} onChange={f('currency')} options={CURRENCY_OPTS} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Status">
              <MilSelect value={form.status} onChange={f('status')} options={STATUS_OPTS} />
            </FormField>
            <FormField label="Due Date">
              <MilInput type="date" value={form.dueDate} onChange={f('dueDate')} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Client">
              <MilSelect value={form.clientId} onChange={f('clientId')} options={clients.map(c=>({value:c.id,label:c.companyName}))} placeholder="Select client..." />
            </FormField>
            <FormField label="Project">
              <MilSelect value={form.projectId} onChange={f('projectId')} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." />
            </FormField>
          </FormRow>
          <FormField label="Notes">
            <MilTextarea value={form.notes} onChange={f('notes')} placeholder="Payment terms, notes..." rows={2} />
          </FormField>
          <FormActions onCancel={() => setModal(false)} loading={saving} />
        </form>
      </MilModal>
    </div>
  )
}
