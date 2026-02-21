import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/users
router.get('/', authenticate, (_req: Request, res: Response) => {
  const db = getDb();
  const users = db.prepare('SELECT id, email, name FROM users ORDER BY name').all();
  res.json(users);
});

export default router;
