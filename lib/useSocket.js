'use client';
// useSocket — per-module real-time hook
// Usage:
//   const { isConnected, onlineUsers, emitCrud } = useSocket('clash', session?.user);
//
// Listens for 'crud_event' on the given module room and calls onCrudEvent(event).
// Call emitCrud(action, data) after a successful API mutation to broadcast to peers.

import { useEffect, useCallback, useRef } from 'react';
import { useSocketContext } from './SocketContext';

export function useSocket(moduleName, user, onCrudEvent) {
  const { socket, isConnected, onlineUsers, joinModule } = useSocketContext();
  const moduleRef = useRef(moduleName);
  const callbackRef = useRef(onCrudEvent);

  // Keep refs current without re-subscribing
  useEffect(() => { moduleRef.current = moduleName; }, [moduleName]);
  useEffect(() => { callbackRef.current = onCrudEvent; }, [onCrudEvent]);

  // Join the module room when socket connects or module changes
  useEffect(() => {
    if (!socket || !isConnected || !moduleName) return;
    joinModule(moduleName, user);
  }, [socket, isConnected, moduleName, user, joinModule]);

  // Listen for CRUD events on this module
  useEffect(() => {
    if (!socket) return;

    const handler = (event) => {
      if (event.module === moduleRef.current && callbackRef.current) {
        callbackRef.current(event);
      }
    };

    socket.on('crud_event', handler);
    return () => socket.off('crud_event', handler);
  }, [socket]);

  // Emit a CRUD event to all peers in the same module room
  const emitCrud = useCallback((action, data) => {
    if (!socket || !isConnected) return;
    socket.emit('crud_event', {
      module: moduleRef.current,
      action,   // 'created' | 'updated' | 'deleted'
      data,
      actorName: user?.name || user?.email || 'Someone',
    });
  }, [socket, isConnected, user]);

  return {
    isConnected,
    onlineUsers: onlineUsers[moduleName] || [],
    emitCrud,
  };
}
