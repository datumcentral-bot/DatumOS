'use client'
import { useState, useEffect, useRef } from 'react'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, ToastProvider, toast } from '@/lib/mil'

const FILE_TYPES = ['PDF','RVT','IFC','NWD','DWG','DXF','XLSX','DOCX','PNG','JPG','ZIP','MP4','Other']
const CATEGORIES = ['BIM Model','Drawing','Report','Contract','Specification','Meeting Minutes','Photo','Video','Other']
const ACCESS_OPTS = ['ALL_TEAMS','RESTRICTED','INTERNAL_ONLY']

export default function FileManagerPage() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const load = () => {
    setLoading(true)
    fetch('/api/bim/cde').then(r=>r.json()).then(d => { setFiles(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('category', 'documents')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Upload failed')
      const { url, name, size } = await res.json()
      setForm(p => ({ ...p, fileUrl: url, fileName: name, fileSize: size }))
      toast(`File uploaded: ${name}`, 'success')
    } catch(err) { toast(err.message, 'error') }
    finally { setUploading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const method = form.id ? 'PUT' : 'POST'
      const url = form.id ? `/api/bim/cde/${form.id}` : '/api/bim/cde'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error(await res.text())
      toast(form.id ? 'File updated' : 'File registered', 'success')
      setModal(false); setForm({}); load()
    } catch(err) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this file record?')) return
    try {
      await fetch(`/api/bim/cde/${id}`, { method: 'DELETE' })
      toast('File deleted', 'warning')
      load()
    } catch(err) { toast(err.message, 'error') }
  }

  const filtered = files.filter(f =>
    (!filterCat || f.discipline === filterCat) &&
    (!search || JSON.stringify(f).toLowerCase().includes(search.toLowerCase()))
  )

  const getExt = (name) => name?.split('.').pop()?.toUpperCase() || '?'
  const fmtSize = (bytes) => bytes ? (bytes > 1048576 ? `${(bytes/1048576).toFixed(1)} MB` : `${(bytes/1024).toFixed(0)} KB`) : '—'

  const cols = [
    { key: 'name', label: 'FILE NAME', render: (v, row) => (
      <div>
        <div style={{ fontFamily:'monospace', fontSize:12, color:'#c8a84b' }}>{v}</div>
        {row.fileName && <div style={{ fontSize:11, color:'#6a7a60' }}>{row.fileName}</div>}
      </div>
    )},
    { key: 'discipline', label: 'DISCIPLINE' },
    { key: 'status', label: 'STATUS', render: (v) => <MilBadge status={v} /> },
    { key: 'version', label: 'VERSION' },
    { key: 'fileSize', label: 'SIZE', render: (v) => fmtSize(v) },
    { key: 'fileUrl', label: 'DOWNLOAD', render: (v, row) => v ? (
      <a href={v} download={row.fileName || 'file'} style={{ color:'#4a7c59', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:12, textDecoration:'none' }}>⬇ DOWNLOAD</a>
    ) : '—' },
    { key: 'createdAt', label: 'UPLOADED', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
  ]

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh' }}>
      <ToastProvider />
      <PageHeader title="FILE MANAGER" subtitle="Project file repository — upload, organize and download project files"
        actions={
          <div style={{ display:'flex', gap:8 }}>
            <input ref={fileRef} type="file" style={{ display:'none' }} onChange={handleUpload} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding:'8px 16px', background:'#234b84', border:'none', color:'#e8d5a3', borderRadius:4, cursor:'pointer', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:13 }}>
              {uploading ? '⏳ UPLOADING...' : '⬆ UPLOAD FILE'}
            </button>
            <MilBtn onClick={() => { setForm({}); setModal(true) }}>+ REGISTER FILE</MilBtn>
          </div>
        } />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total Files" value={files.length} color="#4a7c59" />
        <StatCard label="Published" value={files.filter(f=>f.status==='PUBLISHED').length} color="#4a7c59" />
        <StatCard label="WIP" value={files.filter(f=>f.status==='WIP').length} color="#234b84" />
        <StatCard label="Shared" value={files.filter(f=>f.status==='SHARED').length} color="#8b6914" />
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search files..." style={{ background:'#1a1f14', border:'1px solid #2a3020', color:'#e8d5a3', padding:'6px 12px', borderRadius:4, fontFamily:'Rajdhani,sans-serif', fontSize:12, width:200 }} />
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{ background:'#1a1f14', border:'1px solid #2a3020', color:'#e8d5a3', padding:'6px 12px', borderRadius:4, fontFamily:'Rajdhani,sans-serif', fontSize:12 }}>
          <option value="">ALL DISCIPLINES</option>
          {['Architecture','Structure','MEP','Civil','Federated','Other'].map(d=><option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:20 }}>
        <MilTable columns={cols} data={filtered} loading={loading}
          onEdit={(row) => { setForm({ ...row }); setModal(true) }}
          onDelete={(id) => handleDelete(id)}
          emptyMsg="No files registered. Upload files or register existing ones." />
      </div>
      <MilModal open={modal} onClose={() => { setModal(false); setForm({}) }} title={form.id ? 'EDIT FILE RECORD' : 'REGISTER FILE'} width={680}>
        <form onSubmit={handleSubmit}>
          <FormField label="Document Name / Code" required>
            <MilInput value={form.name} onChange={f('name')} placeholder="e.g. ARITC-ARC-ZZ-XX-M3-A-0001" required />
          </FormField>
          <FormRow>
            <FormField label="Discipline">
              <MilSelect value={form.discipline} onChange={f('discipline')} options={['Architecture','Structure','MEP','Civil','Landscape','Federated','Other']} placeholder="Select..." />
            </FormField>
            <FormField label="Status">
              <MilSelect value={form.status} onChange={f('status')} options={['WIP','SHARED','PUBLISHED','ARCHIVED']} placeholder="Select..." />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Version">
              <MilInput value={form.version} onChange={f('version')} placeholder="v001" />
            </FormField>
            <FormField label="File Type">
              <MilSelect value={form.fileType} onChange={f('fileType')} options={FILE_TYPES} placeholder="Select..." />
            </FormField>
          </FormRow>
          {form.fileUrl && (
            <div style={{ background:'#0d1108', border:'1px solid #4a7c59', borderRadius:4, padding:'8px 12px', marginBottom:16, fontFamily:'Rajdhani,sans-serif', fontSize:12, color:'#4a7c59' }}>
              ✓ File uploaded: {form.fileName} ({fmtSize(form.fileSize)})
            </div>
          )}
          <FormField label="File URL (or upload above)">
            <MilInput value={form.fileUrl} onChange={f('fileUrl')} placeholder="https://... or upload above" />
          </FormField>
          <FormField label="Notes">
            <MilInput value={form.notes} onChange={f('notes')} placeholder="Additional notes..." />
          </FormField>
          <FormActions onCancel={() => { setModal(false); setForm({}) }} loading={saving} />
        </form>
      </MilModal>
    </div>
  )
}
