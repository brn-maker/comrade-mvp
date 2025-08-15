import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

/** In-memory stores (replace with DB later) */
const users = new Map();          // userId -> { phone, username }
const sessions = new Map();       // token -> userId
const messages = [];              // { id, from, to, body, ts }
const stories = [];               // { id, userId, type, content, createdAt, expiresAt }
const onlineSockets = new Map();  // userId -> socketId(s)

/** Auth: mock OTP login. Accept any 6-digit code. */
app.post('/api/auth/request-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(StatusCodes.BAD_REQUEST).json({ error: 'phone required' });
  // In a real system, send OTP here
  return res.json({ ok: true });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, code, username } = req.body;
  if (!phone || !code) return res.status(StatusCodes.BAD_REQUEST).json({ error: 'phone & code required' });
  // Accept any code for MVP
  let userId = [...users.entries()].find(([, u]) => u.phone === phone)?.[0];
  if (!userId) {
    userId = nanoid();
    users.set(userId, { phone, username: username || `user_${userId.slice(0,4)}` });
  }
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  sessions.set(token, userId);
  return res.json({ token, userId, profile: users.get(userId) });
});

/** Middleware to validate token */
function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    return next();
  } catch {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'invalid token' });
  }
}

/** Get profile */
app.get('/api/me', auth, (req, res) => {
  return res.json({ userId: req.userId, profile: users.get(req.userId) });
});

/** Send message (plaintext for MVP; plug encryption later) */
app.post('/api/messages', auth, (req, res) => {
  const { to, body } = req.body;
  if (!to || !body) return res.status(StatusCodes.BAD_REQUEST).json({ error: 'to & body required' });
  const msg = { id: nanoid(), from: req.userId, to, body, ts: Date.now() };
  messages.push(msg);
  // Emit via sockets if recipient online
  const socketId = onlineSockets.get(to);
  if (socketId) {
    io.to(socketId).emit('message', msg);
  }
  return res.json({ ok: true, msg });
});

/** Fetch conversation */
app.get('/api/messages/:withUserId', auth, (req, res) => {
  const other = req.params.withUserId;
  const conv = messages.filter(m =>
    (m.from === req.userId && m.to === other) || (m.from === other && m.to === req.userId)
  );
  return res.json({ messages: conv });
});

/** Stories: create (text or url for MVP) */
app.post('/api/stories', auth, (req, res) => {
  const { type, content } = req.body; // type: 'text' | 'image' | 'video'; content: text or URL
  if (!type || !content) return res.status(StatusCodes.BAD_REQUEST).json({ error: 'type & content required' });
  const now = Date.now();
  const expiresAt = now + 24 * 60 * 60 * 1000; // 24h
  const story = { id: nanoid(), userId: req.userId, type, content, createdAt: now, expiresAt };
  stories.push(story);
  return res.json({ ok: true, story });
});

/** Stories: list (auto-clean expired) */
app.get('/api/stories', auth, (req, res) => {
  const now = Date.now();
  for (let i = stories.length - 1; i >= 0; i--) {
    if (stories[i].expiresAt < now) stories.splice(i, 1);
  }
  // return latest 100
  const list = stories.slice(-100).reverse();
  return res.json({ stories: list });
});

/** Socket.IO for online presence & random matching */
io.on('connection', (socket) => {
  // Expect token for auth
  socket.on('auth', (token) => {
    try {
      const { userId } = jwt.verify(token, JWT_SECRET);
      socket.userId = userId;
      onlineSockets.set(userId, socket.id);
      socket.join(userId);
      socket.emit('auth_ok', { userId });
    } catch {
      socket.emit('auth_error', { error: 'invalid token' });
    }
  });

  // Random match (very simple MVP: pair with a random other online user)
  socket.on('request_random_match', () => {
    if (!socket.userId) return;
    const others = [...onlineSockets.keys()].filter(uid => uid !== socket.userId);
    if (others.length === 0) {
      socket.emit('match_none');
      return;
    }
    const pick = others[Math.floor(Math.random() * others.length)];
    // Notify both ends
    socket.emit('match_found', { peerId: pick });
    const otherSocketId = onlineSockets.get(pick);
    if (otherSocketId) {
      io.to(otherSocketId).emit('match_found', { peerId: socket.userId });
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineSockets.delete(socket.userId);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Comrade backend running on :${PORT}`);
});
