'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

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

const STATUSES = ['全部', '待處理', '進行中', '完成', '逾期'];
const PRIORITIES = ['全部', '高', '中', '低'];

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [filterPriority, setFilterPriority] = useState('全部');
  const [filterAssignee, setFilterAssignee] = useState('全部');

  useEffect(() => {
    api.get('/tasks')
      .then((res) => setTasks(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const assignees = ['全部', ...Array.from(new Set(tasks.map((t) => t.assignee).filter(Boolean)))];

  const today = new Date().toISOString().split('T')[0];

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.includes(search) || t.clientName?.includes(search) || t.id.includes(search);
    const matchStatus = filterStatus === '全部' || t.status === filterStatus;
    const matchPriority = filterPriority === '全部' || t.priority === filterPriority;
    const matchAssignee = filterAssignee === '全部' || t.assignee === filterAssignee;
    return matchSearch && matchStatus && matchPriority && matchAssignee;
  });

  const todo = tasks.filter((t) => t.status === '待處理').length;
  const inProgress = tasks.filter((t) => t.status === '進行中').length;
  const overdue = tasks.filter((t) => t.status === '逾期' || (t.dueDate < today && t.status !== '完成')).length;
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
          <p className="text-3xl font-bold text-yellow-600">{loading ? '…' : todo}</p>
          <p className="mt-1 text-slate-500">待處理</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{loading ? '…' : inProgress}</p>
          <p className="mt-1 text-slate-500">進行中</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{loading ? '…' : overdue}</p>
          <p className="mt-1 text-slate-500">已逾期</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{loading ? '…' : done}</p>
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
          {assignees.map((a) => <option key={a}>{a}</option>)}
        </select>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
        <button
          className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200"
          onClick={() => { setSearch(''); setFilterStatus('全部'); setFilterPriority('全部'); setFilterAssignee('全部'); }}
        >清除篩選</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">無法載入任務：{error}</div>
      )}

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
            {loading && <tr><td colSpan={7} className="p-8 text-center text-slate-400">載入中…</td></tr>}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-slate-400">無符合條件的任務</td></tr>
            )}
            {filtered.map((t) => {
              const isOverdue = t.dueDate < today && t.status !== '完成';
              return (
                <tr key={t.id} className={`border-t hover:bg-slate-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 font-mono text-sm">{t.id}</td>
                  <td className="px-4 py-3 font-medium">{t.title}</td>
                  <td className="px-4 py-3">
                    {t.caseId
                      ? <Link href={`/cases/${t.caseId}`} className="text-blue-600 hover:underline">{t.caseId}</Link>
                      : <span className="text-slate-400">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">{t.assignee}</td>
                  <td className={`px-4 py-3 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                    {t.dueDate}{isOverdue && ' ⚠'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${PRIORITY_COLORS[t.priority] ?? 'bg-slate-100'}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[t.status] ?? 'bg-slate-100'}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="border-t bg-slate-50 px-4 py-3 text-sm text-slate-500">
          顯示 {filtered.length} / {tasks.length} 筆任務
        </div>
      </div>
    </main>
  );
}
