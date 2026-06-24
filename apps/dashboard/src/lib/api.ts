/**
 * Thin REST client for the Express API. Holds the access token in memory and
 * transparently refreshes it (via the httpOnly refresh cookie) once on a 401.
 */
import { API, API_BASE, API_PREFIX } from "@/constants/apiRoutes";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export interface AuthUser {
  id: string;
  role: "super_admin" | "gym" | "coach" | "member" | "client";
  gymId: string | null;
  isSuperAdmin: boolean;
}

export interface AuthPayload {
  user: AuthUser;
  accessToken: string;
  home: string;
}

let accessToken: string | null = null;
export const setAccessToken = (t: string | null) => {
  accessToken = t;
};

type Method = "GET" | "POST" | "PUT" | "DELETE";

async function rawFetch(method: Method, path: string, body?: unknown): Promise<Response> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return fetch(`${API_PREFIX}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
}

/** POST an auth endpoint, store the returned access token, and return the
 *  payload — or null when there's no valid session (never throws). */
async function authPost(path: string): Promise<AuthPayload | null> {
  try {
    const res = await rawFetch("POST", path);
    if (!res.ok) return null;
    const { data } = (await res.json()) as { data: AuthPayload };
    setAccessToken(data.accessToken);
    return data;
  } catch {
    return null;
  }
}

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  let res = await rawFetch(method, path, body);
  if (res.status === 401 && !path.startsWith(`${API_BASE.auth}/`)) {
    if (await authPost(API.auth.refresh)) res = await rawFetch(method, path, body);
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(json?.error ?? res.statusText, res.status);
  return json?.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
};

// ── Auth-specific helpers ────────────────────────────────────────────────────

/** POST credentials to an auth endpoint, store the token, return the payload
 *  (throws ApiError on failure — for sign-in / sign-up). */
async function authSubmit(path: string, body: unknown): Promise<AuthPayload> {
  const data = await api.post<AuthPayload>(path, body);
  setAccessToken(data.accessToken);
  return data;
}

export const apiSignIn = (email: string, password: string) =>
  authSubmit(API.auth.signIn, { email, password });

export const apiSignUp = (email: string, name: string, password: string) =>
  authSubmit(API.auth.signUp, { email, name, password });

/** Validate the session in the httpOnly refresh cookie and renew its 5-day
 *  expiry, returning the full payload (user + token + role home) or null. */
export const apiRevalidate = () => authPost(API.auth.revalidate);

export async function apiSignOut(): Promise<void> {
  await api.post(API.auth.signOut);
  setAccessToken(null);
}
