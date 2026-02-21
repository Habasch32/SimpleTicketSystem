import { client } from './client';
import { User } from '../types';

export const authApi = {
  register: (email: string, name: string, password: string) =>
    client.post<{ token: string; user: User }>('/auth/register', { email, name, password }),

  login: (email: string, password: string) =>
    client.post<{ token: string; user: User }>('/auth/login', { email, password }),

  me: () => client.get<{ user: User }>('/auth/me'),
};
