import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/tickets/:id/comments
router.get('/:id/comments', authenticate, (req: Request, res: Response) => {
  const db = getDb();
  const comments = db.prepare(`
    SELECT c.id, c.ticket_id, c.body, c.created_at, c.updated_at,
           u.id as author_id, u.name as author_name, u.email as author_email
    FROM comments c
    JOIN users u ON u.id = c.author_id
    WHERE c.ticket_id = ?
    ORDER BY c.created_at ASC
  `).all(req.params.id);

  const result = comments.map((c: any) => ({
    id: c.id,
    ticket_id: c.ticket_id,
    body: c.body,
    created_at: c.created_at,
    updated_at: c.updated_at,
    author: { id: c.author_id, name: c.author_name, email: c.author_email },
  }));

  res.json(result);
});

// POST /api/tickets/:id/comments
router.post('/:id/comments', authenticate, (req: Request, res: Response) => {
  const { body } = req.body;
  if (!body || !body.trim()) {
    res.status(400).json({ error: 'body is required' });
    return;
  }

  const db = getDb();
  const ticket = db.prepare('SELECT id FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const comment = db.prepare(`
    INSERT INTO comments (ticket_id, author_id, body) VALUES (?, ?, ?) RETURNING *
  `).get(req.params.id, req.user!.userId, body.trim()) as any;

  const author = db
    .prepare('SELECT id, name, email FROM users WHERE id = ?')
    .get(req.user!.userId) as any;

  res.status(201).json({ ...comment, author });
});

// DELETE /api/tickets/:id/comments/:commentId
router.delete('/:id/comments/:commentId', authenticate, (req: Request, res: Response) => {
  const db = getDb();
  const comment = db
    .prepare('SELECT * FROM comments WHERE id = ? AND ticket_id = ?')
    .get(req.params.commentId, req.params.id) as any;

  if (!comment) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }
  if (comment.author_id !== req.user!.userId) {
    res.status(403).json({ error: 'Cannot delete another user\'s comment' });
    return;
  }

  db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.commentId);
  res.json({ success: true });
});

export default router;
