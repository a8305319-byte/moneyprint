'use client';
import Link from 'next/link';
import { useState } from 'react';

const PRIORITY_COLORS: Record<string, string> = {
  高: 'bg-red-100 text-red-800',
  中: 'bg-yellow-100 text-yellow-800',
  低: 'bg-slate-100 text-slate-600',
};

const STATUS_COLORS: Record<string, string> = {
  待處理: 'bg-slate-100 text-slate-700',
  進行中: 'bg-blue-100 text-blue-800',
  完成: 'bg-green-100 text-green-800',
  逾期: 'bg-red-100 text-red-800',
};

const tasks = [
  { id: 'T001', title: '整理宏達貿易5月進項憑證', caseId: 'A001', client: '宏達貿易', assignee: '陳美玲', priority: '高', status: '進行中', dueDate: '2026-05-17', overdue: true },
  { id: 'T002', title: '補件：新光物流進口報單', caseId: 'A002', client: '新光物流', assignee: '王志明', priority: '高', status: '進行中', dueDate: '2026-05-17', overdue: false },
  { id: 'T003', title: '全台科技5月薪資計算', caseId: 'A003', client: '全台科技', assignee: '林佳慧', priority: '中', status: '待處理', dueDate: '2026-05-22', overdue: false },
  { id: 'T004', title: '整理信義建設固定資產折舊', caseId: 'A010', client: '信義建設', assignee: '李建宏', priority: '低', status: '待處理', dueDate: '2026-05-28', overdue: false },
  { id: 'T005', title: '大安診所5月銷項對帳', caseId: 'A008', client: '大安診所', assignee: '張淑芬', priority: '高', status: '逾期', dueDate: '2026-05-15', overdue: true },
  { id: 'T006', title: '宏達貿易年度所得稅試算', caseId: 'A004', client: '宏達貿易', assignee: '陳美玲', priority: '中', status: '完成', dueDate: '2026-05-10', overdue: false },
  { id: 'T007', title: '松山食品員工勞健保加退保', caseId: 'A007', client: '松山食品', assignee: '林佳慧', priority: '中', status: '待處理', dueDate: '2026-05-20', overdue: false },
  { id: 'T008', title: '更新客戶資料（新光物流）', caseId: '', client: '新光物流', assignee: '王志明', priority: '低', status: '完成', dueDate: '2026-05-12', overdue: false },
];

const STATUSES = ['全部', '待處理', '進行中', '完成', '逾期'];
const PRIORITIES = ['全部', '高', '中', '低'];
const ASSIGNEES = ['全部', '陳美玲', '王志明', '林佳慧', '李建宏', '張淑芬'];

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [filterPriority, setFilterPriority] = useState('全部');
  const [filterAssignee, setFilterAssignee] = useState('全部');

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.includes(search) || t.client.includes(search) || t.id.includes(search);
    const matchStatus = filterStatus === '全部' || t.status === filterStatus;
    const matchPriority = filterPriority === '全部' || t.priority === filterPriority;
    const matchAssignee = filterAssignee === '全部' || t.assignee === filterAssignee;
    return matchSearch && matchStatus && matchPriority && matchAssignee;
  });

  const todo = tasks.filter((t) => t.status === '待處理').length;
  const inProgress = tasks.filter((t) => t.status === '進行中').length;
  const overdue = tasks.filter((t) => t.status === '逾期' || t.overdue).length;
  const done = tasks.filter((t) => t.status === '完成').length;

  return (
    <main className="space-y-5 text-base">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">任務列表</h1>
        <Link href="/tasks/new">
          <button className="rounded bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700">＋ 新增任務</button>
        </Link>
      </div>

      {/* 統計摘要 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{todo}</p>
          <p className="mt-1 text-slate-500">待處理</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{inProgress}</p>
          <p className="mt-1 text-slate-500">進行中</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{overdue}</p>
          <p className="mt-1 text-slate-500">已逾期</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{done}</p>
          <p className="mt-1 text-slate-500">已完成</p>
        </div>
      </div>

      {/* 篩選 */}
      <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4">
        <input
          className="rounded border px-4 py-3 text-base w-56"
          placeholder="搜尋任務名稱、客戶…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="rounded border px-4 py-3 text-base" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="rounded border px-4 py-3 text-base" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select className="rounded border px-4 py-3 text-base" value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
          {ASSIGNEES.map((a) => <option key={a}>{a}</option>)}
        </select>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
        <button
          className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200"
          onClick={() => { setSearch(''); setFilterStatus('全部'); setFilterPriority('全部'); setFilterAssignee('全部'); }}
        >清除篩選</button>
      </div>

      {/* 任務表格 */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-4 py-3 text-left font-semibold">任務編號</th>
              <th className="px-4 py-3 text-left font-semibold">任務名稱</th>
              <th className="px-4 py-3 text-left font-semibold">關聯案件</th>
              <th className="px-4 py-3 text-left font-semibold">負責人</th>
              <th className="px-4 py-3 text-left font-semibold">截止日</th>
              <th className="px-4 py-3 text-left font-semibold">優先度</th>
              <th className="px-4 py-3 text-left font-semibold">狀態</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-slate-400">無符合條件的任務</td></tr>
            )}
            {filtered.map((t) => (
              <tr key={t.id} className={`border-t hover:bg-slate-50 ${t.overdue && t.status !== '完成' ? 'bg-red-50' : ''}`}>
                <td className="px-4 py-3 font-mono text-sm">{t.id}</td>
                <td className="px-4 py-3 font-medium">{t.title}</td>
                <td className="px-4 py-3">
                  {t.caseId
                    ? <Link href={`/cases/${t.caseId}`} className="text-blue-600 hover:underline">{t.caseId}</Link>
                    : <span className="text-slate-400">—</span>
                  }
                </td>
                <td className="px-4 py-3">{t.assignee}</td>
                <td className={`px-4 py-3 ${t.overdue && t.status !== '完成' ? 'text-red-600 font-semibold' : ''}`}>
                  {t.dueDate}{t.overdue && t.status !== '完成' && ' ⚠'}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${PRIORITY_COLORS[t.priority]}`}>
                    {t.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[t.status] ?? 'bg-slate-100'}`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t bg-slate-50 px-4 py-3 text-sm text-slate-500">
          顯示 {filtered.length} / {tasks.length} 筆任務
        </div>
      </div>
    </main>
  );
}
