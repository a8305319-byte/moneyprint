'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const ACTION_COLORS: Record<string, string> = {
  登入: 'bg-slate-100 text-slate-600',
  新增: 'bg-green-100 text-green-700',
  修改: 'bg-blue-100 text-blue-700',
  刪除: 'bg-red-100 text-red-700',
  上傳: 'bg-purple-100 text-purple-700',
  下載: 'bg-teal-100 text-teal-700',
  登出: 'bg-slate-100 text-slate-500',
  送審: 'bg-yellow-100 text-yellow-700',
};

const ACTIONS = ['全部', '登入', '新增', '修改', '刪除', '上傳', '下載', '送審', '登出'];

export default function OperationLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterUser, setFilterUser] = useState('全部');
  const [filterAction, setFilterAction] = useState('全部');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/operation-logs')
      .then((res) => setLogs(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const users = ['全部', ...Array.from(new Set(logs.map((l) => l.user).filter(Boolean)))];

  const filtered = logs.filter((l) => {
    const matchUser = filterUser === '全部' || l.user === filterUser;
    const matchAction = filterAction === '全部' || l.action === filterAction;
    const matchSearch = l.user?.includes(search) || l.target?.includes(search);
    return matchUser && matchAction && matchSearch;
  });

  return (
    <main className="space-y-5 text-base">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">操作紀錄</h1>
          <p className="mt-1 text-sm text-slate-500">操作紀錄不可修改或刪除，僅限唯讀查閱</p>
        </div>
        <button className="rounded bg-green-600 px-5 py-3 text-white font-semibold hover:bg-green-700" onClick={() => window.print()}>匯出 Excel</button>
      </div>

      {/* 篩選 */}
      <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4">
        <input
          className="rounded border px-4 py-3 text-base w-52"
          placeholder="搜尋操作人、對象…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="rounded border px-4 py-3 text-base" value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
          {users.map((u) => <option key={u}>{u}</option>)}
        </select>
        <select className="rounded border px-4 py-3 text-base" value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
          {ACTIONS.map((a) => <option key={a}>{a}</option>)}
        </select>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => { setSearch(''); setFilterUser('全部'); setFilterAction('全部'); }}>清除篩選</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">無法載入操作紀錄：{error}</div>
      )}

      {/* 紀錄表格 */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-4 py-3 text-left font-semibold">操作人</th>
              <th className="px-4 py-3 text-left font-semibold">職稱</th>
              <th className="px-4 py-3 text-left font-semibold">動作</th>
              <th className="px-4 py-3 text-left font-semibold">操作對象</th>
              <th className="px-4 py-3 text-left font-semibold">操作時間</th>
              <th className="px-4 py-3 text-left font-semibold">IP 位址</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-8 text-center text-slate-400">載入中…</td></tr>}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400">無符合條件的操作紀錄</td></tr>
            )}
            {filtered.map((l) => (
              <tr key={l.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{l.user}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{l.role}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${ACTION_COLORS[l.action] ?? 'bg-slate-100'}`}>
                    {l.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{l.target}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{l.time}</td>
                <td className="px-4 py-3 font-mono text-sm text-slate-400">{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t bg-slate-50 px-4 py-3 text-sm text-slate-500">
          顯示 {filtered.length} / {logs.length} 筆紀錄
        </div>
      </div>
    </main>
  );
}
