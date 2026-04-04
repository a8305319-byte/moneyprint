'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const MONTHS = Array.from({ length: 6 }, (_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - i);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
});

interface Summary { month: string; totalIncome: number; totalExpense: number; netFlow: number; txCount: number; }
interface Category { categoryName: string; totalAmount: number; txCount: number; percentage: number; }

export default function ReportsPage() {
  const [month, setMonth] = useState(MONTHS[0]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [breakdown, setBreakdown] = useState<Category[]>([]);
  const [trend, setTrend] = useState<Summary[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/reports/monthly-summary?month=${month}`).then(r => r.json()),
      fetch(`${API}/reports/category-breakdown?month=${month}`).then(r => r.json()),
      fetch(`${API}/reports/monthly-trend?months=6`).then(r => r.json()),
    ]).then(([s, b, t]) => {
      setSummary(s.data);
      setBreakdown(b.data ?? []);
      setTrend(t.data ?? []);
    });
  }, [month]);

  const fmt = (n: number) => `NT$ ${Math.abs(n).toLocaleString()}`;
  const maxExp = Math.max(...trend.map(t => t.totalExpense), 1);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">報表</h1>
        <select value={month} onChange={e => setMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: '支出', value: summary.totalExpense, color: 'text-red-600', bg: 'bg-red-50' },
            { label: '收入', value: summary.totalIncome, color: 'text-green-600', bg: 'bg-green-50' },
            { label: '淨現金流', value: summary.netFlow, color: summary.netFlow >= 0 ? 'text-green-700' : 'text-red-700', bg: 'bg-gray-50' },
          ].map(c => (
            <div key={c.label} className={`${c.bg} rounded-xl p-4`}>
              <div className="text-sm text-gray-500">{c.label}</div>
              <div className={`text-xl font-bold ${c.color} mt-1`}>{fmt(c.value)}</div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">支出類別</h2>
        {breakdown.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">本月尚無支出資料</div>
        ) : breakdown.map(b => (
          <div key={b.categoryName} className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{b.categoryName}</span>
              <span className="font-medium">{fmt(b.totalAmount)} <span className="text-gray-400">({b.percentage.toFixed(1)}%)</span></span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${b.percentage}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">近6個月趨勢</h2>
        <div className="flex items-end gap-2 h-28">
          {trend.slice().reverse().map(t => (
            <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-red-400 rounded-t-sm"
                style={{ height: `${(t.totalExpense / maxExp) * 100}%`, minHeight: '4px' }} />
              <div className="text-xs text-gray-400">{t.month.slice(5)}月</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
