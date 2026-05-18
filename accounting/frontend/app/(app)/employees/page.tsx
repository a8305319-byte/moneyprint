'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const ROLE_LABELS: Record<string, string> = {
  BOSS: '老闆',
  MANAGER: '主任/主管',
  SENIOR_ACCT: '資深會計',
  ACCT: '一般會計',
  ASSISTANT: '助理',
  INTERN: '實習生',
  READONLY: '唯讀',
  ADMIN: '系統管理員',
};

const ROLE_COLORS: Record<string, string> = {
  BOSS: 'bg-purple-100 text-purple-800',
  MANAGER: 'bg-blue-100 text-blue-800',
  SENIOR_ACCT: 'bg-teal-100 text-teal-800',
  ACCT: 'bg-green-100 text-green-800',
  ASSISTANT: 'bg-yellow-100 text-yellow-800',
  INTERN: 'bg-orange-100 text-orange-800',
  READONLY: 'bg-slate-100 text-slate-600',
  ADMIN: 'bg-red-100 text-red-800',
};

const STATUSES = ['全部', '在職', '離職'];
const ROLES = ['全部', ...Object.keys(ROLE_LABELS)];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('在職');
  const [filterRole, setFilterRole] = useState('全部');

  useEffect(() => {
    api.get('/employees')
      .then((res) => setEmployees(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = employees.filter((e) => {
    const empStatus = e.status ?? (e.isActive ? '在職' : '離職');
    const matchSearch = e.name.includes(search) || e.email?.includes(search);
    const matchStatus = filterStatus === '全部' || empStatus === filterStatus;
    const matchRole = filterRole === '全部' || e.role === filterRole;
    return matchSearch && matchStatus && matchRole;
  });

  const active = employees.filter((e) => (e.status ?? (e.isActive ? '在職' : '離職')) === '在職').length;
  const inactive = employees.filter((e) => (e.status ?? (e.isActive ? '在職' : '離職')) === '離職').length;

  return (
    <main className="space-y-5 text-base">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">員工管理</h1>
        <button className="rounded bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700">＋ 新增員工</button>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{loading ? '…' : active}</p>
          <p className="mt-1 text-slate-500">在職人員</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-slate-400">{loading ? '…' : inactive}</p>
          <p className="mt-1 text-slate-500">離職人員</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-slate-800">{loading ? '…' : employees.length}</p>
          <p className="mt-1 text-slate-500">全部人員</p>
        </div>
      </div>

      {/* 篩選 */}
      <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4">
        <input
          className="rounded border px-4 py-3 text-base w-48"
          placeholder="搜尋姓名、Email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="rounded border px-4 py-3 text-base" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="rounded border px-4 py-3 text-base" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          {ROLES.map((r) => <option key={r} value={r}>{r === '全部' ? '全部角色' : ROLE_LABELS[r]}</option>)}
        </select>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
        <button
          className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200"
          onClick={() => { setSearch(''); setFilterStatus('在職'); setFilterRole('全部'); }}
        >清除篩選</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">無法載入員工資料：{error}</div>
      )}

      {/* 員工表格 */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-4 py-3 text-left font-semibold">編號</th>
              <th className="px-4 py-3 text-left font-semibold">姓名</th>
              <th className="px-4 py-3 text-left font-semibold">角色</th>
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-left font-semibold">電話</th>
              <th className="px-4 py-3 text-left font-semibold">入職日期</th>
              <th className="px-4 py-3 text-left font-semibold">負責客戶數</th>
              <th className="px-4 py-3 text-left font-semibold">狀態</th>
              <th className="px-4 py-3 text-left font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={9} className="p-8 text-center text-slate-400">載入中…</td></tr>}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={9} className="p-8 text-center text-slate-400">無符合條件的員工</td></tr>
            )}
            {filtered.map((e) => {
              const empStatus = e.status ?? (e.isActive ? '在職' : '離職');
              return (
                <tr key={e.id} className={`border-t hover:bg-slate-50 ${empStatus === '離職' ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3 font-mono text-sm text-slate-500">{e.id}</td>
                  <td className="px-4 py-3 font-semibold">{e.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${ROLE_COLORS[e.role] ?? 'bg-slate-100'}`}>
                      {ROLE_LABELS[e.role] ?? e.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{e.email}</td>
                  <td className="px-4 py-3 text-sm">{e.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{e.joinDate ?? '—'}</td>
                  <td className="px-4 py-3 text-center">{e.clients > 0 ? e.clients : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${empStatus === '在職' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                      {empStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/employees/${e.id}`}>
                      <button className="rounded bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-900">查看</button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="border-t bg-slate-50 px-4 py-3 text-sm text-slate-500">
          顯示 {filtered.length} / {employees.length} 筆
        </div>
      </div>
    </main>
  );
}
