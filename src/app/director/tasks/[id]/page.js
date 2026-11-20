'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MilModal, MilTable, MilBadge, MilBtn, MilInput, MilTextarea, MilSelect, FormField, FormRow, FormActions, PageHeader, StatCard, MilTabs, ProgressBar, ToastProvider, toast } from '@/lib/mil'

const C = {
  orbit: 'Orbitron,monospace', rajd: 'Rajdhani,sans-serif',
  olive: '#4a7c59', gold: '#c8a84b', panel: '#1a1f14', border: '#2a3020',
  dim: '#6a7a60', ok: '#4a7c59', warn: '#8b6914', danger: '#8b1a1a', info: '#234b84',
  text: '#e8d5a3', faint: '#4a5a40'
}

export default function TaskDetailPage() {
  return <ToastProvider><TaskDetailInner /></ToastProvider>
}

function TaskDetailInner() {
  const { id } = useParams()
  const router = useRouter()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [comments, setComments] = useState([])
  const [subtasks, setSubtasks] = useState([])
  const [timeEntries, setTimeEntries] = useState([])
  const [tags, setTags] = useState([])
  const [allTags, setAllTags] = useState([])
  const [newComment, setNewComment] = useState('')
  const [newSubtask, setNewSubtask] = useState('')
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerStart, setTimerStart] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef(null)
  const [editForm, setEditForm] = useState(null)
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [t, c, s, te, tg, p, u] = await Promise.all([
        fetch(`/api/pm-tasks?id=${id}`).then(r=>r.json()),
        fetch(`/api/comments?entityType=TASK&entityId=${id}`).then(r=>r.json()),
        fetch(`/api/pm-tasks?parentId=${id}`).then(r=>r.json()),
        fetch(`/api/time-entries?taskId=${id}`).then(r=>r.json()),
        fetch(`/api/tags`).then(r=>r.json()),
        fetch('/api/pm-projects').then(r=>r.json()),
        fetch('/api/team').then(r=>r.json()),
      ])
      const taskData = Array.isArray(t) ? t.find(x=>x.id===id) : t
      setTask(taskData)
      setComments(Array.isArray(c) ? c : [])
      setSubtasks(Array.isArray(s) ? s : [])
      setTimeEntries(Array.isArray(te) ? te : [])
      setAllTags(Array.isArray(tg) ? tg : [])
      setProjects(Array.isArray(p?.projects) ? p.projects : Array.isArray(p) ? p : [])
      setUsers(Array.isArray(u) ? u : [])
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  // Timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [timerRunning])

  const startTimer = () => { setTimerStart(new Date()); setTimerRunning(true); setElapsed(0) }
  const stopTimer = async () => {
    setTimerRunning(false)
    const duration = Math.round(elapsed / 60) // minutes
    if (duration < 1) return
    await fetch('/api/time-entries', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ taskId: id, duration, startedAt: timerStart, description: 'Timer entry' })
    })
    toast(`Logged ${duration} minutes`, 'success')
    const te = await fetch(`/api/time-entries?taskId=${id}`).then(r=>r.json())
    setTimeEntries(Array.isArray(te) ? te : [])
  }

  const formatTime = (s) => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const addComment = async () => {
    if (!newComment.trim()) return
    await fetch('/api/comments', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ entityType: 'TASK', entityId: id, content: newComment })
    })
    toast('Comment added', 'success')
    setNewComment('')
    const c = await fetch(`/api/comments?entityType=TASK&entityId=${id}`).then(r=>r.json())
    setComments(Array.isArray(c) ? c : [])
  }

  const addSubtask = async () => {
    if (!newSubtask.trim()) return
    await fetch('/api/pm-tasks', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ title: newSubtask, parentId: id, status: 'TODO', priority: 'MEDIUM', projectId: task?.projectId })
    })
    toast('Subtask added', 'success')
    setNewSubtask('')
    const s = await fetch(`/api/pm-tasks?parentId=${id}`).then(r=>r.json())
    setSubtasks(Array.isArray(s) ? s : [])
  }

  const updateStatus = async (status) => {
    await fetch('/api/pm-tasks', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, status }) })
    toast('Status updated', 'success')
    setTask(t => ({ ...t, status }))
  }

  const saveEdit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await fetch('/api/pm-tasks', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(editForm) })
      toast('Task updated', 'success')
      setEditForm(null)
      load()
    } catch(err) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const totalMinutes = timeEntries.reduce((a, e) => a + (e.duration || 0), 0)
  const subtaskDone = subtasks.filter(s => s.status === 'DONE').length

  if (loading) return <div style={{ padding:24, color: C.dim, fontFamily: C.rajd }}>Loading task...</div>
  if (!task) return <div style={{ padding:24, color: C.danger, fontFamily: C.rajd }}>Task not found. <button onClick={() => router.back()} style={{ color: C.gold, background:'none', border:'none', cursor:'pointer', fontFamily: C.rajd }}>← Back</button></div>

  return (
    <div style={{ padding:24, background:'#0d1108', minHeight:'100vh' }}>
      <ToastProvider />
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <button onClick={() => router.back()} style={{ background:'none', border:`1px solid ${C.border}`, color: C.dim, padding:'6px 12px', borderRadius:4, cursor:'pointer', fontFamily: C.rajd, fontWeight:700, fontSize:12 }}>← BACK</button>
        <h1 style={{ fontFamily: C.orbit, color: C.gold, fontSize:18, margin:0, letterSpacing:2 }}>{task.title}</h1>
        <MilBadge status={task.status} />
        <MilBadge status={task.priority} label={task.priority} />
      </div>

      {/* Quick status change */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {['TODO','IN_PROGRESS','IN_REVIEW','DONE'].map(s => (
          <button key={s} onClick={() => updateStatus(s)} style={{ padding:'4px 12px', background: task.status===s ? C.olive : 'transparent', border:`1px solid ${C.border}`, color: task.status===s ? C.text : C.dim, borderRadius:4, cursor:'pointer', fontFamily: C.rajd, fontWeight:700, fontSize:12, letterSpacing:1 }}>
            {s.replace(/_/g,' ')}
          </button>
        ))}
        <div style={{ marginLeft:'auto' }}>
          <MilBtn onClick={() => setEditForm({ ...task, dueDate: task.dueDate?.slice(0,10)||'' })}>EDIT TASK</MilBtn>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Project" value={task.project?.name || '—'} color={C.olive} />
        <StatCard label="Assignee" value={task.assignee?.name || 'Unassigned'} color={C.gold} />
        <StatCard label="Time Logged" value={`${Math.floor(totalMinutes/60)}h ${totalMinutes%60}m`} color={C.info} />
        <StatCard label="Subtasks" value={`${subtaskDone}/${subtasks.length}`} color={C.warn} />
      </div>

      {subtasks.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <ProgressBar value={subtaskDone} max={subtasks.length} label={`Subtask Progress — ${subtaskDone}/${subtasks.length} done`} color={C.olive} />
        </div>
      )}

      <MilTabs
        tabs={[
          { id:'overview', label:'Overview' },
          { id:'subtasks', label:'Subtasks', count: subtasks.length },
          { id:'comments', label:'Comments', count: comments.length },
          { id:'time', label:'Time Tracking', count: timeEntries.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'overview' && (
        <div style={{ background: C.panel, border:`1px solid ${C.border}`, borderRadius:6, padding:20 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            <div>
              <p style={{ fontFamily: C.rajd, color: C.dim, fontSize:12, fontWeight:700, marginBottom:4 }}>DESCRIPTION</p>
              <p style={{ fontFamily: C.rajd, color: C.text, fontSize:14, whiteSpace:'pre-wrap' }}>{task.description || 'No description provided.'}</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                ['DUE DATE', task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'],
                ['PRIORITY', task.priority],
                ['ESTIMATED HRS', task.estimatedHrs ? `${task.estimatedHrs}h` : '—'],
                ['CREATED', new Date(task.createdAt).toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={label}>
                  <p style={{ fontFamily: C.rajd, color: C.dim, fontSize:11, fontWeight:700, margin:0 }}>{label}</p>
                  <p style={{ fontFamily: C.rajd, color: C.text, fontSize:14, margin:'2px 0 0' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'subtasks' && (
        <div style={{ background: C.panel, border:`1px solid ${C.border}`, borderRadius:6, padding:20 }}>
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
            <MilInput value={newSubtask} onChange={v => setNewSubtask(v)} placeholder="Add subtask title..." />
            <MilBtn onClick={addSubtask}>+ ADD</MilBtn>
          </div>
          {subtasks.length === 0 ? (
            <p style={{ fontFamily: C.rajd, color: C.dim, textAlign:'center', padding:20 }}>No subtasks yet</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {subtasks.map(s => (
                <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 12px', background:'rgba(255,255,255,0.02)', border:`1px solid ${C.border}`, borderRadius:4 }}>
                  <input type="checkbox" checked={s.status==='DONE'} onChange={async () => {
                    const newStatus = s.status === 'DONE' ? 'TODO' : 'DONE'
                    await fetch('/api/pm-tasks', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: s.id, status: newStatus }) })
                    const sub = await fetch(`/api/pm-tasks?parentId=${id}`).then(r=>r.json())
                    setSubtasks(Array.isArray(sub) ? sub : [])
                  }} style={{ cursor:'pointer' }} />
                  <span style={{ fontFamily: C.rajd, color: s.status==='DONE' ? C.dim : C.text, fontSize:14, textDecoration: s.status==='DONE' ? 'line-through' : 'none', flex:1 }}>{s.title}</span>
                  <MilBadge status={s.priority} label={s.priority} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'comments' && (
        <div style={{ background: C.panel, border:`1px solid ${C.border}`, borderRadius:6, padding:20 }}>
          <div style={{ display:'flex', gap:8, marginBottom:20 }}>
            <MilTextarea value={newComment} onChange={v => setNewComment(v)} placeholder="Write a comment..." rows={2} />
            <MilBtn onClick={addComment}>POST</MilBtn>
          </div>
          {comments.length === 0 ? (
            <p style={{ fontFamily: C.rajd, color: C.dim, textAlign:'center', padding:20 }}>No comments yet</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {comments.map(c => (
                <div key={c.id} style={{ padding:'12px 16px', background:'rgba(255,255,255,0.02)', border:`1px solid ${C.border}`, borderRadius:4 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontFamily: C.orbit, color: C.gold, fontSize:11 }}>{c.author?.name || 'Unknown'}</span>
                    <span style={{ fontFamily: C.rajd, color: C.dim, fontSize:12 }}>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p style={{ fontFamily: C.rajd, color: C.text, fontSize:14, margin:0, whiteSpace:'pre-wrap' }}>{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'time' && (
        <div style={{ background: C.panel, border:`1px solid ${C.border}`, borderRadius:6, padding:20 }}>
          {/* Timer */}
          <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px', background:'rgba(255,255,255,0.03)', border:`1px solid ${C.border}`, borderRadius:6, marginBottom:20 }}>
            <div style={{ fontFamily: C.orbit, color: timerRunning ? C.gold : C.dim, fontSize:24, letterSpacing:4 }}>{formatTime(elapsed)}</div>
            {!timerRunning ? (
              <MilBtn onClick={startTimer}>▶ START TIMER</MilBtn>
            ) : (
              <MilBtn variant="danger" onClick={stopTimer}>■ STOP & LOG</MilBtn>
            )}
            <span style={{ fontFamily: C.rajd, color: C.dim, fontSize:13 }}>Total logged: {Math.floor(totalMinutes/60)}h {totalMinutes%60}m</span>
          </div>

          {timeEntries.length === 0 ? (
            <p style={{ fontFamily: C.rajd, color: C.dim, textAlign:'center', padding:20 }}>No time entries yet — use the timer above</p>
          ) : (
            <MilTable
              columns={[
                { key:'startedAt', label:'DATE', render: v => v ? new Date(v).toLocaleDateString() : '—' },
                { key:'duration', label:'DURATION', render: v => `${Math.floor(v/60)}h ${v%60}m` },
                { key:'description', label:'DESCRIPTION' },
              ]}
              data={timeEntries}
              emptyMsg="No time entries"
            />
          )}
        </div>
      )}

      {/* Edit Task Modal */}
      {editForm && (
        <MilModal open={!!editForm} onClose={() => setEditForm(null)} title="EDIT TASK" width={800}>
          <form onSubmit={saveEdit}>
            <FormField label="Title" required><MilInput value={editForm.title} onChange={v => setEditForm(f=>({...f,title:v}))} required /></FormField>
            <FormRow>
              <FormField label="Project">
                <MilSelect value={editForm.projectId||''} onChange={v => setEditForm(f=>({...f,projectId:v}))} options={projects.map(p=>({value:p.id,label:p.name}))} placeholder="Select project..." />
              </FormField>
              <FormField label="Assignee">
                <MilSelect value={editForm.assigneeId||''} onChange={v => setEditForm(f=>({...f,assigneeId:v}))} options={users.map(u=>({value:u.id,label:u.name}))} placeholder="Select assignee..." />
              </FormField>
            </FormRow>
            <FormRow>
              <FormField label="Status">
                <MilSelect value={editForm.status||'TODO'} onChange={v => setEditForm(f=>({...f,status:v}))} options={['TODO','IN_PROGRESS','IN_REVIEW','DONE']} />
              </FormField>
              <FormField label="Priority">
                <MilSelect value={editForm.priority||'MEDIUM'} onChange={v => setEditForm(f=>({...f,priority:v}))} options={['LOW','MEDIUM','HIGH','CRITICAL']} />
              </FormField>
            </FormRow>
            <FormRow>
              <FormField label="Due Date"><MilInput type="date" value={editForm.dueDate||''} onChange={v => setEditForm(f=>({...f,dueDate:v}))} /></FormField>
              <FormField label="Estimated Hours"><MilInput type="number" value={editForm.estimatedHrs||''} onChange={v => setEditForm(f=>({...f,estimatedHrs:v}))} /></FormField>
            </FormRow>
            <FormField label="Description"><MilTextarea value={editForm.description||''} onChange={v => setEditForm(f=>({...f,description:v}))} rows={4} /></FormField>
            <FormActions onCancel={() => setEditForm(null)} loading={saving} submitLabel="UPDATE TASK" />
          </form>
        </MilModal>
      )}
    </div>
  )
}
