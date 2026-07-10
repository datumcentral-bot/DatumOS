'use client';
// LiveToast — shows real-time CRUD notifications in the bottom-right corner
// Usage: <LiveToast events={liveEvents} />
// liveEvents: array of { id, module, action, actorName, timestamp }

import { useEffect, useState } from 'react';

const ACTION_ICONS = {
  created: '➕',
  updated: '✏️',
  deleted: '🗑️',
};

const ACTION_COLORS = {
  created: '#4ade80',
  updated: '#facc15',
  deleted: '#f87171',
};

export default function LiveToast({ events }) {
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    if (!events || events.length === 0) return;
    const latest = events[events.length - 1];
    const id = latest.id || Date.now();

    setVisible((prev) => [...prev.slice(-4), { ...latest, id }]);

    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      setVisible((prev) => prev.filter((e) => e.id !== id));
    }, 4000);

    return () => clearTimeout(timer);
  }, [events]);

  if (visible.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      pointerEvents: 'none',
    }}>
      {visible.map((ev) => (
        <div key={ev.id} style={{
          background: 'rgba(10,14,10,0.95)',
          border: `1px solid ${ACTION_COLORS[ev.action] || '#4ade80'}`,
          borderLeft: `4px solid ${ACTION_COLORS[ev.action] || '#4ade80'}`,
          borderRadius: '4px',
          padding: '0.6rem 1rem',
          minWidth: '280px',
          maxWidth: '380px',
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: '0.85rem',
          color: '#e5e7eb',
          boxShadow: `0 0 12px ${ACTION_COLORS[ev.action] || '#4ade80'}44`,
          animation: 'slideInRight 0.3s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem' }}>{ACTION_ICONS[ev.action] || '🔔'}</span>
            <span style={{ color: '#d4af37', fontWeight: 700, letterSpacing: '0.05em' }}>
              🔴 LIVE
            </span>
            <span style={{ color: '#9ca3af', fontSize: '0.75rem', marginLeft: 'auto' }}>
              {new Date(ev.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div style={{ marginTop: '0.25rem', color: '#e5e7eb' }}>
            <strong style={{ color: '#d4af37' }}>{ev.actorName}</strong>
            {' '}{ev.action}{' '}
            <span style={{ color: ACTION_COLORS[ev.action] || '#4ade80' }}>
              {ev.module}
            </span>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
