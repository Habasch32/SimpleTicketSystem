import { client } from './client';
import { Comment } from '../types';

export const commentsApi = {
  getByTicket: (ticketId: number) =>
    client.get<Comment[]>(`/tickets/${ticketId}/comments`),

  create: (ticketId: number, body: string) =>
    client.post<Comment>(`/tickets/${ticketId}/comments`, { body }),

  delete: (ticketId: number, commentId: number) =>
    client.delete<{ success: boolean }>(`/tickets/${ticketId}/comments/${commentId}`),
};
