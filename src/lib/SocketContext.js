'use client';
// SocketContext — global Socket.IO connection + presence state
// Wraps the entire app so any component can access the socket.

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children, session }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({}); // module → [{ socketId, userName, userId }]
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to the same origin (server.js handles Socket.IO on port 3000)
    const s = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = s;
    setSocket(s);

    s.on('connect', () => {
      console.log('[Socket.IO] Connected:', s.id);
      setIsConnected(true);
    });

    s.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected:', reason);
      setIsConnected(false);
    });

    s.on('connect_error', (err) => {
      console.warn('[Socket.IO] Connection error:', err.message);
      setIsConnected(false);
    });

    // Presence updates from server
    s.on('presence_update', ({ module, users }) => {
      setOnlineUsers((prev) => ({ ...prev, [module]: users }));
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const joinModule = useCallback((moduleName, user) => {
    if (!socketRef.current) return;
    socketRef.current.emit('join_module', {
      module: moduleName,
      userName: user?.name || user?.email || 'Anonymous',
      userId: user?.id || user?.email || socketRef.current.id,
    });
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers, joinModule }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocketContext must be used inside <SocketProvider>');
  return ctx;
}
