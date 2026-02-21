import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/labels
router.get('/', authenticate, (_req: Request, res: Response) => {
  const db = getDb();
  const labels = db.prepare('SELECT * FROM labels ORDER BY name').all();
  res.json(labels);
});

// POST /api/labels
router.post('/', authenticate, (req: Request, res: Response) => {
  const { name, color } = req.body;
  if (!name) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  const db = getDb();
  const label = db
    .prepare('INSERT INTO labels (name, color) VALUES (?, ?) RETURNING *')
    .get(name, color || '#6B7280');
  res.status(201).json(label);
});

export default router;
