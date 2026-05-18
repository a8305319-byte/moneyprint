'use client';
import Link from 'next/link';
import { useState } from 'react';

const employee = {
  id: 'E003',
  name: '陳美玲',
  role: 'SENIOR_ACCT',
  roleLabel: '資深會計',
  email: 'chen@firm.com',
  phone: '0912-000-003',
  joinDate: '2018-06-01',
  status: '在職',
  note: '主要負責宏達貿易相關申報事務，熟悉進出口扣抵作業。',
  lastModifiedBy: '林國棟',
  lastModifiedAt: '2026-05-10 09:00',
};

const clientAssignments = [
  { id: 'C001', name: '宏達貿易股份有限公司', status: '合作中', since: '2022-03' },
  { id: 'C004', name: '信義建設股份有限公司', status: '追蹤中', since: '2024-05' },
  { id: 'C007', name: '北投溫泉飯店股份有限公司', status: '停止合作', since: '2018-01' },
];

const recentCases = [
  { id: 'A001', client: '宏達貿易', type: '營業稅申報', month: '2026-05', status: '退回修改' },
  { id: 'A004', client: '宏達貿易', type: '綜所稅申報', month: '2026-04', status: '已申報' },
  { id: 'A009', client: '全台科技', type: '扣繳申報', month: '2026-05', status: '待申報' },
];

const salaryHistory = [
  { month: '2026-05', baseSalary: 52000, bonus: 3000, deductions: 5800, net: 49200, paidAt: '2026-05-05' },
  { month: '2026-04', baseSalary: 52000, bonus: 0, deductions: 5800, net: 46200, paidAt: '2026-04-05' },
  { month: '2026-03', baseSalary: 52000, bonus: 5000, deductions: 5800, net: 51200, paidAt: '2026-03-05' },
];

const STATUS_COLORS: Record<string, string> = {
  退回修改: 'bg-red-100 text-red-800',
  已申報: 'bg-teal-100 text-teal-800',
  待申報: 'bg-orange-100 text-orange-800',
  合作中: 'bg-green-100 text-green-800',
  追蹤中: 'bg-yellow-100 text-yellow-800',
  停止合作: 'bg-slate-100 text-slate-600',
};

export default function EmployeeDetailPage() {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);

  return (
    <main className="space-y-5 text-base">
      {/* 導覽 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <Link href="/employees">
            <button className="rounded bg-slate-200 px-4 py-3 hover:bg-slate-300">← 返回員工列表</button>
          </Link>
          <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
        </div>
        <button className="rounded bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700">編輯資料</button>
      </div>

      {/* 基本資料 */}
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{employee.name}</h1>
            <p className="mt-1 text-slate-500">{employee.id} · {employee.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-teal-100 px-4 py-1 text-base font-medium text-teal-800">
              {employee.roleLabel}
            </span>
            <span className={`rounded-full px-4 py-1 text-base font-medium
              ${employee.status === '在職' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
              {employee.status}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <div>
            <p className="text-sm text-slate-500">電話</p>
            <p className="font-semibold">{employee.phone}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">入職日期</p>
            <p className="font-semibold">{employee.joinDate}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-slate-500">備注</p>
            <p>{employee.note}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          最後修改：{employee.lastModifiedBy} · {employee.lastModifiedAt}
        </p>
      </div>

      {/* 負責客戶 */}
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">負責客戶</h2>
          <span className="text-sm text-slate-500">共 {clientAssignments.filter(c => c.status !== '停止合作').length} 個有效客戶</span>
        </div>
        <div className="space-y-2">
          {clientAssignments.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded border p-3 hover:bg-slate-50">
              <div>
                <Link href={`/clients/${c.id}`} className="font-medium text-blue-600 hover:underline">{c.name}</Link>
                <p className="text-sm text-slate-500">合作起始：{c.since}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[c.status]}`}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 最近案件 */}
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">最近案件</h2>
          <Link href={`/cases`}>
            <button className="rounded bg-slate-200 px-3 py-2 text-sm hover:bg-slate-300">查看所有案件</button>
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-3 py-2 text-left text-sm font-semibold">案件</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">客戶</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">類型</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">月份</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">狀態</th>
            </tr>
          </thead>
          <tbody>
            {recentCases.map((c) => (
              <tr key={c.id} className="border-t hover:bg-slate-50">
                <td className="px-3 py-2">
                  <Link href={`/cases/${c.id}`} className="font-mono font-semibold text-blue-600 hover:underline">{c.id}</Link>
                </td>
                <td className="px-3 py-2">{c.client}</td>
                <td className="px-3 py-2">{c.type}</td>
                <td className="px-3 py-2">{c.month}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[c.status] ?? 'bg-slate-100'}`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 薪資記錄 */}
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">薪資記錄</h2>
          <Link href="/salary">
            <button className="rounded bg-slate-200 px-3 py-2 text-sm hover:bg-slate-300">薪資管理</button>
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-3 py-2 text-left text-sm font-semibold">月份</th>
              <th className="px-3 py-2 text-right text-sm font-semibold">底薪</th>
              <th className="px-3 py-2 text-right text-sm font-semibold">獎金</th>
              <th className="px-3 py-2 text-right text-sm font-semibold">扣除</th>
              <th className="px-3 py-2 text-right text-sm font-semibold">實領金額</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">發薪日</th>
            </tr>
          </thead>
          <tbody>
            {salaryHistory.map((s) => (
              <tr key={s.month} className="border-t hover:bg-slate-50">
                <td className="px-3 py-2">{s.month}</td>
                <td className="px-3 py-2 text-right">NT$ {s.baseSalary.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-green-700">
                  {s.bonus > 0 ? `+NT$ ${s.bonus.toLocaleString()}` : '—'}
                </td>
                <td className="px-3 py-2 text-right text-red-600">-NT$ {s.deductions.toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-bold">NT$ {s.net.toLocaleString()}</td>
                <td className="px-3 py-2 text-sm text-slate-500">{s.paidAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 帳號設定 */}
      <div className="rounded-lg border bg-white p-5">
        <h2 className="mb-4 text-xl font-semibold">帳號設定</h2>
        {!showResetConfirm ? (
          <button
            className="rounded bg-amber-500 px-5 py-3 text-white font-semibold hover:bg-amber-600"
            onClick={() => setShowResetConfirm(true)}
          >
            重設密碼
          </button>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="mb-3 font-semibold text-amber-800">確認要重設 {employee.name} 的密碼嗎？</p>
            <p className="mb-4 text-amber-700">系統將發送重設密碼連結至 {employee.email}</p>
            <div className="flex gap-3">
              <button className="rounded bg-amber-500 px-5 py-3 text-white font-semibold hover:bg-amber-600">確認發送</button>
              <button className="rounded bg-slate-200 px-5 py-3 hover:bg-slate-300" onClick={() => setShowResetConfirm(false)}>取消</button>
            </div>
          </div>
        )}
      </div>

      {/* 危險操作 */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-5">
        <h2 className="mb-3 text-xl font-semibold text-red-800">危險操作</h2>
        {!showDeactivate ? (
          <button
            className="rounded border-2 border-red-400 px-5 py-3 text-red-700 font-semibold hover:bg-red-100"
            onClick={() => setShowDeactivate(true)}
          >
            停用員工帳號（軟刪除）
          </button>
        ) : (
          <div className="rounded-lg border border-red-300 bg-white p-4">
            <p className="mb-3 font-semibold text-red-800">確認停用 {employee.name} 的帳號？</p>
            <p className="mb-4 text-red-700">停用後該員工將無法登入系統，但所有歷史記錄仍會保留。</p>
            <div className="flex gap-3">
              <button className="rounded bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700">確認停用</button>
              <button className="rounded bg-slate-200 px-5 py-3 hover:bg-slate-300" onClick={() => setShowDeactivate(false)}>取消</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
