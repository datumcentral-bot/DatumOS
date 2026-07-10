'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/lib/useSocket';
import LiveToast from '@/components/LiveToast';
import OnlineUsers from '@/components/OnlineUsers';

const TYPE_COLORS = {
  CLIENT_MEETING: '#4a9eff',
  BIM_COORDINATION: '#6bcb77',
  SITE_VISIT: '#ffd166',
  INTERNAL_REVIEW: '#a78bfa',
  TRAINING: '#f97316',
};
const TYPE_ICONS = {
  CLIENT_MEETING: '🤝',
  BIM_COORDINATION: '🏗️',
  SITE_VISIT: '📍',
  INTERNAL_REVIEW: '📊',
  TRAINING: '🎓',
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('MONTH');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const [liveEvents, setLiveEvents] = useState([]);
  const [form, setForm] = useState({ title: '', type: 'CLIENT_MEETING', startTime: '', endTime: '', location: '', description: '' });

  // Real-time: handle incoming appointment events
  const handleLiveEvent = useCallback((ev) => {
    setLiveEvents(prev => [...prev, { ...ev, id: Date.now() + Math.random() }]);
    if (ev.action === 'created') {
      setAppointments(prev => [...prev, ev.data]);
    } else if (ev.action === 'updated') {
      setAppointments(prev => prev.map(a => a.id === ev.data.id ? { ...a, ...ev.data } : a));
    } else if (ev.action === 'deleted') {
      setAppointments(prev => prev.filter(a => a.id !== ev.data.id));
    }
  }, []);

  const { isConnected, onlineUsers, emitCrud } = useSocket('appointments', session?.user, handleLiveEvent);

  useEffect(() => { fetchAppointments(); }, []);

  async function fetchAppointments() {
    setLoading(true);
    const r = await fetch('/api/appointments');
    if (r.ok) setAppointments(await r.json());
    setLoading(false);
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function saveAppointment() {
    const r = await fetch('/api/appointments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    if (r.ok) { fetchAppointments(); setShowModal(false); setForm({ title: '', type: 'CLIENT_MEETING', startTime: '', endTime: '', location: '', description: '' }); showToast('Appointment created'); }
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function getApptForDay(day) {
    return appointments.filter(a => {
      const d = new Date(a.startTime);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  const upcomingAppts = appointments.filter(a => new Date(a.startTime) >= new Date()).slice(0, 5);

  return (
    <div style={{ padding: 24, background: 'var(--bg-dark)', minHeight: '100vh' }}>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, background: '#6bcb77', color: '#000', padding: '10px 20px', borderRadius: 6, zIndex: 9999, fontFamily: 'Rajdhani', fontWeight: 700 }}>✓ {toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Orbitron', fontSize: 20, color: 'var(--primary-bright)', margin: 0 }}>CALENDAR</h1>
          <p style={{ fontFamily: 'Rajdhani', color: '#888', margin: '4px 0 0', fontSize: 13 }}>Appointments, meetings & site visits</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'flex', border: '1px solid rgba(74,158,255,0.3)', borderRadius: 6, overflow: 'hidden' }}>
            {['MONTH', 'LIST'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: '8px 16px', background: view === v ? 'var(--primary-glow)' : 'transparent', color: view === v ? '#000' : 'var(--primary-bright)', border: 'none', fontFamily: 'Orbitron', fontSize: 10, cursor: 'pointer' }}>{v}</button>
            ))}
          </div>
          <button onClick={() => setShowModal(true)} style={{ padding: '10px 20px', background: 'var(--primary-glow)', color: '#000', border: 'none', borderRadius: 6, fontFamily: 'Orbitron', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ NEW</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        {/* Calendar Grid */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid rgba(74,158,255,0.15)', borderRadius: 10, overflow: 'hidden' }}>
          {/* Month Nav */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(74,158,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} style={{ background: 'none', border: '1px solid rgba(74,158,255,0.3)', borderRadius: 4, color: 'var(--primary-bright)', padding: '4px 12px', cursor: 'pointer', fontFamily: 'Rajdhani', fontSize: 16 }}>‹</button>
            <h2 style={{ fontFamily: 'Orbitron', fontSize: 16, color: 'var(--primary-bright)', margin: 0 }}>{monthNames[month]} {year}</h2>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} style={{ background: 'none', border: '1px solid rgba(74,158,255,0.3)', borderRadius: 4, color: 'var(--primary-bright)', padding: '4px 12px', cursor: 'pointer', fontFamily: 'Rajdhani', fontSize: 16 }}>›</button>
          </div>

          {/* Day Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(74,158,255,0.1)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ padding: '8px 0', textAlign: 'center', fontSize: 10, fontFamily: 'Orbitron', color: '#666', letterSpacing: 1 }}>{d}</div>
            ))}
          </div>

          {/* Calendar Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} style={{ minHeight: 80, borderRight: '1px solid rgba(74,158,255,0.06)', borderBottom: '1px solid rgba(74,158,255,0.06)', background: 'rgba(0,0,0,0.2)' }} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayAppts = getApptForDay(day);
              const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
              return (
                <div key={day} style={{
                  minHeight: 80, borderRight: '1px solid rgba(74,158,255,0.06)', borderBottom: '1px solid rgba(74,158,255,0.06)',
                  padding: '6px', background: isToday ? 'rgba(74,158,255,0.08)' : 'transparent',
                  position: 'relative',
                }}>
                  <div style={{
                    fontSize: 12, fontFamily: 'Orbitron', color: isToday ? 'var(--primary-bright)' : '#888',
                    marginBottom: 4, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%', background: isToday ? 'var(--primary-glow)' : 'transparent',
                    color: isToday ? '#000' : '#888',
                  }}>{day}</div>
                  {dayAppts.slice(0, 2).map(a => (
                    <div key={a.id} onClick={() => setSelected(a)} style={{
                      fontSize: 9, padding: '2px 5px', borderRadius: 3, marginBottom: 2, cursor: 'pointer',
                      background: `${TYPE_COLORS[a.type]}22`, color: TYPE_COLORS[a.type],
                      fontFamily: 'Rajdhani', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      border: `1px solid ${TYPE_COLORS[a.type]}44`,
                    }}>{TYPE_ICONS[a.type]} {a.title}</div>
                  ))}
                  {dayAppts.length > 2 && <div style={{ fontSize: 9, color: '#666', fontFamily: 'Rajdhani' }}>+{dayAppts.length - 2} more</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Legend */}
          <div style={{ background: 'var(--bg-panel)', border: '1px solid rgba(74,158,255,0.15)', borderRadius: 10, padding: 16 }}>
            <div style={{ fontFamily: 'Orbitron', fontSize: 10, color: 'var(--primary-bright)', letterSpacing: 1, marginBottom: 12 }}>EVENT TYPES</div>
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#c0c0c0', fontFamily: 'Rajdhani' }}>{TYPE_ICONS[type]} {type.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>

          {/* Upcoming */}
          <div style={{ background: 'var(--bg-panel)', border: '1px solid rgba(74,158,255,0.15)', borderRadius: 10, padding: 16, flex: 1 }}>
            <div style={{ fontFamily: 'Orbitron', fontSize: 10, color: 'var(--primary-bright)', letterSpacing: 1, marginBottom: 12 }}>UPCOMING</div>
            {upcomingAppts.map(a => (
              <div key={a.id} onClick={() => setSelected(a)} style={{
                padding: '10px 12px', borderRadius: 6, marginBottom: 8, cursor: 'pointer',
                background: `${TYPE_COLORS[a.type]}11`, border: `1px solid ${TYPE_COLORS[a.type]}33`,
                borderLeft: `3px solid ${TYPE_COLORS[a.type]}`,
              }}>
                <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 12, color: '#e0e0e0', marginBottom: 2 }}>{a.title}</div>
                <div style={{ fontSize: 10, color: '#888', fontFamily: 'Rajdhani' }}>
                  {new Date(a.startTime).toLocaleDateString()} · {new Date(a.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {a.location && <div style={{ fontSize: 10, color: '#666', fontFamily: 'Rajdhani', marginTop: 2 }}>📍 {a.location}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelected(null)}>
          <div style={{ background: 'var(--bg-panel)', border: `1px solid ${TYPE_COLORS[selected.type]}44`, borderRadius: 12, padding: 28, width: 480, boxShadow: `0 0 40px ${TYPE_COLORS[selected.type]}22` }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 28 }}>{TYPE_ICONS[selected.type]}</span>
              <div>
                <h3 style={{ fontFamily: 'Orbitron', fontSize: 14, color: TYPE_COLORS[selected.type], margin: 0 }}>{selected.title}</h3>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: `${TYPE_COLORS[selected.type]}22`, color: TYPE_COLORS[selected.type], fontFamily: 'Rajdhani', fontWeight: 700 }}>{selected.type.replace(/_/g, ' ')}</span>
              </div>
            </div>
            {[
              { label: 'START', value: new Date(selected.startTime).toLocaleString() },
              { label: 'END', value: new Date(selected.endTime).toLocaleString() },
              { label: 'LOCATION', value: selected.location || 'TBD' },
              { label: 'STATUS', value: selected.status },
              { label: 'DESCRIPTION', value: selected.description || '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10 }}>
                <div style={{ fontSize: 9, color: '#666', fontFamily: 'Orbitron', letterSpacing: 1, marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13, color: '#c0c0c0', fontFamily: 'Rajdhani' }}>{value}</div>
              </div>
            ))}
            {selected.attendees && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: '#666', fontFamily: 'Orbitron', letterSpacing: 1, marginBottom: 6 }}>ATTENDEES</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {JSON.parse(selected.attendees).map(a => (
                    <span key={a} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, background: 'rgba(74,158,255,0.1)', color: '#4a9eff', fontFamily: 'Rajdhani', border: '1px solid rgba(74,158,255,0.2)' }}>{a}</span>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => setSelected(null)} style={{ width: '100%', padding: '10px', background: 'var(--primary-glow)', color: '#000', border: 'none', borderRadius: 6, fontFamily: 'Orbitron', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>CLOSE</button>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid rgba(74,158,255,0.3)', borderRadius: 12, padding: 28, width: 500, boxShadow: '0 0 40px rgba(74,158,255,0.15)' }}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 14, color: 'var(--primary-bright)', marginBottom: 20 }}>NEW APPOINTMENT</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Title', key: 'title', type: 'text' },
                { label: 'Location', key: 'location', type: 'text' },
                { label: 'Start Time', key: 'startTime', type: 'datetime-local' },
                { label: 'End Time', key: 'endTime', type: 'datetime-local' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={{ fontSize: 10, color: '#888', fontFamily: 'Orbitron', letterSpacing: 1, display: 'block', marginBottom: 4 }}>{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(74,158,255,0.2)', borderRadius: 6, padding: '8px 12px', color: '#e0e0e0', fontFamily: 'Rajdhani', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 10, color: '#888', fontFamily: 'Orbitron', letterSpacing: 1, display: 'block', marginBottom: 4 }}>TYPE</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid rgba(74,158,255,0.2)', borderRadius: 6, padding: '8px 12px', color: '#e0e0e0', fontFamily: 'Rajdhani', fontSize: 13 }}>
                  {Object.keys(TYPE_COLORS).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #444', borderRadius: 6, color: '#888', fontFamily: 'Rajdhani', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveAppointment} style={{ padding: '8px 20px', background: 'var(--primary-glow)', color: '#000', border: 'none', borderRadius: 6, fontFamily: 'Orbitron', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>SAVE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}