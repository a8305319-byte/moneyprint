'use client';
import Link from 'next/link';
import { useState } from 'react';

const clients = [
  { id: 'C001', name: '宏達貿易股份有限公司', taxId: '12345678', phone: '02-1234-5678', contactName: '陳小姐', address: '台北市信義區', owner: '陳美玲', status: '合作中', since: '2022-03' },
  { id: 'C002', name: '新光物流有限公司', taxId: '87654321', phone: '02-8765-4321', contactName: '王先生', address: '新北市板橋區', owner: '王志明', status: '合作中', since: '2021-07' },
  { id: 'C003', name: '全台科技股份有限公司', taxId: '11223344', phone: '03-111-2222', contactName: '李經理', address: '桃園市中壢區', owner: '林佳慧', status: '合作中', since: '2023-01' },
  { id: 'C004', name: '信義建設股份有限公司', taxId: '55667788', phone: '02-2700-8888', contactName: '張董事長', address: '台北市信義區', owner: '李建宏', status: '追蹤中', since: '2024-05' },
  { id: 'C005', name: '松山食品有限公司', taxId: '99887766', phone: '02-2759-3300', contactName: '劉老板', address: '台北市松山區', owner: '林佳慧', status: '合作中', since: '2020-11' },
  { id: 'C006', name: '大安診所', taxId: '33445566', phone: '02-2731-5000', contactName: '吳院長', address: '台北市大安區', owner: '張淑芬', status: '合作中', since: '2019-06' },
  { id: 'C007', name: '北投溫泉飯店股份有限公司', taxId: '22334455', phone: '02-2891-1234', contactName: '林副總', address: '台北市北投區', owner: '陳美玲', status: '停止合作', since: '2018-01' },
];

const STATUS_COLORS: Record<string, string> = {
  合作中: 'bg-green-100 text-green-800',
  追蹤中: 'bg-yellow-100 text-yellow-800',
  停止合作: 'bg-slate-100 text-slate-600',
};

const STATUSES = ['全部', '合作中', '追蹤中', '停止合作'];
const OWNERS = ['全部', '陳美玲', '王志明', '林佳慧', '李建宏', '張淑芬'];

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [filterOwner, setFilterOwner] = useState('全部');

  const filtered = clients.filter((c) => {
    const matchSearch = c.name.includes(search) || c.taxId.includes(search) || c.contactName.includes(search);
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
          <p className="text-3xl font-bold text-green-600">{active}</p>
          <p className="mt-1 text-slate-500">合作中</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{tracking}</p>
          <p className="mt-1 text-slate-500">追蹤中</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-slate-400">{inactive}</p>
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
          {OWNERS.map((o) => <option key={o}>{o}</option>)}
        </select>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
        <button
          className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200"
          onClick={() => { setSearch(''); setFilterStatus('全部'); setFilterOwner('全部'); }}
        >清除篩選</button>
      </div>

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
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="p-8 text-center text-slate-400">無符合條件的客戶</td></tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-sm text-slate-500">{c.id}</td>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 font-mono">{c.taxId}</td>
                <td className="px-4 py-3">{c.contactName}</td>
                <td className="px-4 py-3 text-sm">{c.phone}</td>
                <td className="px-4 py-3">{c.owner}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{c.since}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[c.status] ?? 'bg-slate-100'}`}>
                    {c.status}
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
