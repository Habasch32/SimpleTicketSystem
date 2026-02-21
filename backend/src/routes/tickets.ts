import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { authenticate } from '../middleware/auth';
import { DbTicket } from '../types';

const router = Router();

function enrichTicket(db: ReturnType<typeof getDb>, ticket: DbTicket) {
  const assignee = ticket.assignee_id
    ? db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(ticket.assignee_id)
    : null;

  const labels = db.prepare(`
    SELECT l.id, l.name, l.color FROM labels l
    JOIN ticket_labels tl ON tl.label_id = l.id
    WHERE tl.ticket_id = ?
  `).all(ticket.id);

  return { ...ticket, assignee, labels };
}

function getMaxPosition(db: ReturnType<typeof getDb>, status: string): number {
  const result = db
    .prepare('SELECT MAX(position) as maxPos FROM tickets WHERE status = ?')
    .get(status) as { maxPos: number | null };
  return (result.maxPos ?? 0) + 1000;
}

// GET /api/tickets
router.get('/', authenticate, (_req: Request, res: Response) => {
  const db = getDb();
  const tickets = db
    .prepare('SELECT * FROM tickets ORDER BY status, position')
    .all() as DbTicket[];

  res.json(tickets.map((t) => enrichTicket(db, t)));
});

// POST /api/tickets
router.post('/', authenticate, (req: Request, res: Response) => {
  const { title, description, status, priority, assignee_id, label_ids } = req.body;
  if (!title) {
    res.status(400).json({ error: 'title is required' });
    return;
  }

  const db = getDb();
  const ticketStatus = status || 'backlog';
  const position = getMaxPosition(db, ticketStatus);

  const ticket = db.prepare(`
    INSERT INTO tickets (title, description, status, priority, position, assignee_id, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *
  `).get(
    title,
    description || '',
    ticketStatus,
    priority || 'medium',
    position,
    assignee_id || null,
    req.user!.userId,
  ) as DbTicket;

  if (Array.isArray(label_ids) && label_ids.length > 0) {
    const insertLabel = db.prepare(
      'INSERT OR IGNORE INTO ticket_labels (ticket_id, label_id) VALUES (?, ?)'
    );
    for (const labelId of label_ids) {
      insertLabel.run(ticket.id, labelId);
    }
  }

  res.status(201).json(enrichTicket(db, ticket));
});

// GET /api/tickets/:id
router.get('/:id', authenticate, (req: Request, res: Response) => {
  const db = getDb();
  const ticket = db
    .prepare('SELECT * FROM tickets WHERE id = ?')
    .get(req.params.id) as DbTicket | undefined;

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }
  res.json(enrichTicket(db, ticket));
});

// PATCH /api/tickets/:id
router.patch('/:id', authenticate, (req: Request, res: Response) => {
  const db = getDb();
  const existing = db
    .prepare('SELECT * FROM tickets WHERE id = ?')
    .get(req.params.id) as DbTicket | undefined;

  if (!existing) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const { title, description, status, priority, assignee_id, label_ids } = req.body;

  const updated = db.prepare(`
    UPDATE tickets SET
      title       = COALESCE(?, title),
      description = COALESCE(?, description),
      status      = COALESCE(?, status),
      priority    = COALESCE(?, priority),
      assignee_id = ?,
      updated_at  = datetime('now')
    WHERE id = ? RETURNING *
  `).get(
    title ?? null,
    description ?? null,
    status ?? null,
    priority ?? null,
    assignee_id !== undefined ? assignee_id : existing.assignee_id,
    req.params.id,
  ) as DbTicket;

  if (Array.isArray(label_ids)) {
    db.prepare('DELETE FROM ticket_labels WHERE ticket_id = ?').run(updated.id);
    const insertLabel = db.prepare(
      'INSERT OR IGNORE INTO ticket_labels (ticket_id, label_id) VALUES (?, ?)'
    );
    for (const labelId of label_ids) {
      insertLabel.run(updated.id, labelId);
    }
  }

  res.json(enrichTicket(db, updated));
});

// PATCH /api/tickets/:id/move  (drag & drop)
router.patch('/:id/move', authenticate, (req: Request, res: Response) => {
  const { status, position } = req.body;
  if (!status || position === undefined) {
    res.status(400).json({ error: 'status and position are required' });
    return;
  }

  const db = getDb();

  // Check if rebalancing is needed in the target column
  const colTickets = db.prepare(
    'SELECT id, position FROM tickets WHERE status = ? AND id != ? ORDER BY position'
  ).all(status, req.params.id) as { id: number; position: number }[];

  const gaps = colTickets
    .slice(0, -1)
    .map((t, i) => Math.abs(t.position - colTickets[i + 1].position));

  if (gaps.length > 0 && Math.min(...gaps) < 0.001) {
    const rebalance = db.prepare('UPDATE tickets SET position = ? WHERE id = ?');
    const rebalanceAll = db.transaction(() => {
      colTickets.forEach((t, i) => rebalance.run((i + 1) * 1000, t.id));
    });
    rebalanceAll();
  }

  const updated = db.prepare(`
    UPDATE tickets SET status = ?, position = ?, updated_at = datetime('now')
    WHERE id = ? RETURNING *
  `).get(status, position, req.params.id) as DbTicket | undefined;

  if (!updated) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  res.json(enrichTicket(db, updated));
});

// DELETE /api/tickets/:id
router.delete('/:id', authenticate, (req: Request, res: Response) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM tickets WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }
  res.json({ success: true });
});

export default router;
