'use client';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

if (typeof window === 'undefined' && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn('[錢跡] NEXT_PUBLIC_API_URL is not set');
}

interface User {
  id: string; email: string; name: string; mode: 'PERSONAL' | 'BUSINESS';
  companyName?: string; taxId?: string; phone?: string; invoiceQuota?: number;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  demoMode: boolean;
  apiFetch: (url: string, opts?: RequestInit) => Promise<Response>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; companyName?: string; taxId?: string }) => Promise<void>;
  logout: () => void;
  enterDemo: () => void;
  switchMode: (mode: 'PERSONAL' | 'BUSINESS') => Promise<void>;
  updateProfile: (data: Partial<User & { invoiceQuota: number }>) => Promise<void>;
  refetch: () => Promise<void>;
}

// ── Demo Mode ──────────────────────────────────────────────────────────────────

const DEMO_USER: User = {
  id: 'demo',
  email: 'demo@moneyprint.app',
  name: '示範使用者',
  mode: 'PERSONAL',
};

function getDemoTxs() {
  const base = new Date();
  const day = (n: number) => {
    const d = new Date(base); d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };
  return [
    { id: 'd01', txDate: day(0),  description: '全家便利商店',   amount: '165',   direction: 'DEBIT',  status: 'DONE', category: { name: '餐飲', icon: '🍱' } },
    { id: 'd02', txDate: day(1),  description: '台北捷運',       amount: '50',    direction: 'DEBIT',  status: 'DONE', category: { name: '交通', icon: '🚇' } },
    { id: 'd03', txDate: day(2),  description: '薪資轉帳',       amount: '55000', direction: 'CREDIT', status: 'DONE', category: { name: '薪資', icon: '💰' } },
    { id: 'd04', txDate: day(3),  description: 'Netflix',        amount: '330',   direction: 'DEBIT',  status: 'DONE', category: { name: '娛樂', icon: '🎬' } },
    { id: 'd05', txDate: day(4),  description: '誠品書店',       amount: '580',   direction: 'DEBIT',  status: 'DONE', category: { name: '購物', icon: '📚' } },
    { id: 'd06', txDate: day(5),  description: '麥當勞',         amount: '198',   direction: 'DEBIT',  status: 'DONE', category: { name: '餐飲', icon: '🍟' } },
    { id: 'd07', txDate: day(6),  description: '台灣大哥大',     amount: '699',   direction: 'DEBIT',  status: 'DONE', category: { name: '通訊', icon: '📱' } },
    { id: 'd08', txDate: day(7),  description: 'UNIQLO',         amount: '1490',  direction: 'DEBIT',  status: 'DONE', category: { name: '購物', icon: '👔' } },
    { id: 'd09', txDate: day(8),  description: '7-ELEVEN',       amount: '89',    direction: 'DEBIT',  status: 'DONE', category: { name: '餐飲', icon: '🏪' } },
    { id: 'd10', txDate: day(9),  description: '悠遊卡加值',     amount: '500',   direction: 'DEBIT',  status: 'DONE', category: { name: '交通', icon: '🚌' } },
  ];
}

function getDemoTrend() {
  const expenses = [24800, 31200, 19800, 26500, 28440, 22100];
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i));
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { month, totalExpense: expenses[i], totalIncome: 55000, netFlow: 55000 - expenses[i] };
  });
}

function mockRes(data: any): Response {
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockApiFetch(url: string, opts: RequestInit = {}): Response {
  if ((opts.method ?? 'GET').toUpperCase() !== 'GET') return mockRes({ success: true });

  const path = url.split('?')[0];
  if (path.endsWith('/reports/monthly-summary'))  return mockRes({ totalExpense: 28440, totalIncome: 55000, netFlow: 26560, txCount: 47 });
  if (path.endsWith('/reports/category-breakdown')) return mockRes([
    { categoryName: '餐飲', totalAmount: 8240, txCount: 18, percentage: 29.0 },
    { categoryName: '購物', totalAmount: 6890, txCount: 7,  percentage: 24.2 },
    { categoryName: '交通', totalAmount: 4520, txCount: 8,  percentage: 15.9 },
    { categoryName: '娛樂', totalAmount: 3180, txCount: 5,  percentage: 11.2 },
    { categoryName: '通訊', totalAmount: 5610, txCount: 9,  percentage: 19.7 },
  ]);
  if (path.endsWith('/reports/monthly-trend'))    return mockRes(getDemoTrend());
  if (path.endsWith('/ledger'))                   return mockRes(getDemoTxs());
  if (path.endsWith('/matches/pending'))          return mockRes([]);
  if (path.endsWith('/invoices'))                 return mockRes([]);
  if (path.endsWith('/business-invoices/summary')) return mockRes(null);
  if (path.endsWith('/business-invoices'))        return mockRes([]);
  return mockRes(null);
}

// ──────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const demoRef = useRef(false);
  const logoutRef = useRef<() => void>(() => {});

  const logout = useCallback(() => {
    localStorage.removeItem('mp_token');
    localStorage.removeItem('mp_demo');
    demoRef.current = false;
    setDemoMode(false);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => { logoutRef.current = logout; }, [logout]);

  const enterDemo = useCallback(() => {
    localStorage.removeItem('mp_token');
    localStorage.setItem('mp_demo', 'true');
    demoRef.current = true;
    setDemoMode(true);
    setUser(DEMO_USER);
    setToken('demo');
  }, []);

  const apiFetch = useCallback(async (url: string, opts: RequestInit = {}): Promise<Response> => {
    if (demoRef.current) return mockApiFetch(url, opts);
    const t = localStorage.getItem('mp_token');
    const res = await fetch(`${API}${url}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
        ...opts.headers,
      },
    });
    if (res.status === 401) logoutRef.current();
    return res;
  }, []);

  const refetch = useCallback(async () => {
    if (localStorage.getItem('mp_demo')) {
      demoRef.current = true;
      setDemoMode(true);
      setUser(DEMO_USER);
      setToken('demo');
      setLoading(false);
      return;
    }
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
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? '登入失敗');
    // Clear demo on real login
    localStorage.removeItem('mp_demo');
    demoRef.current = false;
    setDemoMode(false);
    localStorage.setItem('mp_token', json.data.token);
    setToken(json.data.token);
    setUser(json.data.user);
  };

  const register = async (data: { email: string; password: string; name: string; companyName?: string; taxId?: string }) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? '註冊失敗');
    // Clear demo on real register
    localStorage.removeItem('mp_demo');
    demoRef.current = false;
    setDemoMode(false);
    localStorage.setItem('mp_token', json.data.token);
    setToken(json.data.token);
    setUser(json.data.user);
  };

  const switchMode = async (mode: 'PERSONAL' | 'BUSINESS') => {
    if (demoRef.current) { setUser(u => u ? { ...u, mode } : u); return; }
    const res = await apiFetch('/auth/switch-mode', { method: 'POST', body: JSON.stringify({ mode }) });
    if (res.ok) setUser(u => u ? { ...u, mode } : u);
  };

  const updateProfile = async (data: any) => {
    if (demoRef.current) return;
    const res = await apiFetch('/auth/update-profile', { method: 'POST', body: JSON.stringify(data) });
    const json = await res.json();
    if (res.ok) setUser(json.data);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, demoMode, apiFetch, login, register, logout, enterDemo, switchMode, updateProfile, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
