import { client } from './client';
import { User } from '../types';

export const usersApi = {
  getAll: () => client.get<User[]>('/users'),
};
