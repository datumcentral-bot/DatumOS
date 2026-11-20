'use client'
import { useState, useEffect, useRef } from 'react'
import { PageHeader, MilBtn, StatCard, ToastProvider, toast } from '@/lib/mil'

export default function ScreenSharePage() {
  const [meetings, setMeetings] = useState([])
  const [sharing, setSharing] = useState(false)
  const [stream, setStream] = useState(null)
  const videoRef = useRef(null)

  useEffect(() => {
    fetch('/api/meetings').then(r=>r.json()).then(d => setMeetings(Array.isArray(d) ? d.slice(0,5) : []))
  }, [])

  const startShare = async () => {
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      setStream(s)
      setSharing(true)
      if (videoRef.current) videoRef.current.srcObject = s
      s.getVideoTracks()[0].onended = () => stopShare()
      toast('Screen sharing started', 'success')
    } catch(err) {
      if (err.name !== 'NotAllowedError') toast('Could not start screen share: ' + err.message, 'error')
    }
  }

  const stopShare = () => {
    if (stream) stream.getTracks().forEach(t => t.stop())
    setStream(null)
    setSharing(false)
    if (videoRef.current) videoRef.current.srcObject = null
    toast('Screen sharing stopped', 'warning')
  }

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh' }}>
      <ToastProvider />
      <PageHeader title="SCREEN SHARE" subtitle="Share your screen in BIM coordination meetings" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Active Meetings" value={meetings.filter(m=>m.status==='IN_PROGRESS').length} color="#4a7c59" />
        <StatCard label="Scheduled Today" value={meetings.filter(m=>m.status==='SCHEDULED').length} color="#8b6914" />
        <StatCard label="Screen Sharing" value={sharing ? 'ACTIVE' : 'OFF'} color={sharing ? '#4a7c59' : '#3a3a3a'} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:24 }}>
        <div>
          <div style={{ background:'#1a1f14', border:`2px solid ${sharing ? '#4a7c59' : '#2a3020'}`, borderRadius:8, overflow:'hidden', aspectRatio:'16/9', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
            {sharing ? (
              <video ref={videoRef} autoPlay muted style={{ width:'100%', height:'100%', objectFit:'contain' }} />
            ) : (
              <div style={{ textAlign:'center', color:'#4a5a40' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🖥</div>
                <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:14, letterSpacing:2 }}>NO ACTIVE SHARE</div>
                <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:12, marginTop:8 }}>Click "Start Sharing" to share your screen</div>
              </div>
            )}
            {sharing && (
              <div style={{ position:'absolute', top:12, right:12, background:'#8b1a1a', color:'#e8d5a3', padding:'4px 12px', borderRadius:4, fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:12, animation:'pulse 1.5s infinite' }}>
                ● LIVE
              </div>
            )}
          </div>
          <div style={{ display:'flex', gap:12, marginTop:16 }}>
            {!sharing ? (
              <MilBtn onClick={startShare}>▶ START SHARING</MilBtn>
            ) : (
              <button onClick={stopShare} style={{ padding:'10px 24px', background:'#8b1a1a', border:'none', color:'#e8d5a3', borderRadius:4, cursor:'pointer', fontFamily:'Rajdhani,sans-serif', fontWeight:700 }}>■ STOP SHARING</button>
            )}
            <button onClick={() => window.open('/director/meetings', '_blank')} style={{ padding:'10px 24px', background:'transparent', border:'1px solid #4a7c59', color:'#4a7c59', borderRadius:4, cursor:'pointer', fontFamily:'Rajdhani,sans-serif', fontWeight:700 }}>
              📅 OPEN MEETINGS
            </button>
          </div>
        </div>
        <div>
          <div style={{ fontFamily:'Orbitron,sans-serif', color:'#c8a84b', fontSize:12, letterSpacing:2, marginBottom:12 }}>RECENT MEETINGS</div>
          {meetings.length === 0 ? (
            <div style={{ color:'#4a5a40', fontFamily:'Rajdhani,sans-serif', fontSize:13 }}>No meetings scheduled.</div>
          ) : meetings.map(m => (
            <div key={m.id} style={{ background:'#1a1f14', border:'1px solid #2a3020', borderRadius:4, padding:'10px 14px', marginBottom:8 }}>
              <div style={{ fontFamily:'Rajdhani,sans-serif', color:'#e8d5a3', fontWeight:700, fontSize:13 }}>{m.title}</div>
              <div style={{ fontFamily:'Rajdhani,sans-serif', color:'#6a7a60', fontSize:11, marginTop:4 }}>
                {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString() : '—'}
              </div>
              <button onClick={() => window.open(`/director/meetings/room/${m.id}`, '_blank')} style={{ marginTop:8, padding:'4px 12px', background:'#234b84', border:'none', color:'#e8d5a3', borderRadius:3, cursor:'pointer', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:11 }}>
                JOIN ROOM
              </button>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }`}</style>
    </div>
  )
}
