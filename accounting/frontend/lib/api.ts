const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getUser(): { id: string; name: string; email: string; role: string } | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setAuth(token: string, user: object) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<{ success: boolean; message: string; data: T }> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearAuth();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new ApiError(401, '登入已過期，請重新登入');
  }

  const json = await res.json().catch(() => ({ success: false, message: '伺服器錯誤', data: null }));

  if (!res.ok) {
    throw new ApiError(res.status, json.message ?? '請求失敗');
  }
  return json;
}

export const api = {
  get: <T = any>(path: string) => apiFetch<T>(path),
  post: <T = any>(path: string, body: object) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T = any>(path: string, body: object) =>
    apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T = any>(path: string) =>
    apiFetch<T>(path, { method: 'DELETE' }),
};
