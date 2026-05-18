'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, getUser } from '@/lib/api';

const TYPE_COLORS: Record<string, string> = {
  逾期: 'bg-red-100 text-red-700',
  退回: 'bg-red-100 text-red-700',
  送審: 'bg-purple-100 text-purple-700',
  指派: 'bg-blue-100 text-blue-700',
  完成: 'bg-green-100 text-green-700',
  系統: 'bg-slate-100 text-slate-700',
  收款: 'bg-teal-100 text-teal-700',
};

const TYPES = ['全部', '逾期', '退回', '送審', '指派', '完成', '收款', '系統'];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('全部');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const user = getUser();

  useEffect(() => {
    api.get('/notifications')
      .then((res) => setNotifications(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const markRead = (id: string) => {
    api.patch(`/notifications/${id}/read`, {}).then(() => {
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    });
  };

  const markAllRead = () => {
    api.patch('/notifications/read-all', {}).then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    });
  };

  const filtered = notifications.filter((n) => {
    const matchType = filterType === '全部' || n.type === filterType;
    const matchUnread = !showUnreadOnly || !n.read;
    return matchType && matchUnread;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <main className="space-y-5 text-base">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">通知提醒</h1>
          {!loading && unreadCount > 0 && (
            <p className="mt-1 text-red-600 font-medium">您有 {unreadCount} 則未讀通知</p>
          )}
        </div>
        <div className="flex gap-3">
          <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
          <button
            className="rounded bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            全部標為已讀
          </button>
        </div>
      </div>

      {/* 篩選 */}
      <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4">
        <select className="rounded border px-4 py-3 text-base" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <label className="flex items-center gap-2 px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
          />
          <span>只顯示未讀</span>
        </label>
        <button
          className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200"
          onClick={() => { setFilterType('全部'); setShowUnreadOnly(false); }}
        >清除篩選</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">無法載入通知：{error}</div>
      )}

      {/* 通知列表 */}
      <div className="space-y-3">
        {loading && <div className="rounded-lg border bg-white p-8 text-center text-slate-400">載入中…</div>}
        {!loading && filtered.length === 0 && (
          <div className="rounded-lg border bg-white p-8 text-center text-slate-400">沒有符合條件的通知</div>
        )}
        {filtered.map((n) => (
          <div
            key={n.id}
            className={`rounded-lg border p-4 transition-colors ${n.read ? 'bg-white' : 'border-blue-300 bg-blue-50'}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  {!n.read && <span className="h-2.5 w-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-0.5" />}
                  <span className={`rounded-full px-2 py-0.5 text-sm font-medium ${TYPE_COLORS[n.type] ?? 'bg-slate-100 text-slate-700'}`}>
                    {n.type}
                  </span>
                  <span className="font-semibold">{n.title}</span>
                </div>
                <p className="text-slate-600 ml-7">{n.body}</p>
                {n.caseId && (
                  <Link href={`/cases/${n.caseId}`} className="ml-7 mt-1 inline-block text-blue-600 text-sm hover:underline">
                    → 查看案件 {n.caseId}
                  </Link>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="text-sm text-slate-400">{n.createdAt ?? n.time}</span>
                {!n.read && (
                  <button
                    className="rounded bg-slate-200 px-3 py-1 text-sm hover:bg-slate-300"
                    onClick={() => markRead(n.id)}
                  >
                    標為已讀
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
