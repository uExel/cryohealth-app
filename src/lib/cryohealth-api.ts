import { apiFetch } from './api-client';
import type {
  ApiAlert,
  ApiCase,
  ApiLake,
  ApiProtocol,
  CreateCaseInput,
  LoginResponse,
  PageResult,
} from './api-types';

export const login = (identifier: string, password: string) =>
  apiFetch<LoginResponse>('/auth/login', { method: 'POST', auth: false, body: { identifier, password } });

export const fetchLakes = (page = 1, pageSize = 100) =>
  apiFetch<PageResult<ApiLake>>(`/lakes?page=${page}&pageSize=${pageSize}`, { auth: false });

export const fetchAlerts = (page = 1, pageSize = 100) =>
  apiFetch<PageResult<ApiAlert>>(`/alerts?page=${page}&pageSize=${pageSize}`, { auth: false });

export const createCase = (input: CreateCaseInput) =>
  apiFetch<ApiCase>('/cases', { method: 'POST', body: input });

export const fetchMyCases = (page = 1, pageSize = 100) =>
  apiFetch<PageResult<ApiCase>>(`/cases?page=${page}&pageSize=${pageSize}`);

/** Bare array, not paginated — matches the API's actual response shape. */
export const fetchProtocols = () =>
  apiFetch<ApiProtocol[]>('/protocols', { auth: false });
