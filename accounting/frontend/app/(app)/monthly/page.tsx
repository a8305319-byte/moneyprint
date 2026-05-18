'use client';
import Link from 'next/link';
import { useState } from 'react';

const STATUS_STEP_INDEX: Record<string, number> = {
  建立: 0, 指派: 1, 等待資料: 2, 收到資料: 3, 處理中: 4,
  送主管覆核: 5, 退回修改: 6, 待申報: 7, 已申報: 8, 歸檔: 9, 結案: 10,
};

const monthlyClients = [
  {
    client: '宏達貿易', clientId: 'C001', owner: '陳美玲', caseId: 'A001',
    status: '退回修改', progress: 55, overdue: false, note: '缺進口報單',
  },
  {
    client: '新光物流', clientId: 'C002', owner: '王志明', caseId: 'A002',
    status: '退回修改', progress: 45, overdue: true, note: '截止日已過',
  },
  {
    client: '全台科技', clientId: 'C003', owner: '林佳慧', caseId: 'A003',
    status: '處理中', progress: 45, overdue: false, note: '',
  },
  {
    client: '信義建設', clientId: 'C004', owner: '李建宏', caseId: 'A010',
    status: '指派', progress: 9, overdue: false, note: '',
  },
  {
    client: '松山食品', clientId: 'C005', owner: '林佳慧', caseId: 'A007',
    status: '等待資料', progress: 18, overdue: false, note: '已通知客戶',
  },
  {
    client: '大安診所', clientId: 'C006', owner: '張淑芬', caseId: 'A008',
    status: '收到資料', progress: 27, overdue: true, note: '截止日已過',
  },
];

const PROGRESS_COLORS: Record<string, string> = {
  退回修改: 'bg-red-500',
  送主管覆核: 'bg-purple-500',
  處理中: 'bg-blue-500',
  收到資料: 'bg-blue-400',
  等待資料: 'bg-yellow-400',
  指派: 'bg-slate-400',
  建立: 'bg-slate-300',
  待申報: 'bg-orange-500',
  已申報: 'bg-teal-500',
  歸檔: 'bg-green-500',
  結案: 'bg-green-600',
};

const MONTHS = ['2026-05', '2026-04', '2026-03'];

export default function MonthlyPage() {
  const [selectedMonth, setSelectedMonth] = useState('2026-05');
  const [search, setSearch] = useState('');

  const filtered = monthlyClients.filter((c) => c.client.includes(search));
  const done = filtered.filter((c) => ['已申報', '歸檔', '結案'].includes(c.status)).length;
  const overdue = filtered.filter((c) => c.overdue).length;

  return (
    <main className="space-y-5 text-base">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">每月帳務總覽</h1>
        <button className="rounded bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700">批次建立本月案件</button>
      </div>

      {/* 月份選擇 */}
      <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4">
        <select className="rounded border px-4 py-3 text-base font-semibold" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
          {MONTHS.map((m) => <option key={m}>{m}</option>)}
        </select>
        <input
          className="rounded border px-4 py-3 text-base w-48"
          placeholder="搜尋客戶…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
      </div>

      {/* 月份統計 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-slate-800">{filtered.length}</p>
          <p className="mt-1 text-slate-500">本月客戶數</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{done}</p>
          <p className="mt-1 text-slate-500">已完成申報</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{filtered.length - done - overdue}</p>
          <p className="mt-1 text-slate-500">進行中</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{overdue}</p>
          <p className="mt-1 text-slate-500">已逾期</p>
        </div>
      </div>

      {/* 客戶進度列表 */}
      <div className="space-y-3">
        {filtered.map((c) => {
          const stepIdx = STATUS_STEP_INDEX[c.status] ?? 0;
          const totalSteps = 10;
          const pct = Math.round((stepIdx / totalSteps) * 100);

          return (
            <div key={c.client} className={`rounded-lg border bg-white p-5 ${c.overdue ? 'border-red-300' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <Link href={`/clients/${c.clientId}`} className="text-lg font-bold text-blue-600 hover:underline">
                      {c.client}
                    </Link>
                    {c.overdue && <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">⚠ 逾期</span>}
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                      c.overdue ? 'bg-red-100 text-red-800'
                        : ['已申報', '歸檔', '結案'].includes(c.status) ? 'bg-green-100 text-green-800'
                        : c.status === '送主管覆核' ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>{c.status}</span>
                  </div>
                  <p className="mt-1 text-slate-500">負責人：{c.owner}　{c.note && <span className="text-red-600">備注：{c.note}</span>}</p>
                </div>
                <div className="flex gap-3">
                  {c.caseId && (
                    <Link href={`/cases/${c.caseId}`}>
                      <button className="rounded bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-900">查看案件</button>
                    </Link>
                  )}
                </div>
              </div>

              {/* 進度條 */}
              <div>
                <div className="flex justify-between text-sm text-slate-500 mb-1">
                  <span>進度</span>
                  <span>{pct}% · {c.status}</span>
                </div>
                <div className="h-4 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-4 rounded-full transition-all ${PROGRESS_COLORS[c.status] ?? 'bg-blue-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>建立</span>
                  <span>處理中</span>
                  <span>待申報</span>
                  <span>結案</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
