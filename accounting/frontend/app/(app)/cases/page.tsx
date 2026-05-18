'use client';
import Link from 'next/link';
import { useState } from 'react';

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

const cases = [
  { id: 'A001', client: '宏達貿易', type: '營業稅申報', owner: '陳美玲', month: '2026-05', status: '送主管覆核', dueDate: '2026-05-20', overdue: false },
  { id: 'A002', client: '新光物流', type: '扣繳申報', owner: '王志明', month: '2026-05', status: '退回修改', dueDate: '2026-05-18', overdue: true },
  { id: 'A003', client: '全台科技', type: '營業稅申報', owner: '林佳慧', month: '2026-05', status: '處理中', dueDate: '2026-05-25', overdue: false },
  { id: 'A004', client: '宏達貿易', type: '綜所稅申報', owner: '陳美玲', month: '2026-04', status: '已申報', dueDate: '2026-04-30', overdue: false },
  { id: 'A005', client: '信義建設', type: '營利事業所得稅', owner: '李建宏', month: '2026-03', status: '歸檔', dueDate: '2026-03-31', overdue: false },
  { id: 'A006', client: '新光物流', type: '營業稅申報', owner: '王志明', month: '2026-04', status: '結案', dueDate: '2026-04-25', overdue: false },
  { id: 'A007', client: '松山食品', type: '薪資扣繳', owner: '林佳慧', month: '2026-05', status: '等待資料', dueDate: '2026-05-22', overdue: false },
  { id: 'A008', client: '大安診所', type: '營業稅申報', owner: '張淑芬', month: '2026-05', status: '收到資料', dueDate: '2026-05-19', overdue: true },
  { id: 'A009', client: '全台科技', type: '扣繳申報', owner: '陳美玲', month: '2026-05', status: '待申報', dueDate: '2026-05-31', overdue: false },
  { id: 'A010', client: '信義建設', type: '營業稅申報', owner: '李建宏', month: '2026-05', status: '指派', dueDate: '2026-05-28', overdue: false },
];

const STATUSES = ['全部', '建立', '指派', '等待資料', '收到資料', '處理中', '送主管覆核', '退回修改', '待申報', '已申報', '歸檔', '結案'];
const CLIENTS = ['全部', '宏達貿易', '新光物流', '全台科技', '信義建設', '松山食品', '大安診所'];
const OWNERS = ['全部', '陳美玲', '王志明', '林佳慧', '李建宏', '張淑芬'];

export default function CasesPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [filterClient, setFilterClient] = useState('全部');
  const [filterOwner, setFilterOwner] = useState('全部');

  const filtered = cases.filter((c) => {
    const matchSearch = c.id.includes(search) || c.client.includes(search) || c.type.includes(search);
    const matchStatus = filterStatus === '全部' || c.status === filterStatus;
    const matchClient = filterClient === '全部' || c.client === filterClient;
    const matchOwner = filterOwner === '全部' || c.owner === filterOwner;
    return matchSearch && matchStatus && matchClient && matchOwner;
  });

  const overdue = cases.filter((c) => c.overdue).length;
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

      {/* 統計摘要 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-slate-800">{cases.length}</p>
          <p className="mt-1 text-slate-500">全部案件</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{overdue}</p>
          <p className="mt-1 text-slate-500">已逾期</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{pending}</p>
          <p className="mt-1 text-slate-500">待主管覆核</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-orange-600">{filing}</p>
          <p className="mt-1 text-slate-500">待申報</p>
        </div>
      </div>

      {/* 篩選列 */}
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
        <select className="rounded border px-4 py-3 text-base" value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
          {CLIENTS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="rounded border px-4 py-3 text-base" value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)}>
          {OWNERS.map((o) => <option key={o}>{o}</option>)}
        </select>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
        <button
          className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200"
          onClick={() => { setSearch(''); setFilterStatus('全部'); setFilterClient('全部'); setFilterOwner('全部'); }}
        >清除篩選</button>
      </div>

      {/* 案件表格 */}
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
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-slate-400">無符合條件的案件</td></tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3 font-mono font-semibold">{c.id}</td>
                <td className="px-4 py-3">{c.client}</td>
                <td className="px-4 py-3">{c.type}</td>
                <td className="px-4 py-3">{c.owner}</td>
                <td className="px-4 py-3">{c.month}</td>
                <td className={`px-4 py-3 ${c.overdue ? 'text-red-600 font-semibold' : ''}`}>
                  {c.dueDate}{c.overdue && ' ⚠ 逾期'}
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
            ))}
          </tbody>
        </table>
        <div className="border-t bg-slate-50 px-4 py-3 text-sm text-slate-500">
          顯示 {filtered.length} / {cases.length} 筆案件
        </div>
      </div>
    </main>
  );
}
