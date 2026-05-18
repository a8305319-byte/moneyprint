'use client';
import Link from 'next/link';
import { useState } from 'react';

const salaryData = [
  { id: 'S001', employeeId: 'E001', name: '林國棟', role: '老闆', month: '2026-05', baseSalary: 80000, bonus: 10000, laborIns: 3000, healthIns: 1200, incomeTax: 2000, net: 83800, status: '已發放', paidAt: '2026-05-05' },
  { id: 'S002', employeeId: 'E002', name: '張淑芬', role: '主任', month: '2026-05', baseSalary: 65000, bonus: 5000, laborIns: 2800, healthIns: 1100, incomeTax: 1500, net: 64600, status: '已發放', paidAt: '2026-05-05' },
  { id: 'S003', employeeId: 'E003', name: '陳美玲', role: '資深會計', month: '2026-05', baseSalary: 52000, bonus: 3000, laborIns: 2400, healthIns: 950, incomeTax: 800, net: 50850, status: '已發放', paidAt: '2026-05-05' },
  { id: 'S004', employeeId: 'E004', name: '王志明', role: '一般會計', month: '2026-05', baseSalary: 45000, bonus: 0, laborIns: 2100, healthIns: 850, incomeTax: 500, net: 41550, status: '未發放', paidAt: null },
  { id: 'S005', employeeId: 'E005', name: '林佳慧', role: '一般會計', month: '2026-05', baseSalary: 45000, bonus: 2000, laborIns: 2100, healthIns: 850, incomeTax: 500, net: 43550, status: '未發放', paidAt: null },
  { id: 'S006', employeeId: 'E006', name: '李建宏', role: '資深會計', month: '2026-05', baseSalary: 52000, bonus: 0, laborIns: 2400, healthIns: 950, incomeTax: 800, net: 47850, status: '未發放', paidAt: null },
  { id: 'S007', employeeId: 'E007', name: '黃曉玲', role: '助理', month: '2026-05', baseSalary: 30000, bonus: 0, laborIns: 1500, healthIns: 620, incomeTax: 0, net: 27880, status: '未發放', paidAt: null },
  { id: 'S008', employeeId: 'E008', name: '吳俊宏', role: '實習生', month: '2026-05', baseSalary: 20000, bonus: 0, laborIns: 1200, healthIns: 500, incomeTax: 0, net: 18300, status: '未發放', paidAt: null },
];

const MONTHS = ['2026-05', '2026-04', '2026-03'];
const STATUS_COLORS: Record<string, string> = {
  已發放: 'bg-green-100 text-green-800',
  未發放: 'bg-yellow-100 text-yellow-800',
};

export default function SalaryPage() {
  const [selectedMonth, setSelectedMonth] = useState('2026-05');
  const [search, setSearch] = useState('');

  const filtered = salaryData.filter((s) => {
    return s.month === selectedMonth && s.name.includes(search);
  });

  const totalBase = filtered.reduce((sum, s) => sum + s.baseSalary, 0);
  const totalBonus = filtered.reduce((sum, s) => sum + s.bonus, 0);
  const totalNet = filtered.reduce((sum, s) => sum + s.net, 0);
  const paidCount = filtered.filter((s) => s.status === '已發放').length;
  const unpaidCount = filtered.filter((s) => s.status === '未發放').length;

  return (
    <main className="space-y-5 text-base">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">薪資管理</h1>
        <div className="flex gap-3">
          <button className="rounded bg-green-600 px-5 py-3 text-white font-semibold hover:bg-green-700">匯出薪資表</button>
          <button className="rounded bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700">建立本月薪資</button>
        </div>
      </div>

      {/* 月份選擇 */}
      <div className="flex gap-3 rounded-lg border bg-white p-4">
        <select
          className="rounded border px-4 py-3 text-base font-semibold"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {MONTHS.map((m) => <option key={m}>{m}</option>)}
        </select>
        <input
          className="rounded border px-4 py-3 text-base"
          placeholder="搜尋員工姓名…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
      </div>

      {/* 月份統計 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">NT$ {totalNet.toLocaleString()}</p>
          <p className="mt-1 text-slate-500">本月實發總額</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-700">NT$ {totalBase.toLocaleString()}</p>
          <p className="mt-1 text-slate-500">底薪合計</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{paidCount}</p>
          <p className="mt-1 text-slate-500">已發放</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{unpaidCount}</p>
          <p className="mt-1 text-slate-500">待發放</p>
        </div>
      </div>

      {/* 薪資表格 */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-4 py-3 text-left font-semibold">員工</th>
              <th className="px-4 py-3 text-left font-semibold">職稱</th>
              <th className="px-4 py-3 text-right font-semibold">底薪</th>
              <th className="px-4 py-3 text-right font-semibold">獎金</th>
              <th className="px-4 py-3 text-right font-semibold">勞保</th>
              <th className="px-4 py-3 text-right font-semibold">健保</th>
              <th className="px-4 py-3 text-right font-semibold">所得稅</th>
              <th className="px-4 py-3 text-right font-semibold text-blue-700">實發金額</th>
              <th className="px-4 py-3 text-left font-semibold">狀態</th>
              <th className="px-4 py-3 text-left font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className={`border-t hover:bg-slate-50 ${s.status === '未發放' ? 'bg-yellow-50' : ''}`}>
                <td className="px-4 py-3 font-semibold">{s.name}</td>
                <td className="px-4 py-3 text-slate-600">{s.role}</td>
                <td className="px-4 py-3 text-right">NT$ {s.baseSalary.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-green-700">
                  {s.bonus > 0 ? `+${s.bonus.toLocaleString()}` : '—'}
                </td>
                <td className="px-4 py-3 text-right text-red-600">-{s.laborIns.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-red-600">-{s.healthIns.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-red-600">
                  {s.incomeTax > 0 ? `-${s.incomeTax.toLocaleString()}` : '—'}
                </td>
                <td className="px-4 py-3 text-right font-bold text-blue-700">NT$ {s.net.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[s.status]}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/salary/${s.id}`}>
                      <button className="rounded bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-900">薪資單</button>
                    </Link>
                    {s.status === '未發放' && (
                      <button className="rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700">發放</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-slate-50 font-bold">
              <td className="px-4 py-3 text-right" colSpan={2}>合計</td>
              <td className="px-4 py-3 text-right">NT$ {totalBase.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-green-700">+{totalBonus.toLocaleString()}</td>
              <td colSpan={3} />
              <td className="px-4 py-3 text-right text-blue-700">NT$ {totalNet.toLocaleString()}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </main>
  );
}
