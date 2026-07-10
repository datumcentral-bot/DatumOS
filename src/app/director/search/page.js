'use client'
import { useState, useEffect, useCallback } from 'react'
import { MilBadge, MilSpinner, PageHeader, ToastProvider } from '@/lib/mil'
import Link from 'next/link'

export default function SearchPage() {
  const [q, setQ] = useState('')
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
      <div style={{ fontFamily:'Orbitron,sans-serif', color:'#c8a84b', fontSize:12, letterSpacing:2, marginBottom:12, paddingBottom:8, borderBottom:'1px solid #2a3020' }}>{title} ({items.length})</div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>{items.map(renderItem)}</div>
    </div>
  ) : null

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh' }}>
      <ToastProvider />
      <PageHeader title="GLOBAL SEARCH" subtitle="Search across clients, projects, tasks, documents, and meetings" />
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search everything... (min 2 characters)" autoFocus
          style={{ width:'100%', background:'#1a1f14', border:'1px solid #4a7c59', borderRadius:6, padding:'14px 20px', color:'#e8d5a3', fontFamily:'Rajdhani,sans-serif', fontSize:16, outline:'none', boxSizing:'border-box', marginBottom:24 }} />
        {loading && <MilSpinner />}
        {results && !loading && (
          <div>
            <Section title="CLIENTS" items={results.clients} renderItem={c => (
              <Link key={c.id} href="/director/clients" style={{ display:'block', background:'#1a1f14', border:'1px solid #2a3020', borderRadius:4, padding:'10px 16px', textDecoration:'none', color:'#e8d5a3', fontFamily:'Rajdhani,sans-serif' }}>
                <div style={{fontWeight:700}}>{c.companyName}</div>
                <div style={{color:'#6a7a60',fontSize:12}}>{c.industry}</div>
              </Link>
            )} />
            <Section title="PROJECTS" items={results.projects} renderItem={p => (
              <Link key={p.id} href="/director/client-projects" style={{ display:'block', background:'#1a1f14', border:'1px solid #2a3020', borderRadius:4, padding:'10px 16px', textDecoration:'none', color:'#e8d5a3', fontFamily:'Rajdhani,sans-serif' }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontWeight:700}}>{p.name}</div>
                  <MilBadge status={p.status} />
                </div>
                <div style={{color:'#6a7a60',fontSize:12}}>{p.code}</div>
              </Link>
            )} />
            <Section title="TASKS" items={results.tasks} renderItem={t => (
              <Link key={t.id} href="/director/tasks" style={{ display:'block', background:'#1a1f14', border:'1px solid #2a3020', borderRadius:4, padding:'10px 16px', textDecoration:'none', color:'#e8d5a3', fontFamily:'Rajdhani,sans-serif' }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontWeight:700}}>{t.title}</div>
                  <div style={{display:'flex',gap:6}}><MilBadge status={t.priority} /><MilBadge status={t.status} /></div>
                </div>
              </Link>
            )} />
            <Section title="CDE DOCUMENTS" items={results.cdeDocs} renderItem={d => (
              <Link key={d.id} href="/director/bim/cde" style={{ display:'block', background:'#1a1f14', border:'1px solid #2a3020', borderRadius:4, padding:'10px 16px', textDecoration:'none', color:'#e8d5a3', fontFamily:'Rajdhani,sans-serif' }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontWeight:700,fontFamily:'monospace',fontSize:12}}>{d.name}</div>
                  <MilBadge status={d.status} />
                </div>
                <div style={{color:'#6a7a60',fontSize:12}}>{d.discipline}</div>
              </Link>
            )} />
            <Section title="MEETINGS" items={results.meetings} renderItem={m => (
              <Link key={m.id} href="/director/meetings" style={{ display:'block', background:'#1a1f14', border:'1px solid #2a3020', borderRadius:4, padding:'10px 16px', textDecoration:'none', color:'#e8d5a3', fontFamily:'Rajdhani,sans-serif' }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontWeight:700}}>{m.title}</div>
                  <MilBadge status={m.status} />
                </div>
                <div style={{color:'#6a7a60',fontSize:12}}>{new Date(m.scheduledAt).toLocaleDateString()}</div>
              </Link>
            )} />
            {Object.values(results).every(v => !v?.length) && (
              <div style={{textAlign:'center',padding:40,color:'#4a5a40',fontFamily:'Rajdhani,sans-serif'}}>No results found for "{q}"</div>
            )}
          </div>
        )}
        {!q && <div style={{textAlign:'center',padding:60,color:'#4a5a40',fontFamily:'Rajdhani,sans-serif',fontSize:14}}>Start typing to search across all DatumOS data...</div>}
      </div>
    </div>
  )
}
