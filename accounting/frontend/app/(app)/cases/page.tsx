'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  建立: 'bg-slate-100 text-slate-700',
  指派: 'bg-slate-200 text-slate-800',
  等待資料: 'bg-yellow-100 text-yellow-800',
  收到資料: 'bg-blue-100 text-blue-800',
  處理中: 'bg-blue-200 text-blue-900',
  送主管覆核: 'bg-purple-100 text-purple-800',
  退回修改: 'bg-red-100 text-red-800',
  待申報: 'bg-orange-100 text-orange-800',
  已申報: 'bg-teal-100 text-teal-800',
  歸檔: 'bg-green-100 text-green-800',
  結案: 'bg-gray-200 text-gray-700',
};

const STATUSES = ['全部', '建立', '指派', '等待資料', '收到資料', '處理中', '送主管覆核', '退回修改', '待申報', '已申報', '歸檔', '結案'];
const OWNERS = ['全部', '陳美玲', '王志明', '林佳慧', '李建宏', '張淑芬'];

const today = '2026-05-18';

export default function CasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [filterOwner, setFilterOwner] = useState('全部');

  useEffect(() => {
    api.get('/cases')
      .then((res) => setCases(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = cases.filter((c) => {
    const matchSearch = c.id.includes(search) || c.clientName.includes(search) || c.type.includes(search);
    const matchStatus = filterStatus === '全部' || c.status === filterStatus;
    const matchOwner = filterOwner === '全部' || c.owner === filterOwner;
    return matchSearch && matchStatus && matchOwner;
  });

  const overdue = cases.filter((c) => !c.deletedAt && !['已申報', '歸檔', '結案'].includes(c.status) && c.dueDate < today).length;
  const pending = cases.filter((c) => c.status === '送主管覆核').length;
  const filing = cases.filter((c) => c.status === '待申報').length;

  return (
    <main className="space-y-5 text-base">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">案件列表</h1>
        <Link href="/cases/new">
          <button className="rounded bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700">＋ 新增案件</button>
        </Link>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '全部案件', value: cases.length, color: 'text-slate-800' },
          { label: '已逾期', value: overdue, color: 'text-red-600' },
          { label: '待主管覆核', value: pending, color: 'text-purple-600' },
          { label: '待申報', value: filing, color: 'text-orange-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-white p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{loading ? '…' : s.value}</p>
            <p className="mt-1 text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 篩選 */}
      <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4">
        <input
          className="rounded border px-4 py-3 text-base w-52"
          placeholder="搜尋編號、客戶、類型…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="rounded border px-4 py-3 text-base" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="rounded border px-4 py-3 text-base" value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)}>
          {OWNERS.map((o) => <option key={o}>{o}</option>)}
        </select>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200"
          onClick={() => { setSearch(''); setFilterStatus('全部'); setFilterOwner('全部'); }}>清除篩選</button>
      </div>

      {/* 錯誤 */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          無法載入案件：{error}
        </div>
      )}

      {/* 表格 */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-4 py-3 text-left font-semibold">案件編號</th>
              <th className="px-4 py-3 text-left font-semibold">客戶</th>
              <th className="px-4 py-3 text-left font-semibold">申報類型</th>
              <th className="px-4 py-3 text-left font-semibold">負責人</th>
              <th className="px-4 py-3 text-left font-semibold">月份</th>
              <th className="px-4 py-3 text-left font-semibold">截止日</th>
              <th className="px-4 py-3 text-left font-semibold">狀態</th>
              <th className="px-4 py-3 text-left font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="p-8 text-center text-slate-400">載入中…</td></tr>}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-slate-400">無符合條件的案件</td></tr>
            )}
            {filtered.map((c) => {
              const isOverdue = !['已申報', '歸檔', '結案'].includes(c.status) && c.dueDate < today;
              return (
                <tr key={c.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-semibold">{c.id}</td>
                  <td className="px-4 py-3">{c.clientName}</td>
                  <td className="px-4 py-3">{c.type}</td>
                  <td className="px-4 py-3">{c.owner}</td>
                  <td className="px-4 py-3">{c.month}</td>
                  <td className={`px-4 py-3 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                    {c.dueDate}{isOverdue && ' ⚠'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[c.status] ?? 'bg-slate-100'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/cases/${c.id}`}>
                      <button className="rounded bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-900">查看</button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="border-t bg-slate-50 px-4 py-3 text-sm text-slate-500">
          顯示 {filtered.length} / {cases.length} 筆案件
        </div>
      </div>
    </main>
  );
}
