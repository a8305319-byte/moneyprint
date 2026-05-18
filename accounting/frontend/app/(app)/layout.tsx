'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { getUser, clearAuth, api } from '@/lib/api';

const ROLE_LABELS: Record<string, string> = {
  BOSS: '老闆', MANAGER: '主任', SENIOR_ACCT: '資深會計',
  ACCT: '一般會計', ASSISTANT: '助理', INTERN: '實習生',
  READONLY: '唯讀', ADMIN: '系統管理員',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const stored = getUser();
    if (!stored) {
      router.replace('/login');
      return;
    }
    setUser(stored);

    api.get(`/notifications?recipientId=${stored.id}`)
      .then((res) => {
        const count = res.data.filter((n: any) => !n.read).length;
        setUnread(count);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-base">
      <Sidebar />
      <div className="ml-72">
        <header className="flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">宏遠會計事務所</h1>
            <p className="text-slate-500">
              使用者：{user ? `${user.name}（${ROLE_LABELS[user.role] ?? user.role}）` : '載入中…'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/notifications">
              <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200">
                🔔 通知{unread > 0 && <span className="ml-1 font-semibold text-red-600">（未讀 {unread}）</span>}
              </button>
            </Link>
            <button
              className="rounded bg-red-600 px-4 py-3 text-white font-semibold hover:bg-red-700"
              onClick={handleLogout}
            >
              登出
            </button>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
