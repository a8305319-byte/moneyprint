'use client';
import Link from 'next/link';
import { useState } from 'react';

const payments = [
  { id: 'P001', client: '宏達貿易', clientId: 'C001', month: '2026-05', amount: 8000, status: '已收款', dueDate: '2026-05-10', paidAt: '2026-05-05', method: '匯款', note: '' },
  { id: 'P002', client: '新光物流', clientId: 'C002', month: '2026-05', amount: 5000, status: '未收款', dueDate: '2026-05-10', paidAt: null, method: '', note: '已電話催款一次' },
  { id: 'P003', client: '全台科技', clientId: 'C003', month: '2026-05', amount: 7500, status: '已收款', dueDate: '2026-05-10', paidAt: '2026-05-08', method: '匯款', note: '' },
  { id: 'P004', client: '信義建設', clientId: 'C004', month: '2026-05', amount: 12000, status: '未收款', dueDate: '2026-05-10', paidAt: null, method: '', note: '' },
  { id: 'P005', client: '松山食品', clientId: 'C005', month: '2026-05', amount: 6000, status: '已收款', dueDate: '2026-05-10', paidAt: '2026-05-03', method: '現金', note: '' },
  { id: 'P006', client: '大安診所', clientId: 'C006', month: '2026-05', amount: 9000, status: '已收款', dueDate: '2026-05-10', paidAt: '2026-05-07', method: '匯款', note: '' },
  { id: 'P007', client: '宏達貿易', clientId: 'C001', month: '2026-04', amount: 8000, status: '已收款', dueDate: '2026-04-10', paidAt: '2026-04-07', method: '匯款', note: '' },
  { id: 'P008', client: '新光物流', clientId: 'C002', month: '2026-04', amount: 5000, status: '已收款', dueDate: '2026-04-10', paidAt: '2026-04-12', method: '匯款', note: '遲繳2天' },
  { id: 'P009', client: '宏達貿易', clientId: 'C001', month: '2026-02', amount: 8000, status: '逾期未收', dueDate: '2026-02-10', paidAt: null, method: '', note: '已多次催款' },
];

const MONTHS = ['全部', '2026-05', '2026-04', '2026-03', '2026-02'];
const STATUSES = ['全部', '已收款', '未收款', '逾期未收'];
const STATUS_COLORS: Record<string, string> = {
  已收款: 'bg-green-100 text-green-800',
  未收款: 'bg-yellow-100 text-yellow-800',
  逾期未收: 'bg-red-100 text-red-800',
};

export default function PaymentsPage() {
  const [filterMonth, setFilterMonth] = useState('2026-05');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [search, setSearch] = useState('');

  const filtered = payments.filter((p) => {
    const matchMonth = filterMonth === '全部' || p.month === filterMonth;
    const matchStatus = filterStatus === '全部' || p.status === filterStatus;
    const matchSearch = p.client.includes(search) || p.id.includes(search);
    return matchMonth && matchStatus && matchSearch;
  });

  const totalReceived = filtered.filter((p) => p.status === '已收款').reduce((sum, p) => sum + p.amount, 0);
  const totalUnpaid = filtered.filter((p) => p.status !== '已收款').reduce((sum, p) => sum + p.amount, 0);
  const receivedCount = filtered.filter((p) => p.status === '已收款').length;
  const unpaidCount = filtered.filter((p) => p.status !== '已收款').length;

  return (
    <main className="space-y-5 text-base">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">收款管理</h1>
        <div className="flex gap-3">
          <button className="rounded bg-green-600 px-5 py-3 text-white font-semibold hover:bg-green-700">匯出報表</button>
        </div>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-green-600">NT$ {totalReceived.toLocaleString()}</p>
          <p className="mt-1 text-slate-500">已收款（{receivedCount} 筆）</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-red-600">NT$ {totalUnpaid.toLocaleString()}</p>
          <p className="mt-1 text-slate-500">待收款（{unpaidCount} 筆）</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">NT$ {(totalReceived + totalUnpaid).toLocaleString()}</p>
          <p className="mt-1 text-slate-500">應收合計</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-slate-700">
            {totalReceived + totalUnpaid > 0
              ? `${Math.round((totalReceived / (totalReceived + totalUnpaid)) * 100)}%`
              : '0%'}
          </p>
          <p className="mt-1 text-slate-500">收款率</p>
        </div>
      </div>

      {/* 篩選 */}
      <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4">
        <input
          className="rounded border px-4 py-3 text-base w-48"
          placeholder="搜尋客戶…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="rounded border px-4 py-3 text-base" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
          {MONTHS.map((m) => <option key={m}>{m}</option>)}
        </select>
        <select className="rounded border px-4 py-3 text-base" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => { setSearch(''); setFilterMonth('2026-05'); setFilterStatus('全部'); }}>清除篩選</button>
      </div>

      {/* 收款表格 */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-4 py-3 text-left font-semibold">編號</th>
              <th className="px-4 py-3 text-left font-semibold">客戶</th>
              <th className="px-4 py-3 text-left font-semibold">月份</th>
              <th className="px-4 py-3 text-right font-semibold">金額</th>
              <th className="px-4 py-3 text-left font-semibold">應收日</th>
              <th className="px-4 py-3 text-left font-semibold">實收日</th>
              <th className="px-4 py-3 text-left font-semibold">收款方式</th>
              <th className="px-4 py-3 text-left font-semibold">備注</th>
              <th className="px-4 py-3 text-left font-semibold">狀態</th>
              <th className="px-4 py-3 text-left font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="p-8 text-center text-slate-400">無符合條件的收款記錄</td></tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className={`border-t hover:bg-slate-50 ${p.status === '逾期未收' ? 'bg-red-50' : p.status === '未收款' ? 'bg-yellow-50' : ''}`}>
                <td className="px-4 py-3 font-mono text-sm text-slate-500">{p.id}</td>
                <td className="px-4 py-3">
                  <Link href={`/clients/${p.clientId}`} className="font-medium text-blue-600 hover:underline">{p.client}</Link>
                </td>
                <td className="px-4 py-3">{p.month}</td>
                <td className="px-4 py-3 text-right font-semibold">NT$ {p.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">{p.dueDate}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{p.paidAt ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{p.method || '—'}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{p.note || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[p.status] ?? 'bg-slate-100'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {p.status !== '已收款' ? (
                    <button className="rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700">標記已收</button>
                  ) : (
                    <button className="rounded bg-slate-200 px-3 py-2 text-sm hover:bg-slate-300">查看</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t bg-slate-50 px-4 py-3 text-sm text-slate-500">
          顯示 {filtered.length} / {payments.length} 筆
        </div>
      </div>
    </main>
  );
}
