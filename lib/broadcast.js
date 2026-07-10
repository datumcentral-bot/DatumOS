// broadcast.js — Server-side Socket.IO broadcast helper
// Call this from any API route after a successful DB mutation.
// global._io is set by server.js when the Socket.IO server starts.
//
// Usage:
//   import { broadcast } from '@/lib/broadcast';
//   broadcast('leads', 'created', newLead, 'Director');

/**
 * Broadcast a CRUD event to all clients in a module room.
 * @param {string} module   - Room name (e.g. 'leads', 'clash', 'tasks')
 * @param {string} action   - 'created' | 'updated' | 'deleted' | 'resolved'
 * @param {object} data     - The record that changed
 * @param {string} actorName - Display name of the user who made the change
 */
export function broadcast(module, action, data, actorName = 'System') {
  try {
    const io = global._io;
    if (!io) return; // server.js not running (e.g. next dev without custom server)
    io.to(module).emit('crud_event', {
      module,
      action,
      data,
      actorName,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Never let a broadcast failure break the API response
    console.warn('[broadcast] emit failed:', err.message);
  }
}

/**
 * Broadcast to ALL connected clients (not just a room).
 * Use for global events like notifications.
 */
export function broadcastAll(event, payload) {
  try {
    const io = global._io;
    if (!io) return;
    io.emit(event, { ...payload, timestamp: new Date().toISOString() });
  } catch (err) {
    console.warn('[broadcastAll] emit failed:', err.message);
  }
}
