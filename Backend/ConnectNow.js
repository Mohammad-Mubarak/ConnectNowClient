const fs      = require('fs');
const https   = require('https');
const express = require('express');
const { Server } = require('socket.io');

const app  = express();
app.use(express.json());

const key  = fs.readFileSync('cert.key');
const cert = fs.readFileSync('cert.crt');

const cors = require('cors') 


const httpsServer = https.createServer({ key, cert }, app);

const allowedOrigin = 'http://192.168.1.36:3000/';

const io = new Server(httpsServer, {
  cors: {
    origin: allowedOrigin,      
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: allowedOrigin,       
  methods: ['GET', 'POST'],
  credentials: true,
}));






const C = {
  reset: '\x1b[0m', green: '\x1b[32m', cyan: '\x1b[36m',
  yellow: '\x1b[33m', red: '\x1b[31m', magenta: '\x1b[35m',
  blue: '\x1b[34m', bold: '\x1b[1m', gray: '\x1b[90m',
};

const log = {
  info:   (m) => console.log(`${C.green}${C.bold}[INFO]  ${C.reset}${C.green}${m}${C.reset}`),
  match:  (m) => console.log(`${C.cyan}${C.bold}[MATCH] ${C.reset}${C.cyan}${m}${C.reset}`),
  queue:  (m) => console.log(`${C.yellow}${C.bold}[QUEUE] ${C.reset}${C.yellow}${m}${C.reset}`),
  signal: (m) => console.log(`${C.magenta}${C.bold}[SDP]   ${C.reset}${C.magenta}${m}${C.reset}`),
  ice:    (m) => console.log(`${C.blue}${C.bold}[ICE]   ${C.reset}${C.blue}${m}${C.reset}`),
  leave:  (m) => console.log(`${C.red}${C.bold}[LEFT]  ${C.reset}${C.red}${m}${C.reset}`),
  chat:   (m) => console.log(`${C.gray}${C.bold}[CHAT]  ${C.reset}${C.gray}${m}${C.reset}`),
};

// ── State
const waitingQueue = { video: null, audio: null };
const rooms        = new Map(); // roomId → [socketA, socketB]
const peerRoom     = new Map(); // socketId → roomId

const mkRoom = () => Math.random().toString(36).slice(2, 9).toUpperCase();

function partner(roomId, myId) {
  return (rooms.get(roomId) || []).find(id => id !== myId) || null;
}

function leave(socketId) {
  ['video','audio'].forEach(m => {
    if (waitingQueue[m] === socketId) {
      waitingQueue[m] = null;
      log.queue(`Cleared ${socketId.slice(0,8)} from ${m} queue`);
    }
  });
  const roomId = peerRoom.get(socketId);
  if (!roomId) return;
  const peer = partner(roomId, socketId);
  if (peer) {
    io.to(peer).emit('peer:left');
    peerRoom.delete(peer);
    log.leave(`Notified peer ${peer.slice(0,8)}`);
  }
  rooms.delete(roomId);
  peerRoom.delete(socketId);
  log.leave(`Room ${roomId} closed`);
}

// ── Health
app.get('/health', (_, res) => res.json({
  ok: true,
  connections: io.engine.clientsCount,
  rooms: rooms.size,
  queue: {
    video: waitingQueue.video ? waitingQueue.video.slice(0,8) : null,
    audio: waitingQueue.audio ? waitingQueue.audio.slice(0,8) : null,
  }
}));


app.post('/api/match/preferences', (req, res) => {
  const { gender, countries, languages, interests, smartMatch, duoMode } = req.body
  
  console.log('Filters received:', req.body)
  res.json({ ok: true, filters: req.body })
})
// ── Socket
io.on('connection', socket => {
  log.info(`Connected ${socket.id.slice(0,8)} | total: ${io.engine.clientsCount}`);

  socket.on('find', ({ mode = 'video' }) => {
    if (peerRoom.has(socket.id)) leave(socket.id);

    const waiting = waitingQueue[mode];

    if (waiting && waiting !== socket.id && io.sockets.sockets.get(waiting)) {
      const roomId = mkRoom();
      rooms.set(roomId, [waiting, socket.id]);
      peerRoom.set(waiting, roomId);
      peerRoom.set(socket.id, roomId);
      waitingQueue[mode] = null;

      io.to(waiting).emit('matched', { roomId, role: 'offerer' });
      socket.emit('matched', { roomId, role: 'answerer' });
      log.match(`${waiting.slice(0,8)} ↔ ${socket.id.slice(0,8)} | room: ${roomId} | ${mode}`);
    } else {
      waitingQueue[mode] = socket.id;
      socket.emit('waiting');
      log.queue(`${socket.id.slice(0,8)} waiting [${mode}]`);
    }
  });

  socket.on('cancel', () => {
    ['video','audio'].forEach(m => {
      if (waitingQueue[m] === socket.id) waitingQueue[m] = null;
    });
    socket.emit('cancelled');
    log.queue(`${socket.id.slice(0,8)} cancelled`);
  });

  socket.on('offer', ({ roomId, offer }) => {
    const peer = partner(roomId, socket.id);
    if (!peer) return;
    io.to(peer).emit('offer', { offer });
    log.signal(`Offer: ${socket.id.slice(0,8)} → ${peer.slice(0,8)}`);
  });

  socket.on('answer', ({ roomId, answer }) => {
    const peer = partner(roomId, socket.id);
    if (!peer) return;
    io.to(peer).emit('answer', { answer });
    log.signal(`Answer: ${socket.id.slice(0,8)} → ${peer.slice(0,8)}`);
  });

  socket.on('ice', ({ roomId, candidate }) => {
    const peer = partner(roomId, socket.id);
    if (!peer) return;
    io.to(peer).emit('ice', { candidate });
    log.ice(`${socket.id.slice(0,8)} → ${peer.slice(0,8)}`);
  });

  socket.on('chat', ({ roomId, text }) => {
    const peer = partner(roomId, socket.id);
    if (!peer) return;
    io.to(peer).emit('chat', { text, ts: Date.now() });
    log.chat(`${socket.id.slice(0,8)}: "${text.slice(0,40)}"`);
  });

  socket.on('skip', ({ mode = 'video' }) => {
    log.leave(`${socket.id.slice(0,8)} skipped`);
    leave(socket.id);
    const waiting = waitingQueue[mode];
    if (waiting && waiting !== socket.id && io.sockets.sockets.get(waiting)) {
      const roomId = mkRoom();
      rooms.set(roomId, [waiting, socket.id]);
      peerRoom.set(waiting, roomId);
      peerRoom.set(socket.id, roomId);
      waitingQueue[mode] = null;
      io.to(waiting).emit('matched', { roomId, role: 'offerer' });
      socket.emit('matched', { roomId, role: 'answerer' });
      log.match(`Re-matched ${socket.id.slice(0,8)} ↔ ${waiting.slice(0,8)}`);
    } else {
      waitingQueue[mode] = socket.id;
      socket.emit('waiting');
    }
  });

  socket.on('disconnect', reason => {
    log.leave(`${socket.id.slice(0,8)} disconnected | ${reason}`);
    leave(socket.id);
  });
});

const PORT = 3001

httpsServer.listen(PORT, () => {
  console.log(`\n${C.green}${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);
  console.log(`${C.green}${C.bold}  ✅  http://localhost:${PORT}${C.reset}`);
  console.log(`${C.cyan}${C.bold}  🩺  http://localhost:${PORT}/health${C.reset}`);
  console.log(`${C.green}${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}\n`);
});