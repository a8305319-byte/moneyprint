'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, getUser } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  已發放: 'bg-green-100 text-green-800',
  未發放: 'bg-yellow-100 text-yellow-800',
};

export default function SalaryPage() {
  const [salaryData, setSalaryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/salary')
      .then((res) => {
        const data = res.data;
        setSalaryData(data);
        if (data.length > 0 && !selectedMonth) {
          const months = [...new Set(data.map((s: any) => s.month))].sort((a: any, b: any) => b.localeCompare(a));
          setSelectedMonth(months[0] as string);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const months = [...new Set(salaryData.map((s) => s.month))].sort((a, b) => b.localeCompare(a));

  const filtered = salaryData.filter((s) => {
    return (!selectedMonth || s.month === selectedMonth) && s.employeeName?.includes(search);
  });

  const totalBase = filtered.reduce((sum, s) => sum + (s.baseSalary ?? 0), 0);
  const totalBonus = filtered.reduce((sum, s) => sum + (s.bonus ?? 0), 0);
  const totalNet = filtered.reduce((sum, s) => sum + (s.net ?? 0), 0);
  const paidCount = filtered.filter((s) => s.status === '已發放').length;
  const unpaidCount = filtered.filter((s) => s.status === '未發放').length;

  const handleMarkPaid = (id: string) => {
    const user = getUser();
    api.patch(`/salary/${id}/pay`, { lastModifiedBy: user?.name ?? '' }).then((res) => {
      setSalaryData((prev) => prev.map((s) => s.id === id ? res.data : s));
    });
  };

  return (
    <main className="space-y-5 text-base">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">薪資管理</h1>
        <div className="flex gap-3">
          <button className="rounded bg-green-600 px-5 py-3 text-white font-semibold hover:bg-green-700" onClick={() => window.print()}>匯出薪資表</button>
        </div>
      </div>

      {/* 月份選擇 */}
      <div className="flex gap-3 rounded-lg border bg-white p-4">
        <select
          className="rounded border px-4 py-3 text-base font-semibold"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {months.map((m) => <option key={m}>{m}</option>)}
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
          <p className="text-2xl font-bold text-green-600">{loading ? '…' : paidCount}</p>
          <p className="mt-1 text-slate-500">已發放</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{loading ? '…' : unpaidCount}</p>
          <p className="mt-1 text-slate-500">待發放</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">無法載入薪資：{error}</div>
      )}

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
            {loading && <tr><td colSpan={10} className="p-8 text-center text-slate-400">載入中…</td></tr>}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={10} className="p-8 text-center text-slate-400">目前無薪資記錄</td></tr>
            )}
            {filtered.map((s) => (
              <tr key={s.id} className={`border-t hover:bg-slate-50 ${s.status === '未發放' ? 'bg-yellow-50' : ''}`}>
                <td className="px-4 py-3 font-semibold">{s.employeeName}</td>
                <td className="px-4 py-3 text-slate-600">{s.role}</td>
                <td className="px-4 py-3 text-right">NT$ {s.baseSalary?.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-green-700">
                  {s.bonus > 0 ? `+${s.bonus.toLocaleString()}` : '—'}
                </td>
                <td className="px-4 py-3 text-right text-red-600">-{s.laborIns?.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-red-600">-{s.healthIns?.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-red-600">
                  {s.incomeTax > 0 ? `-${s.incomeTax.toLocaleString()}` : '—'}
                </td>
                <td className="px-4 py-3 text-right font-bold text-blue-700">NT$ {s.net?.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[s.status] ?? 'bg-slate-100'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/salary/${s.id}`}>
                      <button className="rounded bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-900">薪資單</button>
                    </Link>
                    {s.status === '未發放' && (
                      <button
                        className="rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                        onClick={() => handleMarkPaid(s.id)}
                      >
                        發放
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {filtered.length > 0 && (
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
          )}
        </table>
      </div>
    </main>
  );
}
