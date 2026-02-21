export type Status = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface DbUser {
  id: number;
  email: string;
  name: string;
  password: string;
  created_at: string;
}

export interface DbTicket {
  id: number;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  position: number;
  assignee_id: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface DbLabel {
  id: number;
  name: string;
  color: string;
}

export interface DbComment {
  id: number;
  ticket_id: number;
  author_id: number;
  body: string;
  created_at: string;
  updated_at: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; email: string };
    }
  }
}
