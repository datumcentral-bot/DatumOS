'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { MilBtn, MilInput, MilTextarea, FormField, ToastProvider, toast } from '@/lib/mil'
import { useParams } from 'next/navigation'

export default function MeetingRoom() {
  const { id } = useParams()
  const [meeting, setMeeting] = useState(null)
  const [localStream, setLocalStream] = useState(null)
  const [screenStream, setScreenStream] = useState(null)
  const [recording, setRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [chatMsg, setChatMsg] = useState('')
  const [chatLog, setChatLog] = useState([])
  const [minutes, setMinutes] = useState('')
  const [actionTitle, setActionTitle] = useState('')
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
      const mins = (m.minutes || []).map(mn => mn.content).join('\n\n')
      setMinutes(mins)
    })
  }, [id])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setLocalStream(stream)
      if (localVideoRef.current) localVideoRef.current.srcObject = stream
      toast('Camera and microphone started')
    } catch(e) { toast('Camera access denied: ' + e.message, 'error') }
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
      toast('Screen sharing started')
    } catch(e) { toast('Screen share denied: ' + e.message, 'error') }
  }

  const stopScreenShare = () => {
    screenStream?.getTracks().forEach(t => t.stop())
    setScreenStream(null)
    if (screenVideoRef.current) screenVideoRef.current.srcObject = null
  }

  const startRecording = () => {
    const stream = localStream || screenStream
    if (!stream) { toast('Start camera or screen share first', 'warning'); return }
    recordedChunks.current = []
    const mr = new MediaRecorder(stream)
    mr.ondataavailable = e => { if (e.data.size > 0) recordedChunks.current.push(e.data) }
    mr.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `meeting-${id}-recording.webm`; a.click()
      toast('Recording downloaded')
    }
    mr.start()
    setMediaRecorder(mr)
    setRecording(true)
    toast('Recording started')
  }

  const stopRecording = () => {
    mediaRecorder?.stop()
    setRecording(false)
    toast('Recording stopped — downloading...')
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
    setChatMsg('')
  }

  const saveMinutes = async () => {
    try {
      await fetch(`/api/meeting-minutes`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ meetingId: id, section: 'Meeting Minutes', content: minutes, orderIndex: 1 }) })
      toast('Minutes saved')
    } catch(e) { toast(e.message, 'error') }
  }

  const addActionItem = async () => {
    if (!actionTitle.trim()) return
    try {
      const res = await fetch('/api/action-items', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ meetingId: id, title: actionTitle, status: 'OPEN' }) })
      const item = await res.json()
      setActionItems(a => [...a, item])
      setActionTitle('')
      toast('Action item added')
    } catch(e) { toast(e.message, 'error') }
  }

  const btnStyle = (active, color='#4a7c59') => ({ padding:'8px 16px', background: active ? color : '#1a1f14', border:`1px solid ${color}`, color:'#e8d5a3', borderRadius:4, cursor:'pointer', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:12 })

  return (
    <div style={{ background:'#0d1108', minHeight:'100vh', padding:20 }}>
      <ToastProvider />
      <div style={{ fontFamily:'Orbitron,sans-serif', color:'#c8a84b', fontSize:18, marginBottom:4 }}>
        ◉ LIVE MEETING ROOM
      </div>
      <div style={{ fontFamily:'Rajdhani,sans-serif', color:'#6a7a60', fontSize:13, marginBottom:20 }}>
        {meeting?.title || 'Loading...'} — {meeting?.scheduledAt ? new Date(meeting.scheduledAt).toLocaleString() : ''}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20 }}>
        {/* VIDEO AREA */}
        <div>
          <div style={{ display:'grid', gridTemplateColumns: screenStream ? '1fr 1fr' : '1fr', gap:12, marginBottom:16 }}>
            <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, overflow:'hidden', aspectRatio:'16/9', position:'relative' }}>
              <video ref={localVideoRef} autoPlay muted playsInline style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              {!localStream && <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',color:'#4a5a40',fontFamily:'Rajdhani,sans-serif'}}>📷 Camera Off</div>}
              <div style={{position:'absolute',bottom:8,left:8,background:'rgba(0,0,0,0.7)',padding:'2px 8px',borderRadius:3,fontFamily:'Rajdhani,sans-serif',color:'#e8d5a3',fontSize:11}}>YOU</div>
            </div>
            {screenStream && (
              <div style={{ background:'#1a1f14', border:'1px solid #4a7c59', borderRadius:6, overflow:'hidden', aspectRatio:'16/9', position:'relative' }}>
                <video ref={screenVideoRef} autoPlay playsInline style={{ width:'100%', height:'100%', objectFit:'contain' }} />
                <div style={{position:'absolute',bottom:8,left:8,background:'rgba(0,0,0,0.7)',padding:'2px 8px',borderRadius:3,fontFamily:'Rajdhani,sans-serif',color:'#4a7c59',fontSize:11}}>SCREEN SHARE</div>
              </div>
            )}
          </div>

          {/* CONTROLS */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
            {!localStream ? <button onClick={startCamera} style={btnStyle(false)}>📷 START CAMERA</button> : <button onClick={stopCamera} style={btnStyle(true,'#8b1a1a')}>📷 STOP CAMERA</button>}
            {localStream && <button onClick={toggleMic} style={btnStyle(micOn)}>🎤 {micOn ? 'MIC ON' : 'MIC OFF'}</button>}
            {localStream && <button onClick={toggleCam} style={btnStyle(camOn)}>📹 {camOn ? 'CAM ON' : 'CAM OFF'}</button>}
            {!screenStream ? <button onClick={startScreenShare} style={btnStyle(false,'#234b84')}>🖥 SHARE SCREEN</button> : <button onClick={stopScreenShare} style={btnStyle(true,'#8b1a1a')}>🖥 STOP SHARE</button>}
            {!recording ? <button onClick={startRecording} style={btnStyle(false,'#8b6914')}>⏺ RECORD</button> : <button onClick={stopRecording} style={btnStyle(true,'#8b1a1a')}>⏹ STOP REC</button>}
          </div>

          {/* PARTICIPANTS */}
          <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:16, marginBottom:16 }}>
            <div style={{fontFamily:'Orbitron,sans-serif',color:'#c8a84b',fontSize:12,marginBottom:12}}>PARTICIPANTS ({meeting?.participants?.length || 0})</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {(meeting?.participants || []).map(p => (
                <div key={p.id} style={{background:'#0d1108',border:'1px solid #2a3020',borderRadius:4,padding:'4px 10px',fontFamily:'Rajdhani,sans-serif',fontSize:12,color:'#a0a090'}}>
                  {p.name} <span style={{color:'#4a5a40',fontSize:10}}>({p.role})</span>
                </div>
              ))}
            </div>
          </div>

          {/* MINUTES */}
          <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:16, marginBottom:16 }}>
            <div style={{fontFamily:'Orbitron,sans-serif',color:'#c8a84b',fontSize:12,marginBottom:12}}>MEETING MINUTES</div>
            <textarea value={minutes} onChange={e => setMinutes(e.target.value)} rows={6} placeholder="Type meeting minutes here..." style={{width:'100%',background:'#0d1108',border:'1px solid #2a3020',borderRadius:4,padding:'8px 12px',color:'#e8d5a3',fontFamily:'Rajdhani,sans-serif',fontSize:13,resize:'vertical',boxSizing:'border-box'}} />
            <button onClick={saveMinutes} style={{marginTop:8,...btnStyle(false)}}>💾 SAVE MINUTES</button>
          </div>

          {/* ACTION ITEMS */}
          <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, padding:16 }}>
            <div style={{fontFamily:'Orbitron,sans-serif',color:'#c8a84b',fontSize:12,marginBottom:12}}>ACTION ITEMS</div>
            <div style={{display:'flex',gap:8,marginBottom:12}}>
              <input value={actionTitle} onChange={e => setActionTitle(e.target.value)} onKeyDown={e => e.key==='Enter' && addActionItem()} placeholder="Add action item..." style={{flex:1,background:'#0d1108',border:'1px solid #2a3020',borderRadius:4,padding:'6px 10px',color:'#e8d5a3',fontFamily:'Rajdhani,sans-serif',fontSize:13}} />
              <button onClick={addActionItem} style={btnStyle(false)}>+ ADD</button>
            </div>
            {actionItems.map((a, i) => (
              <div key={a.id || i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:'1px solid #1a1f14'}}>
                <span style={{color:'#4a7c59',fontSize:14}}>◻</span>
                <span style={{fontFamily:'Rajdhani,sans-serif',color:'#c8c8b0',fontSize:13,flex:1}}>{a.title}</span>
                {a.assignee && <span style={{color:'#6a7a60',fontSize:11}}>{a.assignee.name}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* CHAT PANEL */}
        <div style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:6, display:'flex', flexDirection:'column', height:'calc(100vh - 120px)' }}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid #2a3020',fontFamily:'Orbitron,sans-serif',color:'#c8a84b',fontSize:12}}>LIVE CHAT</div>
          <div style={{flex:1,overflow:'auto',padding:12,display:'flex',flexDirection:'column',gap:8}}>
            {chatLog.map((m, i) => (
              <div key={i} style={{background:m.me?'#234b84':'#0d1108',border:'1px solid #2a3020',borderRadius:4,padding:'6px 10px'}}>
                <div style={{fontFamily:'Rajdhani,sans-serif',color:'#e8d5a3',fontSize:13}}>{m.text}</div>
                <div style={{fontFamily:'Rajdhani,sans-serif',color:'#4a5a40',fontSize:10,marginTop:2}}>{m.time}</div>
              </div>
            ))}
            {chatLog.length === 0 && <div style={{textAlign:'center',color:'#4a5a40',fontFamily:'Rajdhani,sans-serif',fontSize:12,marginTop:20}}>No messages yet</div>}
          </div>
          <div style={{padding:12,borderTop:'1px solid #2a3020',display:'flex',gap:8}}>
            <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key==='Enter' && sendChat()} placeholder="Type message..." style={{flex:1,background:'#0d1108',border:'1px solid #2a3020',borderRadius:4,padding:'6px 10px',color:'#e8d5a3',fontFamily:'Rajdhani,sans-serif',fontSize:13}} />
            <button onClick={sendChat} style={btnStyle(false)}>SEND</button>
          </div>
        </div>
      </div>
    </div>
  )
}
