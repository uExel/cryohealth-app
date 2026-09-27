import { useAuthStore } from '../state/auth';

/** Production is the default so a release build can never ship pointing at localhost.
 *  Local dev overrides it via `.env` (see `.env.example`); `||` also catches an empty value. */
const PRODUCTION_API_URL = 'https://api.cryohealth.io';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || PRODUCTION_API_URL;

/** React Native's Android fetch (OkHttp) has connect/read/write timeouts of 0 — i.e. none —
 *  so on a stalled rural connection a request can hang forever, and with it the sync
 *  engine's single-flight lock. Every request is aborted after this long instead. */
const REQUEST_TIMEOUT_MS = 30_000;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type ApiFetchOptions = Omit<RequestInit, 'body'> & { body?: unknown; auth?: boolean };

/** NestJS error bodies are `{ message, error, statusCode }`; fall back to the raw text. */
async function errorMessage(res: Response): Promise<string> {
  const text = await res.text().catch(() => '');
  try {
    const parsed = JSON.parse(text) as { message?: unknown };
    if (typeof parsed.message === 'string') return parsed.message;
    if (Array.isArray(parsed.message)) return parsed.message.join(', ');
  } catch {
    // not JSON
  }
  return text || res.statusText;
}

/** Thin fetch wrapper: JSON in/out, bearer auth, a request timeout, and a single place
 *  that reacts to an expired/invalid token (401) by clearing the session so the UI can
 *  redirect to login. */
export async function apiFetch<T>(path: string, opts: ApiFetchOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = opts;
  const token = auth ? useAuthStore.getState().token : null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // The timer spans the body read too — a response can stall mid-body as easily as
  // before the headers arrive.
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // Only a 401 on a request that actually carried a token means "session expired". A
    // 401 without one (a wrong PIN on /auth/login, or a request sent before the saved
    // session was hydrated) must never wipe the stored session.
    if (res.status === 401 && token) {
      await useAuthStore.getState().logout();
      throw new ApiError(401, 'Session expired');
    }

    if (!res.ok) {
      throw new ApiError(res.status, await errorMessage(res));
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (err) {
    if (controller.signal.aborted) throw new ApiError(0, 'Request timed out');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
