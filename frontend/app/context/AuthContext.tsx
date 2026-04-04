'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface User {
  id: string; email: string; name: string; mode: 'PERSONAL' | 'BUSINESS';
  companyName?: string; taxId?: string; phone?: string; invoiceQuota?: number;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; companyName?: string; taxId?: string }) => Promise<void>;
  logout: () => void;
  switchMode: (mode: 'PERSONAL' | 'BUSINESS') => Promise<void>;
  updateProfile: (data: Partial<User & { invoiceQuota: number }>) => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const authFetch = (url: string, opts: RequestInit = {}) =>
    fetch(`${API}${url}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers },
    });

  const refetch = async () => {
    const t = localStorage.getItem('mp_token');
    if (!t) { setLoading(false); return; }
    try {
      const res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${t}` } });
      if (!res.ok) { localStorage.removeItem('mp_token'); setLoading(false); return; }
      const json = await res.json();
      setUser(json.data);
      setToken(t);
    } catch { localStorage.removeItem('mp_token'); }
    setLoading(false);
  };

  useEffect(() => { refetch(); }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? '登入失敗');
    localStorage.setItem('mp_token', json.data.token);
    setToken(json.data.token);
    setUser(json.data.user);
  };

  const register = async (data: { email: string; password: string; name: string; companyName?: string; taxId?: string }) => {
    const res = await fetch(`${API}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? '註冊失敗');
    localStorage.setItem('mp_token', json.data.token);
    setToken(json.data.token);
    setUser(json.data.user);
  };

  const logout = () => {
    localStorage.removeItem('mp_token');
    setToken(null);
    setUser(null);
  };

  const switchMode = async (mode: 'PERSONAL' | 'BUSINESS') => {
    const t = localStorage.getItem('mp_token');
    const res = await fetch(`${API}/auth/switch-mode`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }, body: JSON.stringify({ mode }) });
    const json = await res.json();
    if (res.ok) setUser(u => u ? { ...u, mode } : u);
  };

  const updateProfile = async (data: any) => {
    const t = localStorage.getItem('mp_token');
    const res = await fetch(`${API}/auth/update-profile`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }, body: JSON.stringify(data) });
    const json = await res.json();
    if (res.ok) setUser(json.data);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchMode, updateProfile, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
