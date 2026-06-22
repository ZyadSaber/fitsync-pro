/**
 * Thin REST client for the Express API. Holds the access token in memory and
 * transparently refreshes it (via the httpOnly refresh cookie) once on a 401.
 */
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
export const getAccessToken = () => accessToken;

type Method = "GET" | "POST" | "PUT" | "DELETE";

async function rawFetch(method: Method, path: string, body?: unknown): Promise<Response> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await rawFetch("POST", "/auth/refresh");
    if (!res.ok) return false;
    const json = (await res.json()) as { data: AuthPayload };
    setAccessToken(json.data.accessToken);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  let res = await rawFetch(method, path, body);
  if (res.status === 401 && !path.startsWith("/auth/")) {
    if (await tryRefresh()) res = await rawFetch(method, path, body);
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
export async function apiSignIn(email: string, password: string): Promise<AuthPayload> {
  const data = await api.post<AuthPayload>("/auth/sign-in", { email, password });
  setAccessToken(data.accessToken);
  return data;
}

export async function apiSignUp(email: string, name: string, password: string): Promise<AuthPayload> {
  const data = await api.post<AuthPayload>("/auth/sign-up", { email, name, password });
  setAccessToken(data.accessToken);
  return data;
}

export async function apiRefresh(): Promise<AuthPayload | null> {
  const ok = await tryRefresh();
  if (!ok) return null;
  return api.get<{ user: AuthUser; home: string }>("/auth/me").then((me) => ({
    user: me.user,
    home: me.home,
    accessToken: getAccessToken()!,
  }));
}

export async function apiSignOut(): Promise<void> {
  await api.post("/auth/sign-out");
  setAccessToken(null);
}
