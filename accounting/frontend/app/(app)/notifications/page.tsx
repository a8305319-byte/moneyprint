'use client';
import Link from 'next/link';
import { useState } from 'react';

type Notification = {
  id: number;
  type: string;
  title: string;
  body: string;
  caseId?: string;
  time: string;
  read: boolean;
};

const TYPE_COLORS: Record<string, string> = {
  逾期: 'bg-red-100 text-red-700',
  退回: 'bg-red-100 text-red-700',
  送審: 'bg-purple-100 text-purple-700',
  指派: 'bg-blue-100 text-blue-700',
  完成: 'bg-green-100 text-green-700',
  系統: 'bg-slate-100 text-slate-700',
  收款: 'bg-teal-100 text-teal-700',
};

const initialNotifications: Notification[] = [
  { id: 1, type: '逾期', title: '案件 A002 已逾期', body: '新光物流 2026-05 扣繳申報已超過截止日，請盡快處理。', caseId: 'A002', time: '2026-05-18 08:00', read: false },
  { id: 2, type: '退回', title: '案件 A001 被主管退回', body: '林主任退回宏達貿易案件，退回原因：缺少進口報單。', caseId: 'A001', time: '2026-05-16 11:20', read: false },
  { id: 3, type: '送審', title: '陳美玲送來案件 A009 待覆核', body: '全台科技 2026-05 扣繳申報已送審，請確認。', caseId: 'A009', time: '2026-05-17 14:00', read: false },
  { id: 4, type: '指派', title: '新案件指派給您', body: '您被指派負責大安診所 2026-05 營業稅申報（案件 A008）。', caseId: 'A008', time: '2026-05-16 09:00', read: false },
  { id: 5, type: '完成', title: '任務 T006 已完成', body: '陳美玲完成宏達貿易年度所得稅試算任務。', time: '2026-05-10 17:30', read: true },
  { id: 6, type: '收款', title: '收款提醒：宏達貿易 2026-02', body: '宏達貿易 2026-02 月份帳款 NT$ 8,000 尚未收款，請聯絡客戶。', time: '2026-05-15 10:00', read: true },
  { id: 7, type: '系統', title: '系統維護通知', body: '系統將於 2026-05-20 00:00–02:00 進行維護，期間無法使用。', time: '2026-05-14 09:00', read: true },
];

const TYPES = ['全部', '逾期', '退回', '送審', '指派', '完成', '收款', '系統'];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filterType, setFilterType] = useState('全部');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const markAllRead = () => setNotifications(notifications.map((n) => ({ ...n, read: true })));
  const markRead = (id: number) => setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n));

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
          {unreadCount > 0 && (
            <p className="mt-1 text-red-600 font-medium">您有 {unreadCount} 則未讀通知</p>
          )}
        </div>
        <div className="flex gap-3">
          <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
          <button
            className="rounded bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700"
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

      {/* 通知列表 */}
      <div className="space-y-3">
        {filtered.length === 0 && (
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
                <span className="text-sm text-slate-400">{n.time}</span>
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
