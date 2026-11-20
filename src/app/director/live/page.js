'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { PageHeader, MilBtn, ToastProvider } from '@/lib/mil'

export default function LivePage() {
  const router = useRouter()
  const pathname = usePathname()
  const [status, setStatus] = useState(null)
  const [room, setRoom] = useState('')

  // This component serves both routes: the DIRECTOR copy (/director/live)
  // and the shared all-roles copy (/live). Rooms are joined by name, so the
  // only difference is which base path we navigate under.
  const basePath = (pathname || '').startsWith('/director/live') ? '/director/live' : '/live'

  useEffect(() => {
    fetch('/api/livekit/health')
      .then((r) => r.json())
      .then((d) => setStatus(d))
      .catch(() => setStatus({ ok: false, configured: false }))
  }, [])

  const go = () => {
    const name = (room || '').trim() || 'default'
    router.push(basePath + '/room/' + encodeURIComponent(name))
  }

  const ok = Boolean(status?.ok)

  return (
    <div style={{ padding: 24, background: '#0d1108', minHeight: '100vh', color: '#e6edf3' }}>
      <ToastProvider />
      <PageHeader title="LIVE CONTROL ROOM" subtitle="Real-time video meetings + screen share (LiveKit)" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ padding: 16, border: '1px solid #30363d', borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: '#8b949e' }}>LIVEKIT SERVER</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: ok ? '#6bcb77' : '#ff6b6b', marginTop: 4 }}>
            {ok ? '● ONLINE' : '○ OFFLINE'}
          </div>
          <div style={{ fontSize: 12, color: '#8b949e', marginTop: 4 }}>
            {status?.configured ? (status?.error ? status.error : 'reachable') : 'not configured'}
          </div>
        </div>
        <div style={{ padding: 16, border: '1px solid #30363d', borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: '#8b949e' }}>TRANSPORT</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#4a9eff', marginTop: 4 }}>WebRTC</div>
          <div style={{ fontSize: 12, color: '#8b949e', marginTop: 4 }}>SFU media + data chat</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, maxWidth: 560 }}>
        <input
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && go()}
          placeholder="Room name (e.g. coordination)"
          style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #30363d', background: '#0d1117', color: '#e6edf3' }}
        />
        <MilBtn onClick={go}>Create / Join room</MilBtn>
      </div>

      <div style={{ color: '#8b949e', fontSize: 13, lineHeight: 1.7, maxWidth: 720 }}>
        Open the same room URL on every PC you want in the meeting — each PC shares its camera or
        screen in real time, and chat is instant (LiveKit data messages).
        <br />
        <br />
        <b>Local / LAN (now):</b> run DatumOS on this host and open the live room from each PC at
        <code> http://&lt;this-host-LAN-IP&gt;:3010{basePath}</code>. The browser captures each
        PC's own camera/screen (a secure context), so on the LAN use this host's address.
        <br />
        <br />
        <b>Internet (Vercel):</b> the LiveKit server must be reachable over <code>wss://</code> —
        see <code>deploy/livekit</code> for the self-host VM setup (LiveKit + coturn TURN + Caddy TLS).
      </div>
    </div>
  )
}
