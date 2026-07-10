'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/lib/useSocket';
import LiveToast from '@/components/LiveToast';
import OnlineUsers from '@/components/OnlineUsers';

const CHANNEL_COLORS = { EMAIL: '#4a9eff', SMS: '#6bcb77', CHAT: '#ffd166', INTERNAL: '#a78bfa' };
const STATUS_COLORS = { OPEN: '#6bcb77', CLOSED: '#666', SNOOZED: '#ffd166' };
const DIR_COLORS = { INBOUND: '#4a9eff', OUTBOUND: '#6bcb77' };

function timeAgo(dt) {
  const diff = (Date.now() - new Date(dt)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

export default function ConversationsPage() {
  const { data: session } = useSession();
  const [convs, setConvs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState('');
  const [liveEvents, setLiveEvents] = useState([]);
  const threadRef = useRef(null);
  const selectedRef = useRef(null);

  // Keep selectedRef in sync so the WS handler can access current selected
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  // Real-time: handle incoming CRUD events on the 'conversations' room
  const handleLiveEvent = (ev) => {
    setLiveEvents(prev => [...prev, { ...ev, id: Date.now() + Math.random() }]);
    if (ev.action === 'message:new') {
      const { conversationId, message, conversation } = ev.data;
      // Update conversation list (last message preview + timestamp)
      setConvs(prev => prev.map(c =>
        c.id === conversationId
          ? { ...c, lastMessage: conversation.lastMessage, lastMessageAt: conversation.lastMessageAt }
          : c
      ));
      // If this conversation is currently open, append the message
      if (selectedRef.current?.id === conversationId) {
        setMessages(prev => {
          // Avoid duplicates (our own sent message is already added optimistically)
          if (prev.find(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    } else if (ev.action === 'created') {
      // New conversation from another user
      setConvs(prev => [ev.data, ...prev]);
    }
  };

  const { isConnected, onlineUsers, emitCrud } = useSocket('conversations', session?.user, handleLiveEvent);

  useEffect(() => { fetchConvs(); }, []);
  useEffect(() => { if (selected) fetchMessages(selected.id); }, [selected]);
  useEffect(() => { if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight; }, [messages]);

  async function fetchConvs() {
    setLoading(true);
    const r = await fetch('/api/conversations');
    if (r.ok) setConvs(await r.json());
    setLoading(false);
  }

  async function fetchMessages(id) {
    const r = await fetch(`/api/conversations/${id}/messages`);
    if (r.ok) setMessages(await r.json());
  }

  async function sendMessage() {
    if (!newMsg.trim() || !selected) return;
    setSending(true);
    // Optimistic update
    const optimistic = { id: `opt-${Date.now()}`, content: newMsg, type: 'EMAIL', direction: 'OUTBOUND', senderName: 'Datum BIM Team', createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);
    setNewMsg('');
    const r = await fetch(`/api/conversations/${selected.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: optimistic.content, type: 'EMAIL', direction: 'OUTBOUND', senderName: 'Datum BIM Team' }),
    });
    if (r.ok) {
      const saved = await r.json();
      // Replace optimistic with real record
      setMessages(prev => prev.map(m => m.id === optimistic.id ? saved : m));
      setToast('Message sent');
      setTimeout(() => setToast(''), 2000);
    }
    setSending(false);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  const filtered = filter === 'ALL' ? convs : convs.filter(c => c.status === filter);
  const totalUnread = convs.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', gap: 0, background: 'var(--bg-dark)' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#6bcb77', color: '#000', padding: '10px 20px', borderRadius: 6, zIndex: 9999, fontFamily: 'Rajdhani', fontWeight: 700 }}>
          ✓ {toast}
        </div>
      )}

      {/* Left Panel — Conversation List */}
      <div style={{ width: 320, borderRight: '1px solid rgba(74,158,255,0.2)', display: 'flex', flexDirection: 'column', background: 'var(--bg-panel)' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(74,158,255,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'Orbitron', fontSize: 14, color: 'var(--primary-bright)', margin: 0 }}>
              UNIFIED INBOX
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {totalUnread > 0 && (
                <span style={{ background: '#ef4444', color: '#fff', borderRadius: 12, padding: '2px 8px', fontSize: 11, fontFamily: 'Rajdhani', fontWeight: 700 }}>
                  {totalUnread} unread
                </span>
              )}
              {/* Social quick-links */}
              {[
                { icon: '💬', label: 'WhatsApp', url: 'https://wa.me/971501234567', color: '#25d366' },
                { icon: '📸', label: 'Instagram', url: 'https://instagram.com', color: '#e1306c' },
                { icon: '💼', label: 'LinkedIn', url: 'https://linkedin.com', color: '#0077b5' },
              ].map(({ icon, label, url, color }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" title={`Open ${label}`}
                  style={{ width: 26, height: 26, background: `${color}22`, border: `1px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, textDecoration: 'none', borderRadius: 4, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}44`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${color}22`; }}>
                  {icon}
                </a>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['ALL', 'OPEN', 'CLOSED', 'SNOOZED'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                flex: 1, padding: '4px 0', fontSize: 10, fontFamily: 'Rajdhani', fontWeight: 700,
                background: filter === f ? 'var(--primary-glow)' : 'transparent',
                color: filter === f ? '#000' : 'var(--primary-bright)',
                border: '1px solid var(--primary-glow)', borderRadius: 4, cursor: 'pointer',
              }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 20, color: '#666', fontFamily: 'Rajdhani', textAlign: 'center' }}>Loading...</div>
          ) : filtered.map(c => (
            <div key={c.id} onClick={() => setSelected(c)} style={{
              padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(74,158,255,0.08)',
              background: selected?.id === c.id ? 'rgba(74,158,255,0.1)' : 'transparent',
              borderLeft: selected?.id === c.id ? '3px solid var(--primary-bright)' : '3px solid transparent',
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: `hsl(${c.contactName.charCodeAt(0) * 7 % 360}, 50%, 35%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>{c.contactName[0]}</div>
                  <div>
                    <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 13, color: '#e0e0e0' }}>{c.contactName}</div>
                    <div style={{ fontSize: 10, color: '#888', fontFamily: 'Rajdhani' }}>{c.contactCompany}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ fontSize: 10, color: '#666', fontFamily: 'Rajdhani' }}>{timeAgo(c.lastMessageAt)}</span>
                  {c.unreadCount > 0 && (
                    <span style={{ background: 'var(--primary-bright)', color: '#000', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>{c.unreadCount}</span>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#888', fontFamily: 'Rajdhani', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: 40 }}>
                {c.lastMessage}
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 6, paddingLeft: 40 }}>
                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, background: `${CHANNEL_COLORS[c.channel]}22`, color: CHANNEL_COLORS[c.channel], fontFamily: 'Rajdhani', fontWeight: 700 }}>{c.channel}</span>
                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, background: `${STATUS_COLORS[c.status]}22`, color: STATUS_COLORS[c.status], fontFamily: 'Rajdhani', fontWeight: 700 }}>{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center Panel — Message Thread */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selected ? (
          <>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(74,158,255,0.15)', background: 'var(--bg-panel)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontFamily: 'Orbitron', fontSize: 14, color: 'var(--primary-bright)', margin: 0 }}>{selected.contactName}</h3>
                <div style={{ fontSize: 11, color: '#888', fontFamily: 'Rajdhani' }}>{selected.contactCompany} · {selected.contactEmail}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['OPEN', 'SNOOZED', 'CLOSED'].map(s => (
                  <button key={s} style={{
                    padding: '4px 12px', fontSize: 10, fontFamily: 'Rajdhani', fontWeight: 700,
                    background: selected.status === s ? STATUS_COLORS[s] : 'transparent',
                    color: selected.status === s ? '#000' : STATUS_COLORS[s],
                    border: `1px solid ${STATUS_COLORS[s]}`, borderRadius: 4, cursor: 'pointer',
                  }}>{s}</button>
                ))}
              </div>
            </div>

            <div ref={threadRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map(msg => (
                <div key={msg.id} style={{
                  display: 'flex', flexDirection: msg.direction === 'OUTBOUND' ? 'row-reverse' : 'row', gap: 10, alignItems: 'flex-end',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: msg.direction === 'OUTBOUND' ? 'var(--primary-glow)' : '#333',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                    color: msg.direction === 'OUTBOUND' ? '#000' : '#aaa',
                  }}>{msg.direction === 'OUTBOUND' ? 'D' : selected.contactName[0]}</div>
                  <div style={{ maxWidth: '65%' }}>
                    <div style={{
                      padding: '10px 14px', borderRadius: msg.direction === 'OUTBOUND' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                      background: msg.direction === 'OUTBOUND' ? 'rgba(74,158,255,0.15)' : 'var(--bg-panel)',
                      border: `1px solid ${msg.direction === 'OUTBOUND' ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      boxShadow: msg.direction === 'OUTBOUND' ? '0 0 8px rgba(74,158,255,0.1)' : 'none',
                    }}>
                      <div style={{ fontSize: 12, color: '#d0d0d0', fontFamily: 'Rajdhani', lineHeight: 1.5 }}>{msg.content}</div>
                    </div>
                    <div style={{ fontSize: 10, color: '#555', fontFamily: 'Rajdhani', marginTop: 4, textAlign: msg.direction === 'OUTBOUND' ? 'right' : 'left' }}>
                      {msg.senderName} · {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      <span style={{ marginLeft: 6, padding: '1px 5px', borderRadius: 3, background: `${DIR_COLORS[msg.direction]}22`, color: DIR_COLORS[msg.direction], fontSize: 9 }}>{msg.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(74,158,255,0.15)', background: 'var(--bg-panel)', display: 'flex', gap: 10 }}>
              <textarea
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Type a reply... (Enter to send, Shift+Enter for new line)"
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(74,158,255,0.2)',
                  borderRadius: 8, padding: '10px 14px', color: '#e0e0e0', fontFamily: 'Rajdhani', fontSize: 13,
                  resize: 'none', height: 60, outline: 'none',
                }}
              />
              <button onClick={sendMessage} disabled={sending || !newMsg.trim()} style={{
                padding: '0 20px', background: 'var(--primary-glow)', color: '#000', border: 'none',
                borderRadius: 8, fontFamily: 'Orbitron', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                opacity: sending || !newMsg.trim() ? 0.5 : 1,
              }}>SEND</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <div style={{ fontFamily: 'Orbitron', fontSize: 14, color: 'var(--primary-bright)' }}>SELECT A CONVERSATION</div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 13, color: '#666' }}>Choose a thread from the left panel to view messages</div>
          </div>
        )}
      </div>

      {/* Right Panel — Contact Info */}
      {selected && (
        <div style={{ width: 260, borderLeft: '1px solid rgba(74,158,255,0.2)', background: 'var(--bg-panel)', padding: 16, overflowY: 'auto' }}>
          <h4 style={{ fontFamily: 'Orbitron', fontSize: 11, color: 'var(--primary-bright)', marginBottom: 16, letterSpacing: 1 }}>CONTACT INFO</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 8px',
                background: `hsl(${selected.contactName.charCodeAt(0) * 7 % 360}, 50%, 35%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff',
                border: '2px solid var(--primary-glow)', boxShadow: '0 0 12px rgba(74,158,255,0.3)',
              }}>{selected.contactName[0]}</div>
              <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 15, color: '#e0e0e0' }}>{selected.contactName}</div>
              <div style={{ fontSize: 11, color: '#888', fontFamily: 'Rajdhani' }}>{selected.contactCompany}</div>
            </div>
            {[
              { label: 'EMAIL', value: selected.contactEmail },
              { label: 'CHANNEL', value: selected.channel },
              { label: 'STATUS', value: selected.status },
              { label: 'UNREAD', value: selected.unreadCount },
            ].map(({ label, value }) => (
              <div key={label} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
                <div style={{ fontSize: 9, color: '#666', fontFamily: 'Orbitron', letterSpacing: 1, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 12, color: '#c0c0c0', fontFamily: 'Rajdhani' }}>{value || '—'}</div>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 9, color: '#666', fontFamily: 'Orbitron', letterSpacing: 1, marginBottom: 8 }}>QUICK ACTIONS</div>
              {['Schedule Meeting', 'Add to CRM', 'Create Task', 'Send Proposal'].map(action => (
                <button key={action} style={{
                  width: '100%', padding: '7px 12px', marginBottom: 6, background: 'rgba(74,158,255,0.08)',
                  border: '1px solid rgba(74,158,255,0.2)', borderRadius: 6, color: 'var(--primary-bright)',
                  fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s',
                }}>{action}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}