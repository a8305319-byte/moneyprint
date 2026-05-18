'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAuth } from '@/lib/api';

const ROLE_LABELS: Record<string, string> = {
  BOSS: '老闆', MANAGER: '主任', SENIOR_ACCT: '資深會計',
  ACCT: '一般會計', ASSISTANT: '助理', INTERN: '實習生',
  READONLY: '唯讀', ADMIN: '系統管理員',
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('請填寫 Email 與密碼'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.token, res.data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message ?? '登入失敗，請確認帳號密碼');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-base">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-800">宏遠會計事務所</h1>
          <p className="mt-1 text-slate-500">工作管理平台</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 rounded-xl bg-white p-8 shadow-md">
          <h2 className="text-xl font-semibold text-slate-700">登入系統</h2>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Email</label>
            <input
              className="w-full rounded border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="your@email.com"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">密碼</label>
            <input
              className="w-full rounded border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 px-4 py-3 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '登入中…' : '登入'}
          </button>
        </form>

        <div className="mt-6 rounded-lg border bg-white p-4 text-sm text-slate-500">
          <p className="font-semibold mb-2">測試帳號（密碼皆為 password123）：</p>
          <div className="space-y-1">
            {[
              { email: 'boss@firm.com', name: '林國棟', role: 'BOSS' },
              { email: 'manager@firm.com', name: '張淑芬', role: 'MANAGER' },
              { email: 'senior@firm.com', name: '陳美玲', role: 'SENIOR_ACCT' },
              { email: 'acct@firm.com', name: '王志明', role: 'ACCT' },
              { email: 'assistant@firm.com', name: '黃曉玲', role: 'ASSISTANT' },
            ].map((a) => (
              <button
                key={a.email}
                type="button"
                className="block w-full rounded border px-3 py-2 text-left hover:bg-slate-50"
                onClick={() => { setEmail(a.email); setPassword('password123'); }}
              >
                <span className="font-medium">{a.name}</span>
                <span className="ml-2 text-slate-400">({ROLE_LABELS[a.role]})</span>
                <span className="ml-2 text-slate-400">{a.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
