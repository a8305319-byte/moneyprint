'use client';
import { useState } from 'react';

type ReportType = '案件統計' | '收款報表' | '員工工作量' | '稅務申報統計' | '薪資統計';

const caseStats = [
  { client: '宏達貿易', total: 5, done: 4, inProgress: 1, overdue: 0 },
  { client: '新光物流', total: 4, done: 2, inProgress: 1, overdue: 1 },
  { client: '全台科技', total: 3, done: 2, inProgress: 1, overdue: 0 },
  { client: '信義建設', total: 2, done: 1, inProgress: 1, overdue: 0 },
  { client: '松山食品', total: 2, done: 2, inProgress: 0, overdue: 0 },
  { client: '大安診所', total: 2, done: 0, inProgress: 1, overdue: 1 },
];

const paymentStats = [
  { month: '2026-05', received: 30000, pending: 17000, total: 47000, rate: 64 },
  { month: '2026-04', received: 43500, pending: 0, total: 43500, rate: 100 },
  { month: '2026-03', received: 43500, pending: 0, total: 43500, rate: 100 },
  { month: '2026-02', received: 35500, pending: 8000, total: 43500, rate: 82 },
];

const workloadStats = [
  { name: '陳美玲', role: '資深會計', cases: 3, tasks: 5, overdueTasks: 0, reviewSubmitted: 2 },
  { name: '王志明', role: '一般會計', cases: 2, tasks: 4, overdueTasks: 1, reviewSubmitted: 1 },
  { name: '林佳慧', role: '一般會計', cases: 2, tasks: 3, overdueTasks: 0, reviewSubmitted: 0 },
  { name: '李建宏', role: '資深會計', cases: 2, tasks: 2, overdueTasks: 0, reviewSubmitted: 0 },
  { name: '張淑芬', role: '主任', cases: 1, tasks: 1, overdueTasks: 0, reviewSubmitted: 0 },
];

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('案件統計');
  const [reportMonth, setReportMonth] = useState('2026-05');

  const reports: ReportType[] = ['案件統計', '收款報表', '員工工作量', '稅務申報統計', '薪資統計'];

  return (
    <main className="space-y-5 text-base">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">報表中心</h1>
        <div className="flex gap-3">
          <button className="rounded bg-green-600 px-5 py-3 text-white font-semibold hover:bg-green-700">匯出 Excel</button>
          <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
        </div>
      </div>

      {/* 報表類型選擇 */}
      <div className="flex flex-wrap gap-2 rounded-lg border bg-white p-4">
        {reports.map((r) => (
          <button
            key={r}
            className={`rounded-full px-5 py-2 font-medium transition-colors ${
              activeReport === r
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            onClick={() => setActiveReport(r)}
          >
            {r}
          </button>
        ))}
      </div>

      {/* 期間選擇 */}
      <div className="flex gap-3 rounded-lg border bg-white p-4">
        <select className="rounded border px-4 py-3 text-base" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)}>
          <option>2026-05</option>
          <option>2026-04</option>
          <option>2026-03</option>
          <option>2026-Q2</option>
          <option>2026</option>
        </select>
        <p className="flex items-center text-slate-500">· 報表月份：{reportMonth}</p>
      </div>

      {/* 案件統計 */}
      {activeReport === '案件統計' && (
        <div className="rounded-lg border bg-white overflow-hidden">
          <div className="border-b bg-slate-50 px-4 py-3">
            <h2 className="text-xl font-semibold">案件統計報表 — {reportMonth}</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="px-4 py-3 text-left font-semibold">客戶</th>
                <th className="px-4 py-3 text-center font-semibold">案件總數</th>
                <th className="px-4 py-3 text-center font-semibold text-green-700">已結案</th>
                <th className="px-4 py-3 text-center font-semibold text-blue-700">進行中</th>
                <th className="px-4 py-3 text-center font-semibold text-red-700">逾期</th>
                <th className="px-4 py-3 text-center font-semibold">完成率</th>
              </tr>
            </thead>
            <tbody>
              {caseStats.map((c) => (
                <tr key={c.client} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{c.client}</td>
                  <td className="px-4 py-3 text-center">{c.total}</td>
                  <td className="px-4 py-3 text-center text-green-700 font-semibold">{c.done}</td>
                  <td className="px-4 py-3 text-center text-blue-700">{c.inProgress}</td>
                  <td className="px-4 py-3 text-center text-red-600">{c.overdue > 0 ? c.overdue : '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-3 rounded-full bg-green-500"
                          style={{ width: `${Math.round((c.done / c.total) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-10">{Math.round((c.done / c.total) * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="border-t bg-slate-50 font-bold">
                <td className="px-4 py-3">合計</td>
                <td className="px-4 py-3 text-center">{caseStats.reduce((s, c) => s + c.total, 0)}</td>
                <td className="px-4 py-3 text-center text-green-700">{caseStats.reduce((s, c) => s + c.done, 0)}</td>
                <td className="px-4 py-3 text-center text-blue-700">{caseStats.reduce((s, c) => s + c.inProgress, 0)}</td>
                <td className="px-4 py-3 text-center text-red-600">{caseStats.reduce((s, c) => s + c.overdue, 0)}</td>
                <td className="px-4 py-3 text-center">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 收款報表 */}
      {activeReport === '收款報表' && (
        <div className="rounded-lg border bg-white overflow-hidden">
          <div className="border-b bg-slate-50 px-4 py-3">
            <h2 className="text-xl font-semibold">收款報表</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="px-4 py-3 text-left font-semibold">月份</th>
                <th className="px-4 py-3 text-right font-semibold text-green-700">已收款</th>
                <th className="px-4 py-3 text-right font-semibold text-red-700">待收款</th>
                <th className="px-4 py-3 text-right font-semibold">應收合計</th>
                <th className="px-4 py-3 text-center font-semibold">收款率</th>
              </tr>
            </thead>
            <tbody>
              {paymentStats.map((p) => (
                <tr key={p.month} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">{p.month}</td>
                  <td className="px-4 py-3 text-right text-green-700 font-semibold">NT$ {p.received.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-red-600">
                    {p.pending > 0 ? `NT$ ${p.pending.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">NT$ {p.total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
                        <div className={`h-3 rounded-full ${p.rate === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${p.rate}%` }} />
                      </div>
                      <span className="text-sm font-medium w-10">{p.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 員工工作量 */}
      {activeReport === '員工工作量' && (
        <div className="rounded-lg border bg-white overflow-hidden">
          <div className="border-b bg-slate-50 px-4 py-3">
            <h2 className="text-xl font-semibold">員工工作量統計 — {reportMonth}</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="px-4 py-3 text-left font-semibold">姓名</th>
                <th className="px-4 py-3 text-left font-semibold">職稱</th>
                <th className="px-4 py-3 text-center font-semibold">負責案件數</th>
                <th className="px-4 py-3 text-center font-semibold">任務數</th>
                <th className="px-4 py-3 text-center font-semibold text-red-700">逾期任務</th>
                <th className="px-4 py-3 text-center font-semibold">送審次數</th>
              </tr>
            </thead>
            <tbody>
              {workloadStats.map((w) => (
                <tr key={w.name} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">{w.name}</td>
                  <td className="px-4 py-3 text-slate-600">{w.role}</td>
                  <td className="px-4 py-3 text-center">{w.cases}</td>
                  <td className="px-4 py-3 text-center">{w.tasks}</td>
                  <td className="px-4 py-3 text-center text-red-600">{w.overdueTasks > 0 ? w.overdueTasks : '—'}</td>
                  <td className="px-4 py-3 text-center">{w.reviewSubmitted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeReport === '稅務申報統計' && (
        <div className="rounded-lg border bg-white p-6 text-center text-slate-400">
          <p className="text-xl">稅務申報統計報表</p>
          <p className="mt-2">請前往「稅務申報管理」查看詳細申報資料</p>
        </div>
      )}

      {activeReport === '薪資統計' && (
        <div className="rounded-lg border bg-white p-6 text-center text-slate-400">
          <p className="text-xl">薪資統計報表</p>
          <p className="mt-2">請前往「薪資管理」查看詳細薪資資料</p>
        </div>
      )}
    </main>
  );
}
