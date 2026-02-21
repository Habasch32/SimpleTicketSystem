import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDb } from '../db';
import { authenticate } from '../middleware/auth';
import { DbUser } from '../types';

const router = Router();

function signToken(userId: number, email: string): string {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
}

function safeUser(user: DbUser) {
  return { id: user.id, email: user.email, name: user.name, created_at: user.created_at };
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    res.status(400).json({ error: 'email, name and password are required' });
    return;
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'Email already in use' });
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  const result = db
    .prepare('INSERT INTO users (email, name, password) VALUES (?, ?, ?) RETURNING *')
    .get(email, name, hash) as DbUser;

  const token = signToken(result.id, result.email);
  res.status(201).json({ token, user: safeUser(result) });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as DbUser | undefined;
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = signToken(user.id, user.email);
  res.json({ token, user: safeUser(user) });
});

// GET /api/auth/me
router.get('/me', authenticate, (req: Request, res: Response) => {
  const db = getDb();
  const user = db
    .prepare('SELECT id, email, name, created_at FROM users WHERE id = ?')
    .get(req.user!.userId) as DbUser | undefined;

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user });
});

export default router;
