'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { MilBtn, ToastProvider, toast } from '@/lib/mil'

// Load the LiveKit SDK lazily so it never runs during SSR.
async function loadSdk() {
  return import('livekit-client')
}

// A video tile that attaches a LiveKit track to a <video> element.
function VideoTile({ track, label }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !track) return
    try { track.attach(el) } catch {}
    return () => { try { track.detach(el) } catch {} }
  }, [track])
  return (
    <div style={{ border: '1px solid #30363d', borderRadius: 8, overflow: 'hidden', background: '#010409' }}>
      <video ref={ref} autoPlay playsInline style={{ width: '100%', display: 'block' }} />
      <div style={{ padding: '4px 8px', fontSize: 12, color: '#8b949e', background: '#0d1117' }}>{label}</div>
    </div>
  )
}

export default function LiveRoom() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const roomName = String(id || 'default')

  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [participants, setParticipants] = useState([])
  const [remoteTiles, setRemoteTiles] = useState([])
  const [chatLog, setChatLog] = useState([])
  const [chatMsg, setChatMsg] = useState('')

  const roomRef = useRef(null)
  const localCamTrack = useRef(null)
  const localScreenTrack = useRef(null)
  const localVideoRef = useRef(null)
  const localScreenRef = useRef(null)

  // Ask our server for a short-lived room token (the API secret
  // never reaches the browser).
  const getToken = useCallback(async () => {
    const res = await fetch('/api/livekit/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: roomName }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j?.error || `token request failed (${res.status})`)
    }
    return res.json() // { url, token, identity, name, room }
  }, [roomName])

  // Attach my camera once connected (after the <video> is in the DOM).
  useEffect(() => {
    if (connected && localCamTrack.current && localVideoRef.current) {
      try { localCamTrack.current.attach(localVideoRef.current) } catch {}
    }
  }, [connected])

  // Attach my screen once sharing.
  useEffect(() => {
    if (sharing && localScreenTrack.current && localScreenRef.current) {
      try { localScreenTrack.current.attach(localScreenRef.current) } catch {}
    }
  }, [sharing])

  // Disconnect on unmount.
  useEffect(() => () => { try { roomRef.current?.disconnect() } catch {} }, [])

  const join = useCallback(async () => {
    setError('')
    setConnecting(true)
    try {
      const { url, token } = await getToken()
      const { Room, Track, createLocalTracks } = await loadSdk()
      const room = new Room()
      roomRef.current = room

      room.on('participantConnected', (p) => {
        setParticipants((prev) => [...prev.filter((x) => x.sid !== p.sid), { sid: p.sid, name: p.name || p.identity }])
        toast(`${p.name || p.identity} joined`)
      })
      room.on('participantDisconnected', (p) => {
        setParticipants((prev) => prev.filter((x) => x.sid !== p.sid))
        setRemoteTiles((prev) => prev.filter((t) => !t.key.startsWith(p.sid + ':')))
        toast(`${p.name || p.identity} left`)
      })
      room.on('trackSubscribed', (track, publication, participant) => {
        if (!track || track.kind !== Track.Kind.Video) return // audio has no video tile
        const raw = String(publication?.source || 'camera').toLowerCase()
        const isScreen = raw.includes('screen')
        const key = `${participant.sid}:${isScreen ? 'screen' : 'camera'}`
        setRemoteTiles((prev) => (prev.some((t) => t.key === key) ? prev : [...prev, { key, track, name: participant.name || participant.identity, source: isScreen ? 'screen' : 'camera' }]))
      })
      room.on('trackUnsubscribed', (track, publication, participant) => {
        const raw = String(publication?.source || 'camera').toLowerCase()
        const isScreen = raw.includes('screen')
        const key = `${participant.sid}:${isScreen ? 'screen' : 'camera'}`
        setRemoteTiles((prev) => prev.filter((t) => t.key !== key))
      })
      room.on('dataReceived', (payload, participant) => {
        try {
          const msg = JSON.parse(new TextDecoder().decode(payload))
          setChatLog((prev) => [...prev, { id: Date.now() + Math.random(), from: participant?.name || participant?.identity || 'You', text: msg.text }])
        } catch {}
      })

      await room.connect(url, token, { autoSubscribe: true })
      setConnected(true)
      toast('Connected to ' + roomName)

      // Seed anyone ALREADY in the room — LiveKit does not replay
      // participantConnected for peers that joined before us.
      try {
        const existing = Array.from(room.remoteParticipants.values()).map((p) => ({ sid: p.sid, name: p.name || p.identity }))
        if (existing.length) {
          setParticipants((prev) => {
            const map = new Map(prev.map((x) => [x.sid, x]))
            for (const s of existing) map.set(s.sid, s)
            return Array.from(map.values())
          })
        }
      } catch {}

      // Publish my camera + microphone. Best-effort: a denied camera/mic
      // permission must NOT abort the join (the rest of the room still works).
      try {
        const tracks = await createLocalTracks({ video: camOn, audio: micOn })
        for (const t of tracks) {
          await room.localParticipant.publishTrack(t)
          if (t.kind === Track.Kind.Video) localCamTrack.current = t
        }
      } catch (pubErr) {
        toast('Camera/mic unavailable: ' + (pubErr?.message || 'permission denied'), 'warning')
      }
      const me = session?.user?.name || session?.user?.email || 'You'
      setParticipants((prev) => [...prev.filter((x) => x.sid !== room.localParticipant.sid), { sid: room.localParticipant.sid, name: me }])
    } catch (err) {
      const m = err?.message || 'Failed to join'
      setError(m)
      toast('Join failed: ' + m, 'error')
    } finally {
      setConnecting(false)
    }
  }, [getToken, roomName, camOn, micOn, session])

  const leave = useCallback(() => {
    try { roomRef.current?.disconnect() } catch {}
    roomRef.current = null
    localCamTrack.current = null
    localScreenTrack.current = null
    setConnected(false)
    setSharing(false)
    setMicOn(true)
    setCamOn(true)
    setParticipants([])
    setRemoteTiles([])
    toast('Left the room')
  }, [])

  const toggleMic = useCallback(async () => {
    const room = roomRef.current
    if (!room) return
    try {
      const next = !micOn
      await room.localParticipant.setMicrophoneEnabled(next)
      setMicOn(next)
    } catch (err) { toast('Mic: ' + (err?.message || ''), 'error') }
  }, [micOn])

  const toggleCam = useCallback(async () => {
    const room = roomRef.current
    if (!room) return
    try {
      const next = !camOn
      await room.localParticipant.setCameraEnabled(next)
      setCamOn(next)
    } catch (err) { toast('Camera: ' + (err?.message || ''), 'error') }
  }, [camOn])

  const toggleShare = useCallback(async () => {
    const room = roomRef.current
    if (!room) return
    try {
      const { Track, createLocalScreenTracks } = await loadSdk()
      if (!sharing) {
        const screenTracks = await createLocalScreenTracks({ audio: true })
        for (const t of screenTracks) {
          await room.localParticipant.publishTrack(t, { source: Track.Source.ScreenShare })
          localScreenTrack.current = t
        }
        setSharing(true)
        toast('Screen sharing started', 'success')
      } else {
        if (localScreenTrack.current) {
          try { room.localParticipant.unpublishTrack(localScreenTrack.current) } catch {}
          try { localScreenTrack.current.stop() } catch {}
        }
        localScreenTrack.current = null
        setSharing(false)
        toast('Screen sharing stopped', 'warning')
      }
    } catch (err) {
      if (err?.name !== 'NotAllowedError') toast('Screen share: ' + (err?.message || ''), 'error')
      setSharing(false)
    }
  }, [sharing])

  // Real-time data-message chat to everyone in the room.
  const sendChat = useCallback(() => {
    const room = roomRef.current
    const text = chatMsg.trim()
    if (!room || !text) return
    try {
      const payload = new TextEncoder().encode(JSON.stringify({ text, ts: new Date().toISOString() }))
      room.localParticipant.publishData(payload, { topic: 'chat' })
      setChatLog((prev) => [...prev, { id: Date.now() + Math.random(), from: 'You', text }])
      setChatMsg('')
    } catch (err) { toast('Send failed: ' + (err?.message || ''), 'error') }
  }, [chatMsg])

  const remoteCams = remoteTiles.filter((t) => t.source !== 'screen')
  const remoteScreens = remoteTiles.filter((t) => t.source === 'screen')

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh', color: '#e6edf3' }}>
      <ToastProvider />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>LIVE ROOM — {roomName}</h1>
        <span style={{ color: connected ? '#6bcb77' : '#ffd166', fontWeight: 600 }}>{connected ? '● LIVE' : '○ offline'}</span>
        <div style={{ flex: 1 }} />
        <MilBtn onClick={() => router.back()}>Back</MilBtn>
      </div>

      {!connected && !connecting && <MilBtn onClick={join}>Join room</MilBtn>}
      {connecting && <div style={{ marginBottom: 12 }}>Connecting…</div>}
      {error && <div style={{ color: '#ff6b6b', marginBottom: 12 }}>{error}</div>}

      {connected && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <MilBtn onClick={toggleMic}>{micOn ? 'Mic: ON' : 'Mic: OFF'}</MilBtn>
            <MilBtn onClick={toggleCam}>{camOn ? 'Camera: ON' : 'Camera: OFF'}</MilBtn>
            <MilBtn onClick={toggleShare}>{sharing ? 'Stop sharing' : 'Share screen'}</MilBtn>
            <MilBtn onClick={leave}>Leave</MilBtn>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 12, marginBottom: 16 }}>
            <div style={{ border: '1px solid #30363d', borderRadius: 8, overflow: 'hidden', background: '#010409' }}>
              <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', display: 'block', transform: 'scaleX(-1)' }} />
              <div style={{ padding: '4px 8px', fontSize: 12, color: '#8b949e', background: '#0d1117' }}>You (camera)</div>
            </div>
            {sharing && (
              <div style={{ border: '1px solid #30363d', borderRadius: 8, overflow: 'hidden', background: '#010409' }}>
                <video ref={localScreenRef} autoPlay playsInline style={{ width: '100%', display: 'block' }} />
                <div style={{ padding: '4px 8px', fontSize: 12, color: '#8b949e', background: '#0d1117' }}>You (screen)</div>
              </div>
            )}
          </div>

          {remoteScreens.length > 0 && (
            <>
              <h3>Shared screens</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 12, marginBottom: 16 }}>
                {remoteScreens.map((t) => <VideoTile key={t.key} track={t.track} label={t.name + ' (screen)'} />)}
              </div>
            </>
          )}

          {remoteCams.length > 0 && (
            <>
              <h3>Participants ({participants.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 12, marginBottom: 16 }}>
                {remoteCams.map((t) => <VideoTile key={t.key} track={t.track} label={t.name} />)}
              </div>
            </>
          )}
          {participants.length <= 1 && (
            <div style={{ color: '#8b949e', marginBottom: 12 }}>
              Only you are here. Open this same room URL on another PC to go live together.
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <h3>Live chat</h3>
            <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #30363d', borderRadius: 8, padding: 8, marginBottom: 8 }}>
              {chatLog.length === 0 && <div style={{ color: '#8b949e' }}>No messages yet.</div>}
              {chatLog.map((m) => (
                <div key={m.id} style={{ marginBottom: 4 }}><b>{m.from}</b>: {m.text}</div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                placeholder="Message the room…"
                style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #30363d', background: '#0d1117', color: '#e6edf3' }}
              />
              <MilBtn onClick={sendChat}>Send</MilBtn>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
