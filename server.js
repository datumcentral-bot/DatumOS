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

  // ─── Monitor feed poller (DN021) ─────────────────────────────────────────
  // Polls PUBLIC gateway/bridge health feeds and pushes a `monitor_health`
  // event to the `live-monitor` room so the director live-monitor page
  // updates in near-real-time (no 30s REST polling wait).
  const DCORTEX_URL = process.env.DCORTEX_API_URL || 'http://127.0.0.1:8799';
  const REVIT_BRIDGE_URL = 'http://127.0.0.1:8081';
  const MONITOR_ROOM = 'live-monitor';

  async function fetchMonitorFeeds() {
    const out = { gateway: null, ecosystem: null, revit: null, bridge: null, ts: new Date().toISOString() };
    const targets = [
      ['gateway', `${DCORTEX_URL}/health`],
      ['ecosystem', `${DCORTEX_URL}/ecosystem/status`],
      ['revit', `${DCORTEX_URL}/revit/health`],
      ['bridge', `${REVIT_BRIDGE_URL}/ping`],
    ];
    await Promise.all(targets.map(async ([key, url]) => {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        const res = await fetch(url, { signal: ctrl.signal });
        clearTimeout(t);
        if (res.ok) out[key] = await res.json();
      } catch { out[key] = null; }
    }));
    return out;
  }

  async function pushMonitorHealth() {
    const feeds = await fetchMonitorFeeds();
    io.to(MONITOR_ROOM).emit('monitor_health', feeds);
  }

  // Initial push + periodic poll (every 15s)
  pushMonitorHealth();
  const monitorTimer = setInterval(pushMonitorHealth, 15000);
  monitorTimer.unref?.();

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

      // DN021: immediate monitor feed on join so the live-monitor page
      // receives a push without waiting for the next poll.
      if (module === MONITOR_ROOM) {
        fetchMonitorFeeds().then((feeds) => socket.emit('monitor_health', feeds));
      }
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
