import axios from 'axios';
import type { UserValues, Valuestor } from '@valuestor/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================================
// Auth
// ============================================================================

export const auth = {
  getNonce: (address: string) =>
    api.post<{ nonce: string }>('/auth/nonce', { address }),

  verify: (address: string, signature: string) =>
    api.post<{ token: string; user: any }>('/auth/verify', {
      address,
      signature,
    }),

  logout: () => api.post('/auth/logout'),
};

// ============================================================================
// Valuestor
// ============================================================================

export const valuestor = {
  create: (values: UserValues) =>
    api.post<Valuestor>('/valuestors', values),

  get: (address: string) =>
    api.get<Valuestor>(`/valuestors/${address}`),

  update: (address: string, values: Partial<UserValues>) =>
    api.put<Valuestor>(`/valuestors/${address}`, values),

  getPositions: (address: string) =>
    api.get(`/valuestors/${address}/positions`),

  getTrades: (address: string, limit = 50) =>
    api.get(`/valuestors/${address}/trades`, { params: { limit } }),

  getDecisions: (address: string, limit = 50) =>
    api.get(`/valuestors/${address}/decisions`, { params: { limit } }),
};

// ============================================================================
// Tokens
// ============================================================================

export const tokens = {
  getAll: (filters?: {
    category?: string;
    graduated?: boolean;
    limit?: number;
    offset?: number;
  }) => api.get('/tokens', { params: filters }),

  get: (address: string) => api.get(`/tokens/${address}`),

  getTrades: (address: string, limit = 50) =>
    api.get(`/tokens/${address}/trades`, { params: { limit } }),
};

export default api;
