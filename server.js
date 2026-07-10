// DatumOS v19 — Custom Next.js + Socket.IO server
// Runs Next.js production build alongside a Socket.IO WebSocket server
// on the same HTTP port (3000).

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Track online users per module room
// rooms: module name → Set of { socketId, userName, userId }
const onlineUsers = {};

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // ─── Socket.IO setup ───────────────────────────────────────────────────────
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    // Allow the Cloudflare tunnel to proxy WebSocket upgrades
    transports: ['websocket', 'polling'],
  });

  // Expose io globally so API routes can emit events
  global._io = io;

  io.on('connection', (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    // ── Presence: join a module room ─────────────────────────────────────────
    socket.on('join_module', ({ module, userName, userId }) => {
      // Leave any previous module rooms
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room);
          // Remove from onlineUsers
          if (onlineUsers[room]) {
            onlineUsers[room] = onlineUsers[room].filter(
              (u) => u.socketId !== socket.id
            );
            io.to(room).emit('presence_update', {
              module: room,
              users: onlineUsers[room],
            });
          }
        }
      });

      socket.join(module);
      socket.data.module = module;
      socket.data.userName = userName || 'Unknown';
      socket.data.userId = userId || socket.id;

      if (!onlineUsers[module]) onlineUsers[module] = [];
      // Avoid duplicates
      onlineUsers[module] = onlineUsers[module].filter(
        (u) => u.socketId !== socket.id
      );
      onlineUsers[module].push({
        socketId: socket.id,
        userName: socket.data.userName,
        userId: socket.data.userId,
      });

      // Broadcast updated presence to everyone in the room
      io.to(module).emit('presence_update', {
        module,
        users: onlineUsers[module],
      });

      console.log(`[WS] ${socket.data.userName} joined module: ${module}`);
    });

    // ── CRUD broadcast relay ─────────────────────────────────────────────────
    // Clients emit: { module, action, data, actorName }
    // Server broadcasts to all OTHER clients in the same module room
    socket.on('crud_event', ({ module, action, data, actorName }) => {
      console.log(`[WS] crud_event: ${actorName} → ${action} on ${module}`);
      socket.to(module).emit('crud_event', {
        module,
        action,   // 'created' | 'updated' | 'deleted'
        data,
        actorName: actorName || socket.data.userName || 'Someone',
        timestamp: new Date().toISOString(),
      });
    });

    // ── Disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const module = socket.data.module;
      if (module && onlineUsers[module]) {
        onlineUsers[module] = onlineUsers[module].filter(
          (u) => u.socketId !== socket.id
        );
        io.to(module).emit('presence_update', {
          module,
          users: onlineUsers[module],
        });
      }
      console.log(`[WS] Client disconnected: ${socket.id}`);
    });
  });

  // ─── Start listening ───────────────────────────────────────────────────────
  httpServer.listen(port, hostname, () => {
    console.log(`\n🚀 DatumOS v19 ready on http://${hostname}:${port}`);
    console.log(`🔌 Socket.IO WebSocket server active on same port`);
    console.log(`📡 Modules with real-time: midp, tidp, cde, clash, tasks, scope, responsibility, financial, delivery, iso19650\n`);
  });
});
