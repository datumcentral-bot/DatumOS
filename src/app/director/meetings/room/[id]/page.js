'use client'
import { useState, useEffect } from 'react'
import { MilBtn, ToastProvider, toast } from '@/lib/mil'
import { useParams } from 'next/navigation'
// The shared real-time suite (multi-party video, screen share, live chat)
// reused from the /live routes - one component, all rooms.
import LiveRoom from '@/app/director/live/room/[id]/page'

export default function MeetingRoom() {
  const { id } = useParams()
  const [meeting, setMeeting] = useState(null)
  const [source, setSource] = useState(null) // 'bim' (BimMeeting) | 'meeting' (Meeting)
  const [minutes, setMinutes] = useState('')
  const [actionTitle, setActionTitle] = useState('')
  const [actionItems, setActionItems] = useState([])
  const [saving, setSaving] = useState(false)

  // Rooms can be entered from the meetings list (BimMeeting ids) or from
  // /director/screen (Meeting ids). Resolve the record from either table.
  useEffect(() => {
    let dead = false
    ;(async () => {
      try {
        const r = await fetch(`/api/bim-meetings/${id}`)
        if (r.ok) {
          const m = await r.json()
          if (dead) return
          setSource('bim'); setMeeting(m)
          setMinutes(m.minutes || '')
          setActionItems(String(m.actionItems || '').split('\n').map(s => s.trim()).filter(Boolean))
          return
        }
      } catch {}
      try {
        const r = await fetch(`/api/meetings/${id}`)
        if (r.ok) {
          const m = await r.json()
          if (dead) return
          setSource('meeting'); setMeeting(m)
          setActionItems(Array.isArray(m.actionItems) ? m.actionItems : [])
          setMinutes((Array.isArray(m.minutes) ? m.minutes : []).map(mn => mn.content).join('\n\n'))
        }
      } catch {}
    })()
    return () => { dead = true }
  }, [id])

  const saveMinutes = async () => {
    setSaving(true)
    try {
      if (source === 'bim') {
        const res = await fetch(`/api/bim-meetings/${id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, minutes })
        })
        if (!res.ok) throw new Error(((await res.json()).error) || 'Save failed')
      } else {
        const res = await fetch(`/api/meeting-minutes`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingId: id, section: 'Meeting Minutes', content: minutes, orderIndex: 1 })
        })
        if (!res.ok) throw new Error(((await res.json()).error) || 'Save failed')
      }
      toast('Minutes saved')
    } catch (e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const addActionItem = async () => {
    const title = actionTitle.trim()
    if (!title) return
    try {
      if (source === 'bim') {
        const next = [...actionItems, title]
        const res = await fetch(`/api/bim-meetings/${id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, actionItems: next.join('\n') })
        })
        if (!res.ok) throw new Error(((await res.json()).error) || 'Save failed')
        setActionItems(next)
      } else {
        const res = await fetch('/api/action-items', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingId: id, title, status: 'OPEN' })
        })
        if (!res.ok) throw new Error(((await res.json()).error) || 'Save failed')
        const item = await res.json()
        setActionItems(a => [...a, item])
      }
      setActionTitle('')
      toast('Action item added')
    } catch (e) { toast(e.message, 'error') }
  }

  const panel = { background: '#1a1f14', border: '1px solid #2a3020', borderRadius: 6, padding: 16 }
  const head = { fontFamily: 'Orbitron,sans-serif', color: '#c8a84b', fontSize: 12, marginBottom: 12 }
  const btnStyle = { padding: '8px 16px', background: '#1a1f14', border: '1px solid #4a7c59', color: '#e8d5a3', borderRadius: 4, cursor: 'pointer', fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 12 }
  const itemTitle = (a) => (typeof a === 'string' ? a : (a?.title || ''))

  return (
    <div style={{ background: '#0d1108', minHeight: '100vh', padding: 16 }}>
      <ToastProvider />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 16, alignItems: 'start' }}>
        {/* REAL multi-party room: LiveKit video, screen share, live chat.
            Room name = this meeting's id, so each meeting gets its own room. */}
        <div style={{ minWidth: 0 }}>
          <LiveRoom />
        </div>

        {/* Meeting workspace: minutes + action items (persisted via APIs). */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={panel}>
            <div style={head}>MEETING</div>
            <div style={{ fontFamily: 'Rajdhani,sans-serif', color: '#e8d5a3', fontSize: 15, fontWeight: 700 }}>
              {meeting ? (meeting.title || 'Untitled') : 'Loading...'}
            </div>
            <div style={{ fontFamily: 'Rajdhani,sans-serif', color: '#6a7a60', fontSize: 12, marginTop: 4 }}>
              {meeting?.date ? new Date(meeting.date).toLocaleString() : ''}
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <MilBtn onClick={() => window.open('/live', '_blank')}>Open live suite</MilBtn>
            </div>
          </div>

          {/* MINUTES */}
          <div style={panel}>
            <div style={head}>MEETING MINUTES</div>
            <textarea value={minutes} onChange={e => setMinutes(e.target.value)} rows={6}
              placeholder="Type meeting minutes here..."
              style={{ width: '100%', background: '#0d1108', border: '1px solid #2a3020', borderRadius: 4, padding: '8px 12px', color: '#e8d5a3', fontFamily: 'Rajdhani,sans-serif', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
            <button onClick={saveMinutes} disabled={saving || !source} style={{ ...btnStyle, marginTop: 8 }}>
              {saving ? 'SAVING...' : 'SAVE MINUTES'}
            </button>
          </div>

          {/* ACTION ITEMS */}
          <div style={panel}>
            <div style={head}>ACTION ITEMS</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input value={actionTitle} onChange={e => setActionTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addActionItem()}
                placeholder="Add action item..."
                style={{ flex: 1, minWidth: 0, background: '#0d1108', border: '1px solid #2a3020', borderRadius: 4, padding: '6px 10px', color: '#e8d5a3', fontFamily: 'Rajdhani,sans-serif', fontSize: 13 }} />
              <button onClick={addActionItem} disabled={!source} style={btnStyle}>+ ADD</button>
            </div>
            {actionItems.length === 0 && (
              <div style={{ fontFamily: 'Rajdhani,sans-serif', color: '#4a5a40', fontSize: 12 }}>No action items yet.</div>
            )}
            {actionItems.map((a, i) => (
              <div key={(typeof a === 'object' && a?.id) || i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #1a1f14' }}>
                <span style={{ color: '#4a7c59', fontSize: 14 }}>&#9633;</span>
                <span style={{ fontFamily: 'Rajdhani,sans-serif', color: '#c8c8b0', fontSize: 13, flex: 1 }}>{itemTitle(a)}</span>
                {typeof a === 'object' && a?.assignee?.name && <span style={{ color: '#6a7a60', fontSize: 11 }}>{a.assignee.name}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
