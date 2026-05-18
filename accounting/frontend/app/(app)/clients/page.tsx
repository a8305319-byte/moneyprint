'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  合作中: 'bg-green-100 text-green-800',
  追蹤中: 'bg-yellow-100 text-yellow-800',
  停止合作: 'bg-slate-100 text-slate-600',
};

const STATUSES = ['全部', '合作中', '追蹤中', '停止合作'];

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [filterOwner, setFilterOwner] = useState('全部');

  useEffect(() => {
    api.get('/clients')
      .then((res) => setClients(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const owners = ['全部', ...Array.from(new Set(clients.map((c) => c.owner).filter(Boolean)))];

  const filtered = clients.filter((c) => {
    const matchSearch = c.name.includes(search) || c.taxId.includes(search) || c.contactName?.includes(search);
    const matchStatus = filterStatus === '全部' || c.status === filterStatus;
    const matchOwner = filterOwner === '全部' || c.owner === filterOwner;
    return matchSearch && matchStatus && matchOwner;
  });

  const active = clients.filter((c) => c.status === '合作中').length;
  const tracking = clients.filter((c) => c.status === '追蹤中').length;
  const inactive = clients.filter((c) => c.status === '停止合作').length;

  return (
    <main className="space-y-5 text-base">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">客戶管理</h1>
        <Link href="/clients/new">
          <button className="rounded bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700">＋ 新增客戶</button>
        </Link>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{loading ? '…' : active}</p>
          <p className="mt-1 text-slate-500">合作中</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{loading ? '…' : tracking}</p>
          <p className="mt-1 text-slate-500">追蹤中</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-slate-400">{loading ? '…' : inactive}</p>
          <p className="mt-1 text-slate-500">停止合作</p>
        </div>
      </div>

      {/* 篩選 */}
      <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4">
        <input
          className="rounded border px-4 py-3 text-base w-56"
          placeholder="搜尋客戶名稱、統編、聯絡人…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="rounded border px-4 py-3 text-base" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="rounded border px-4 py-3 text-base" value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)}>
          {owners.map((o) => <option key={o}>{o}</option>)}
        </select>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
        <button
          className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200"
          onClick={() => { setSearch(''); setFilterStatus('全部'); setFilterOwner('全部'); }}
        >清除篩選</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">無法載入客戶：{error}</div>
      )}

      {/* 客戶表格 */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-4 py-3 text-left font-semibold">編號</th>
              <th className="px-4 py-3 text-left font-semibold">公司名稱</th>
              <th className="px-4 py-3 text-left font-semibold">統一編號</th>
              <th className="px-4 py-3 text-left font-semibold">聯絡人</th>
              <th className="px-4 py-3 text-left font-semibold">電話</th>
              <th className="px-4 py-3 text-left font-semibold">負責會計</th>
              <th className="px-4 py-3 text-left font-semibold">合作起始</th>
              <th className="px-4 py-3 text-left font-semibold">狀態</th>
              <th className="px-4 py-3 text-left font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={9} className="p-8 text-center text-slate-400">載入中…</td></tr>}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={9} className="p-8 text-center text-slate-400">無符合條件的客戶</td></tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-sm text-slate-500">{c.id}</td>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 font-mono">{c.taxId}</td>
                <td className="px-4 py-3">{c.contactName}</td>
                <td className="px-4 py-3 text-sm">{c.phone}</td>
                <td className="px-4 py-3">{c.owner ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{c.since ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[c.status] ?? 'bg-slate-100'}`}>
                    {c.status ?? (c.isActive ? '合作中' : '停止合作')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/clients/${c.id}`}>
                    <button className="rounded bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-900">查看</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t bg-slate-50 px-4 py-3 text-sm text-slate-500">
          顯示 {filtered.length} / {clients.length} 筆客戶
        </div>
      </div>
    </main>
  );
}
