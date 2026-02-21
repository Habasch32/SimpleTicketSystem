import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const DB_PATH = process.env.DB_PATH
  ? path.resolve(__dirname, '..', process.env.DB_PATH)
  : path.join(__dirname, '../../data/tickets.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDb(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      email      TEXT    NOT NULL UNIQUE,
      name       TEXT    NOT NULL,
      password   TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS labels (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      name  TEXT    NOT NULL UNIQUE,
      color TEXT    NOT NULL DEFAULT '#6B7280'
    );

    INSERT OR IGNORE INTO labels (name, color) VALUES
      ('bug',         '#EF4444'),
      ('feature',     '#3B82F6'),
      ('enhancement', '#8B5CF6'),
      ('docs',        '#6B7280'),
      ('urgent',      '#F97316');

    CREATE TABLE IF NOT EXISTS tickets (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      status      TEXT    NOT NULL DEFAULT 'backlog'
                    CHECK(status IN ('backlog','todo','in_progress','review','done')),
      priority    TEXT    NOT NULL DEFAULT 'medium'
                    CHECK(priority IN ('critical','high','medium','low')),
      position    REAL    NOT NULL DEFAULT 0,
      assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_by  INTEGER NOT NULL REFERENCES users(id),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ticket_labels (
      ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      label_id  INTEGER NOT NULL REFERENCES labels(id)  ON DELETE CASCADE,
      PRIMARY KEY (ticket_id, label_id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id  INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      author_id  INTEGER NOT NULL REFERENCES users(id),
      body       TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_tickets_status   ON tickets(status);
    CREATE INDEX IF NOT EXISTS idx_tickets_position ON tickets(position);
    CREATE INDEX IF NOT EXISTS idx_comments_ticket  ON comments(ticket_id);
  `);

  console.log('Database initialized at', DB_PATH);
}
