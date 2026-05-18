'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  待申報: 'bg-orange-100 text-orange-800',
  處理中: 'bg-blue-100 text-blue-800',
  已申報: 'bg-green-100 text-green-800',
  逾期待申報: 'bg-red-100 text-red-800',
  退件: 'bg-red-200 text-red-900',
};

const TYPE_COLORS: Record<string, string> = {
  營業稅: 'bg-blue-50 text-blue-700',
  扣繳申報: 'bg-purple-50 text-purple-700',
  薪資扣繳: 'bg-purple-50 text-purple-700',
  綜所稅: 'bg-teal-50 text-teal-700',
  營利事業所得稅: 'bg-teal-50 text-teal-700',
};

const STATUSES = ['全部', '待申報', '處理中', '逾期待申報', '已申報', '退件'];
const TYPES = ['全部', '營業稅', '扣繳申報', '薪資扣繳', '綜所稅', '營利事業所得稅'];

export default function FilingsPage() {
  const [filings, setFilings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [filterType, setFilterType] = useState('全部');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/filings')
      .then((res) => setFilings(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filings.filter((f) => {
    const matchStatus = filterStatus === '全部' || f.status === filterStatus;
    const matchType = filterType === '全部' || f.type === filterType;
    const matchSearch = f.clientName?.includes(search) || f.id.includes(search);
    return matchStatus && matchType && matchSearch;
  });

  const pending = filings.filter((f) => f.status === '待申報' || f.status === '逾期待申報').length;
  const overdue = filings.filter((f) => f.status === '逾期待申報').length;
  const done = filings.filter((f) => f.status === '已申報').length;

  return (
    <main className="space-y-5 text-base">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">稅務申報管理</h1>
        <button className="rounded bg-green-600 px-5 py-3 text-white font-semibold hover:bg-green-700" onClick={() => window.print()}>匯出申報清單</button>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-orange-600">{loading ? '…' : pending}</p>
          <p className="mt-1 text-slate-500">待申報</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{loading ? '…' : overdue}</p>
          <p className="mt-1 text-slate-500">逾期未申報</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{loading ? '…' : done}</p>
          <p className="mt-1 text-slate-500">本月已申報</p>
        </div>
      </div>

      {/* 篩選 */}
      <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4">
        <input
          className="rounded border px-4 py-3 text-base w-48"
          placeholder="搜尋客戶、編號…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="rounded border px-4 py-3 text-base" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="rounded border px-4 py-3 text-base" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => { setSearch(''); setFilterStatus('全部'); setFilterType('全部'); }}>清除篩選</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">無法載入申報資料：{error}</div>
      )}

      {/* 申報表格 */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-4 py-3 text-left font-semibold">申報編號</th>
              <th className="px-4 py-3 text-left font-semibold">客戶</th>
              <th className="px-4 py-3 text-left font-semibold">稅別</th>
              <th className="px-4 py-3 text-left font-semibold">申報期間</th>
              <th className="px-4 py-3 text-left font-semibold">截止日</th>
              <th className="px-4 py-3 text-left font-semibold">申報人</th>
              <th className="px-4 py-3 text-left font-semibold">申報日</th>
              <th className="px-4 py-3 text-left font-semibold">收據號碼</th>
              <th className="px-4 py-3 text-left font-semibold">狀態</th>
              <th className="px-4 py-3 text-left font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={10} className="p-8 text-center text-slate-400">載入中…</td></tr>}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={10} className="p-8 text-center text-slate-400">無符合條件的申報記錄</td></tr>
            )}
            {filtered.map((f) => (
              <tr key={f.id} className={`border-t hover:bg-slate-50 ${f.status === '逾期待申報' ? 'bg-red-50' : ''}`}>
                <td className="px-4 py-3 font-mono text-sm">{f.id}</td>
                <td className="px-4 py-3">
                  <Link href={`/clients/${f.clientId}`} className="font-medium text-blue-600 hover:underline">{f.clientName}</Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-sm font-medium ${TYPE_COLORS[f.type] ?? 'bg-slate-100 text-slate-700'}`}>
                    {f.type}
                  </span>
                </td>
                <td className="px-4 py-3">{f.period}</td>
                <td className={`px-4 py-3 ${f.status === '逾期待申報' ? 'text-red-600 font-semibold' : ''}`}>
                  {f.deadline}{f.status === '逾期待申報' && ' ⚠'}
                </td>
                <td className="px-4 py-3">{f.handler}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{f.filedAt ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-sm text-slate-500">{f.refNum || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[f.status] ?? 'bg-slate-100'}`}>
                    {f.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {f.caseId ? (
                    <Link href={`/cases/${f.caseId}`}>
                      <button className="rounded bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-900">查看案件</button>
                    </Link>
                  ) : (
                    <span className="text-slate-400 text-sm">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t bg-slate-50 px-4 py-3 text-sm text-slate-500">
          顯示 {filtered.length} / {filings.length} 筆
        </div>
      </div>
    </main>
  );
}
