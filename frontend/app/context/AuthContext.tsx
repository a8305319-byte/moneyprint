'use client';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

if (typeof window === 'undefined' && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn('[錢跡] NEXT_PUBLIC_API_URL is not set');
}

// 試用期 24 小時
const TRIAL_MS = 24 * 60 * 60 * 1000;

interface User {
  id: string; email: string; name: string; mode: 'PERSONAL' | 'BUSINESS';
  companyName?: string; taxId?: string; phone?: string; invoiceQuota?: number;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  demoMode: boolean;
  trialExpired: boolean;
  trialExpiresAt: number | null;
  apiFetch: (url: string, opts?: RequestInit) => Promise<Response>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
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

const CATEGORY_ICONS: Record<string, string> = {
  餐飲: '🍱', 交通: '🚇', 購物: '🛍', 娛樂: '🎬', 通訊: '📱', 薪資: '💰', 其他: '📋',
};

// ── 初始示範資料（相對於「今天」往前推算，讓 demo 不空白）─────────────────────
const _now = new Date();
const _todayDay = _now.getDate();
const _ym = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}`;
const _mkDate = (day: number) =>
  `${_ym}-${String(day).padStart(2, '0')}T00:00:00.000Z`;

interface DemoTxTpl {
  id: string; day: number; description: string;
  amount: string; direction: 'DEBIT' | 'CREDIT';
  category: { name: string; icon: string };
}

// 固定放在月初幾天，只有「< 今天」的才會帶入，避免跨月或未來日期問題
const DEMO_TX_TEMPLATES: DemoTxTpl[] = [
  { id: 'd-s-1', day: 1, description: '早餐',     amount: '65',    direction: 'DEBIT',  category: { name: '餐飲', icon: '🍱' } },
  { id: 'd-s-2', day: 1, description: '搭捷運',   amount: '28',    direction: 'DEBIT',  category: { name: '交通', icon: '🚇' } },
  { id: 'd-s-3', day: 2, description: '午餐便當', amount: '120',   direction: 'DEBIT',  category: { name: '餐飲', icon: '🍱' } },
  { id: 'd-s-4', day: 3, description: '薪資入帳', amount: '42000', direction: 'CREDIT', category: { name: '薪資', icon: '💰' } },
  { id: 'd-s-5', day: 3, description: '超市購物', amount: '580',   direction: 'DEBIT',  category: { name: '購物', icon: '🛍' } },
  { id: 'd-s-6', day: 4, description: '電話費',   amount: '699',   direction: 'DEBIT',  category: { name: '通訊', icon: '📱' } },
  { id: 'd-s-7', day: 4, description: '晚餐聚餐', amount: '350',   direction: 'DEBIT',  category: { name: '餐飲', icon: '🍱' } },
  { id: 'd-s-8', day: 5, description: '計程車',   amount: '220',   direction: 'DEBIT',  category: { name: '交通', icon: '🚇' } },
  { id: 'd-s-9', day: 5, description: '便利商店', amount: '85',    direction: 'DEBIT',  category: { name: '購物', icon: '🛍' } },
];

const _seedTxs = DEMO_TX_TEMPLATES
  .filter(t => t.day < _todayDay)          // 只帶過去的日期
  .map(t => ({
    id: t.id,
    txDate: _mkDate(t.day),
    description: t.description,
    amount: t.amount,
    direction: t.direction,
    status: 'DONE' as const,
    category: t.category,
  }));

const _seedDebit  = _seedTxs.filter(t => t.direction === 'DEBIT');
const _seedCredit = _seedTxs.filter(t => t.direction === 'CREDIT');

// Demo state：帶入初始示範資料；新增/刪除仍在記憶體，刷新重置
const demoState = {
  txCount:           _seedTxs.length,
  totalExpense:      _seedDebit.reduce((s, t)  => s + Number(t.amount), 0),
  totalIncome:       _seedCredit.reduce((s, t) => s + Number(t.amount), 0),
  todayTxCount:      0,
  todayTotalExpense: 0,
  txs: [..._seedTxs] as any[],
};

function mockRes(data: any): Response {
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockApiFetch(url: string, opts: RequestInit = {}): Response {
  const method = (opts.method ?? 'GET').toUpperCase();
  const path = url.split('?')[0];

  // DELETE /ledger/:id
  if (method === 'DELETE' && /\/ledger\//.test(path)) {
    const id = path.split('/ledger/')[1];
    const tx = demoState.txs.find(t => t.id === id);
    if (tx) {
      demoState.txs = demoState.txs.filter(t => t.id !== id);
      demoState.txCount = Math.max(0, demoState.txCount - 1);
      if (tx.direction === 'DEBIT') {
        demoState.totalExpense = Math.max(0, demoState.totalExpense - Number(tx.amount));
        const today = new Date().toISOString().slice(0, 10);
        if (String(tx.txDate).slice(0, 10) === today) {
          demoState.todayTotalExpense = Math.max(0, demoState.todayTotalExpense - Number(tx.amount));
          demoState.todayTxCount = Math.max(0, demoState.todayTxCount - 1);
        }
      } else {
        demoState.totalIncome = Math.max(0, demoState.totalIncome - Number(tx.amount));
      }
    }
    return mockRes({ success: true });
  }

  // POST /ledger — manual entry
  if (method === 'POST' && path.endsWith('/ledger')) {
    const body = opts.body ? JSON.parse(opts.body as string) : {};
    const amount = Number(body.amount) || 0;
    const direction = body.direction ?? 'DEBIT';
    const today = new Date().toISOString().slice(0, 10);
    const txDate = body.txDate ?? today;
    const isToday = txDate === today;
    const month = new Date().toISOString().slice(0, 7);

    if (direction === 'DEBIT') {
      demoState.totalExpense += amount;
      if (isToday) demoState.todayTotalExpense += amount;
    } else {
      demoState.totalIncome += amount;
    }
    demoState.txCount += 1;
    if (isToday) demoState.todayTxCount += 1;

    const newTx = {
      id: `d-${Date.now()}`,
      txDate: txDate + 'T00:00:00.000Z',
      description: body.description ?? '記帳',
      amount: String(amount), direction,
      status: 'DONE',
      category: body.categoryName
        ? { name: body.categoryName, icon: CATEGORY_ICONS[body.categoryName] ?? '📋' }
        : null,
    };
    demoState.txs.unshift(newTx);

    return mockRes({
      transaction: newTx,
      todaySummary: {
        totalExpense: demoState.todayTotalExpense,
        txCount: demoState.todayTxCount,
      },
      monthSummary: {
        totalExpense: demoState.totalExpense,
        txCount: demoState.txCount,
        month,
      },
    });
  }

  // All other writes
  if (method !== 'GET') return mockRes({ success: true });

  // GET endpoints
  if (path.endsWith('/reports/monthly-summary')) {
    return mockRes({
      totalExpense: demoState.totalExpense,
      totalIncome: demoState.totalIncome,
      netFlow: demoState.totalIncome - demoState.totalExpense,
      txCount: demoState.txCount,
    });
  }

  if (path.endsWith('/reports/category-breakdown')) {
    const breakdown: Record<string, { totalAmount: number; txCount: number }> = {};
    const debitTxs = demoState.txs.filter(t => t.direction === 'DEBIT');
    const total = debitTxs.reduce((s, t) => s + Number(t.amount), 0);
    for (const tx of debitTxs) {
      const name = tx.category?.name ?? '其他';
      if (!breakdown[name]) breakdown[name] = { totalAmount: 0, txCount: 0 };
      breakdown[name].totalAmount += Number(tx.amount);
      breakdown[name].txCount += 1;
    }
    return mockRes(
      Object.entries(breakdown)
        .map(([categoryName, v]) => ({
          categoryName, ...v,
          percentage: total > 0 ? Number(((v.totalAmount / total) * 100).toFixed(1)) : 0,
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount)
    );
  }

  if (path.endsWith('/reports/monthly-trend')) {
    return mockRes(
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i));
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const isCurrent = i === 5;
        return {
          month,
          totalExpense: isCurrent ? demoState.totalExpense : 0,
          totalIncome:  isCurrent ? demoState.totalIncome  : 0,
          netFlow:      isCurrent ? demoState.totalIncome - demoState.totalExpense : 0,
        };
      })
    );
  }

  if (path.endsWith('/ledger')) {
    const qs = url.includes('?') ? url.split('?')[1] : '';
    const monthParam = new URLSearchParams(qs).get('month');
    const txs = monthParam
      ? demoState.txs.filter(t => String(t.txDate).slice(0, 7) === monthParam)
      : demoState.txs;
    return mockRes(txs);
  }

  if (path.endsWith('/matches/pending'))           return mockRes([]);
  if (path.endsWith('/invoices'))                  return mockRes([]);
  if (path.endsWith('/business-invoices/summary')) return mockRes(null);
  if (path.endsWith('/business-invoices'))         return mockRes([]);
  return mockRes(null);
}

// ──────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [trialExpired, setTrialExpired] = useState(false);
  const [trialExpiresAt, setTrialExpiresAt] = useState<number | null>(null);
  const demoRef = useRef(false);
  const logoutRef = useRef<() => void>(() => {});

  const logout = useCallback(() => {
    localStorage.removeItem('mp_token');
    localStorage.removeItem('mp_demo');
    localStorage.removeItem('mp_trial_start');
    demoRef.current = false;
    setDemoMode(false);
    setTrialExpired(false);
    setTrialExpiresAt(null);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => { logoutRef.current = logout; }, [logout]);

  const enterDemo = useCallback(() => {
    localStorage.removeItem('mp_token');
    localStorage.setItem('mp_demo', 'true');
    // 第一次進入才記錄試用開始時間
    if (!localStorage.getItem('mp_trial_start')) {
      localStorage.setItem('mp_trial_start', String(Date.now()));
    }
    const start = parseInt(localStorage.getItem('mp_trial_start')!);
    const expiresAt = start + TRIAL_MS;
    setTrialExpiresAt(expiresAt);
    setTrialExpired(Date.now() >= expiresAt);
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
      // 試用期計算
      let start = parseInt(localStorage.getItem('mp_trial_start') ?? '0');
      if (!start) {
        start = Date.now();
        localStorage.setItem('mp_trial_start', String(start));
      }
      const expiresAt = start + TRIAL_MS;
      setTrialExpiresAt(expiresAt);
      setTrialExpired(Date.now() >= expiresAt);
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
    localStorage.removeItem('mp_demo');
    localStorage.removeItem('mp_trial_start');
    demoRef.current = false;
    setDemoMode(false);
    setTrialExpired(false);
    setTrialExpiresAt(null);
    localStorage.setItem('mp_token', json.data.token);
    setToken(json.data.token);
    setUser(json.data.user);
  };

  const register = async (data: { email: string; password: string; name: string }) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? '註冊失敗');
    localStorage.removeItem('mp_demo');
    localStorage.removeItem('mp_trial_start');
    demoRef.current = false;
    setDemoMode(false);
    setTrialExpired(false);
    setTrialExpiresAt(null);
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
    <AuthContext.Provider value={{
      user, token, loading, demoMode,
      trialExpired, trialExpiresAt,
      apiFetch, login, register, logout, enterDemo,
      switchMode, updateProfile, refetch,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
