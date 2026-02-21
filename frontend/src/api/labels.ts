import { client } from './client';
import { Label } from '../types';

export const labelsApi = {
  getAll: () => client.get<Label[]>('/labels'),
  create: (name: string, color: string) =>
    client.post<Label>('/labels', { name, color }),
};
