import { client } from './client';
import { Ticket, Status, Priority } from '../types';

export interface CreateTicketData {
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  assignee_id?: number | null;
  label_ids?: number[];
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  assignee_id?: number | null;
  label_ids?: number[];
}

export const ticketsApi = {
  getAll: () => client.get<Ticket[]>('/tickets'),

  getById: (id: number) => client.get<Ticket>(`/tickets/${id}`),

  create: (data: CreateTicketData) => client.post<Ticket>('/tickets', data),

  update: (id: number, data: UpdateTicketData) =>
    client.patch<Ticket>(`/tickets/${id}`, data),

  move: (id: number, status: Status, position: number) =>
    client.patch<Ticket>(`/tickets/${id}/move`, { status, position }),

  delete: (id: number) => client.delete<{ success: boolean }>(`/tickets/${id}`),
};
