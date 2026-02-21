export type Status = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Label {
  id: number;
  name: string;
  color: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  position: number;
  assignee: User | null;
  labels: Label[];
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  ticket_id: number;
  author: User;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface ColumnDef {
  id: Status;
  label: string;
  color: string;
  headerColor: string;
}

export const COLUMNS: ColumnDef[] = [
  { id: 'backlog',     label: 'Backlog',      color: 'border-gray-400',   headerColor: 'bg-gray-100' },
  { id: 'todo',        label: 'To Do',        color: 'border-blue-400',   headerColor: 'bg-blue-50' },
  { id: 'in_progress', label: 'In Progress',  color: 'border-yellow-400', headerColor: 'bg-yellow-50' },
  { id: 'review',      label: 'Review',       color: 'border-purple-400', headerColor: 'bg-purple-50' },
  { id: 'done',        label: 'Done',         color: 'border-green-400',  headerColor: 'bg-green-50' },
];

export const PRIORITY_STYLES: Record<Priority, { bg: string; text: string; label: string; dot: string }> = {
  critical: { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Critical', dot: 'bg-red-500' },
  high:     { bg: 'bg-orange-100', text: 'text-orange-700', label: 'High',     dot: 'bg-orange-500' },
  medium:   { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium',   dot: 'bg-yellow-500' },
  low:      { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Low',      dot: 'bg-green-500' },
};
