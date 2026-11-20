'use client';
// OnlineUsers — shows avatar circles for users currently viewing this module
// Usage: <OnlineUsers users={onlineUsers} />

export default function OnlineUsers({ users = [] }) {
  if (!users || users.length === 0) return null;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getColor = (name) => {
    const colors = ['#d4af37', '#4ade80', '#60a5fa', '#f87171', '#a78bfa', '#fb923c'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    }}>
      <span style={{
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '0.7rem',
        color: '#6b7280',
        marginRight: '0.25rem',
        letterSpacing: '0.05em',
      }}>
        ONLINE:
      </span>
      {users.slice(0, 6).map((u) => (
        <div
          key={u.socketId}
          title={u.userName}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: getColor(u.userName),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.65rem',
            fontWeight: 700,
            color: '#0a0e0a',
            fontFamily: 'Orbitron, sans-serif',
            border: '2px solid #1a2a1a',
            cursor: 'default',
          }}
        >
          {getInitials(u.userName)}
        </div>
      ))}
      {users.length > 6 && (
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: '#374151',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.6rem',
          color: '#9ca3af',
          fontFamily: 'Rajdhani, sans-serif',
          border: '2px solid #1a2a1a',
        }}>
          +{users.length - 6}
        </div>
      )}
    </div>
  );
}
