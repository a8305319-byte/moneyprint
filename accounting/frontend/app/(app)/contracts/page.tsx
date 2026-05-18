'use client';
import Link from 'next/link';
import { useState } from 'react';

const contracts = [
  { id: 'CT001', client: '宏達貿易', clientId: 'C001', type: '年度記帳合約', startDate: '2026-01-01', endDate: '2026-12-31', monthlyFee: 8000, status: '有效', signedAt: '2025-12-15' },
  { id: 'CT002', client: '新光物流', clientId: 'C002', type: '申報代理合約', startDate: '2026-01-01', endDate: '2026-06-30', monthlyFee: 5000, status: '即將到期', signedAt: '2025-12-20' },
  { id: 'CT003', client: '全台科技', clientId: 'C003', type: '年度記帳合約', startDate: '2026-01-01', endDate: '2026-12-31', monthlyFee: 7500, status: '有效', signedAt: '2025-12-10' },
  { id: 'CT004', client: '信義建設', clientId: 'C004', type: '年度顧問合約', startDate: '2026-05-01', endDate: '2027-04-30', monthlyFee: 12000, status: '有效', signedAt: '2026-04-28' },
  { id: 'CT005', client: '松山食品', clientId: 'C005', type: '年度記帳合約', startDate: '2026-01-01', endDate: '2026-12-31', monthlyFee: 6000, status: '有效', signedAt: '2025-12-18' },
  { id: 'CT006', client: '大安診所', clientId: 'C006', type: '年度記帳合約', startDate: '2026-01-01', endDate: '2026-12-31', monthlyFee: 9000, status: '有效', signedAt: '2025-12-05' },
  { id: 'CT007', client: '宏達貿易', clientId: 'C001', type: '年度記帳合約', startDate: '2025-01-01', endDate: '2025-12-31', monthlyFee: 7500, status: '已到期', signedAt: '2024-12-20' },
  { id: 'CT008', client: '北投溫泉飯店', clientId: 'C007', type: '申報代理合約', startDate: '2023-01-01', endDate: '2024-12-31', monthlyFee: 10000, status: '已終止', signedAt: '2022-12-15' },
];

const STATUS_COLORS: Record<string, string> = {
  有效: 'bg-green-100 text-green-800',
  即將到期: 'bg-orange-100 text-orange-800',
  已到期: 'bg-slate-100 text-slate-600',
  已終止: 'bg-red-100 text-red-700',
};

const STATUSES = ['全部', '有效', '即將到期', '已到期', '已終止'];

export default function ContractsPage() {
  const [filterStatus, setFilterStatus] = useState('全部');
  const [search, setSearch] = useState('');

  const filtered = contracts.filter((c) => {
    const matchStatus = filterStatus === '全部' || c.status === filterStatus;
    const matchSearch = c.client.includes(search) || c.id.includes(search) || c.type.includes(search);
    return matchStatus && matchSearch;
  });

  const active = contracts.filter((c) => c.status === '有效').length;
  const expiring = contracts.filter((c) => c.status === '即將到期').length;
  const expired = contracts.filter((c) => c.status === '已到期' || c.status === '已終止').length;
  const totalMonthly = contracts.filter((c) => c.status === '有效' || c.status === '即將到期')
    .reduce((sum, c) => sum + c.monthlyFee, 0);

  return (
    <main className="space-y-5 text-base">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">合約管理</h1>
        <button className="rounded bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700">＋ 新增合約</button>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{active}</p>
          <p className="mt-1 text-slate-500">有效合約</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-orange-600">{expiring}</p>
          <p className="mt-1 text-slate-500">即將到期</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-slate-400">{expired}</p>
          <p className="mt-1 text-slate-500">已到期/終止</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">NT$ {totalMonthly.toLocaleString()}</p>
          <p className="mt-1 text-slate-500">月收費合計</p>
        </div>
      </div>

      {/* 篩選 */}
      <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4">
        <input
          className="rounded border px-4 py-3 text-base w-52"
          placeholder="搜尋客戶、合約編號…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="rounded border px-4 py-3 text-base" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => { setSearch(''); setFilterStatus('全部'); }}>清除篩選</button>
      </div>

      {/* 合約表格 */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-4 py-3 text-left font-semibold">合約編號</th>
              <th className="px-4 py-3 text-left font-semibold">客戶</th>
              <th className="px-4 py-3 text-left font-semibold">合約類型</th>
              <th className="px-4 py-3 text-right font-semibold">月費</th>
              <th className="px-4 py-3 text-left font-semibold">有效期間</th>
              <th className="px-4 py-3 text-left font-semibold">簽約日</th>
              <th className="px-4 py-3 text-left font-semibold">狀態</th>
              <th className="px-4 py-3 text-left font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-slate-400">無符合條件的合約</td></tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} className={`border-t hover:bg-slate-50 ${c.status === '即將到期' ? 'bg-orange-50' : ''}`}>
                <td className="px-4 py-3 font-mono text-sm">{c.id}</td>
                <td className="px-4 py-3">
                  <Link href={`/clients/${c.clientId}`} className="text-blue-600 hover:underline font-medium">{c.client}</Link>
                </td>
                <td className="px-4 py-3">{c.type}</td>
                <td className="px-4 py-3 text-right font-semibold">NT$ {c.monthlyFee.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">{c.startDate} ～ {c.endDate}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{c.signedAt}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[c.status] ?? 'bg-slate-100'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="rounded bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-900">查看</button>
                    {c.status === '即將到期' && (
                      <button className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">續約</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t bg-slate-50 px-4 py-3 text-sm text-slate-500">
          顯示 {filtered.length} / {contracts.length} 筆
        </div>
      </div>
    </main>
  );
}
