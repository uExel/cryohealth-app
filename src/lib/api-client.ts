import { useAuthStore } from '../state/auth';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type ApiFetchOptions = Omit<RequestInit, 'body'> & { body?: unknown; auth?: boolean };

/** Thin fetch wrapper: JSON in/out, bearer auth, and a single place that reacts to an
 *  expired/invalid token (401) by clearing the session so the UI can redirect to login. */
export async function apiFetch<T>(path: string, opts: ApiFetchOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = opts;
  const token = auth ? useAuthStore.getState().token : null;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    await useAuthStore.getState().logout();
    throw new ApiError(401, 'Session expired');
  }

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, message || res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
