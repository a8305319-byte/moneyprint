'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getUser } from '@/lib/api';

type Stats = {
  totalActiveCases: number;
  overdueCases: number;
  pendingReview: number;
  pendingFiling: number;
  waitingData: number;
  overdueTasks: number;
  pendingPayments: number;
  pendingPaymentAmount: number;
  unreadNotifications: number;
};

type DashboardData = {
  overview: Stats;
  myTasks: any[];
  overdueCasesList: any[];
  pendingReviewList: any[];
  pendingFilingList: any[];
  pendingPaymentList: any[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = getUser();
    const query = user ? `?employeeId=${user.id}` : '';
    api.get<DashboardData>(`/dashboard/stats${query}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="flex items-center justify-center py-20 text-slate-400 text-lg">
        載入中…
      </main>
    );
  }
  if (error || !data) {
    return (
      <main className="py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          無法連線至伺服器：{error || '未知錯誤'}
        </div>
      </main>
    );
  }

  const { overview, myTasks, overdueCasesList, pendingReviewList, pendingFilingList, pendingPaymentList } = data;

  const statCards = [
    { label: '進行中案件', value: overview.totalActiveCases, color: 'text-blue-600', unit: '件', href: '/cases' },
    { label: '逾期案件', value: overview.overdueCases, color: 'text-red-600', unit: '件', href: '/cases?status=逾期' },
    { label: '待主管覆核', value: overview.pendingReview, color: 'text-purple-600', unit: '件', href: '/reviews' },
    { label: '待申報', value: overview.pendingFiling, color: 'text-orange-600', unit: '件', href: '/filings' },
    { label: '等待資料', value: overview.waitingData, color: 'text-yellow-600', unit: '家', href: '/cases' },
    { label: '待收款', value: overview.pendingPayments, color: 'text-pink-600', unit: '筆', href: '/payments' },
  ];

  return (
    <main className="space-y-6 text-base">
      <h1 className="text-2xl font-bold">首頁工作台</h1>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href}>
            <div className="rounded-xl border bg-white p-4 text-center shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className={`mt-1 text-4xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-slate-400">{s.unit}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 我的待辦任務 */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">我的待辦任務</h2>
            <Link href="/tasks" className="text-sm text-blue-600 hover:underline">全部 →</Link>
          </div>
          {myTasks.length === 0 ? (
            <p className="text-slate-400 py-4 text-center">目前沒有待辦任務</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-2 text-left text-sm font-semibold">任務</th>
                  <th className="p-2 text-left text-sm font-semibold">截止日</th>
                  <th className="p-2 text-left text-sm font-semibold">狀態</th>
                </tr>
              </thead>
              <tbody>
                {myTasks.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="p-2 text-sm">{t.title}</td>
                    <td className={`p-2 text-sm ${t.overdue ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                      {t.dueDate}{t.overdue && ' ⚠'}
                    </td>
                    <td className="p-2 text-sm">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.status === '逾期' ? 'bg-red-100 text-red-800' :
                        t.status === '進行中' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 逾期案件 */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">逾期案件</h2>
            <Link href="/cases" className="text-sm text-blue-600 hover:underline">全部 →</Link>
          </div>
          {overdueCasesList.length === 0 ? (
            <p className="text-green-600 py-4 text-center font-medium">目前沒有逾期案件</p>
          ) : (
            <div className="space-y-2">
              {overdueCasesList.map((c) => (
                <Link key={c.id} href={`/cases/${c.id}`}>
                  <div className="flex items-center justify-between rounded border border-red-100 bg-red-50 px-4 py-3 hover:border-red-300 transition-colors">
                    <div>
                      <p className="font-semibold">{c.clientName}</p>
                      <p className="text-sm text-slate-600">{c.id} · {c.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 font-semibold text-sm">截止 {c.dueDate}</p>
                      <p className="text-xs text-slate-500">{c.owner}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 待覆核 */}
        {pendingReviewList.length > 0 && (
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">待主管覆核</h2>
              <Link href="/reviews" className="text-sm text-blue-600 hover:underline">全部 →</Link>
            </div>
            <div className="space-y-2">
              {pendingReviewList.map((c) => (
                <Link key={c.id} href={`/cases/${c.id}`}>
                  <div className="flex items-center justify-between rounded border border-purple-100 bg-purple-50 px-4 py-3 hover:border-purple-300 transition-colors">
                    <div>
                      <p className="font-semibold">{c.clientName}</p>
                      <p className="text-sm text-slate-600">{c.id} · {c.month}</p>
                    </div>
                    <p className="text-sm text-slate-500">{c.owner}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 待收款 */}
        {pendingPaymentList.length > 0 && (
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">待收款</h2>
              <Link href="/payments" className="text-sm text-blue-600 hover:underline">全部 →</Link>
            </div>
            <div className="space-y-2">
              {pendingPaymentList.map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded border border-yellow-100 bg-yellow-50 px-4 py-3">
                  <div>
                    <p className="font-semibold">{p.clientName}</p>
                    <p className="text-sm text-slate-500">{p.month}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">NT$ {p.amount.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">{p.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 快速操作 */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold mb-3">快速操作</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: '＋ 新增客戶', href: '/clients/new' },
            { label: '📁 新增案件', href: '/cases/new' },
            { label: '✅ 所有任務', href: '/tasks' },
            { label: '📋 覆核清單', href: '/reviews' },
            { label: '🧾 申報管理', href: '/filings' },
            { label: '💰 收款管理', href: '/payments' },
            { label: '📄 上傳文件', href: '/documents' },
          ].map((btn) => (
            <Link key={btn.href} href={btn.href}>
              <button className="rounded-lg bg-slate-100 px-5 py-3 font-semibold hover:bg-blue-50 hover:text-blue-700 transition-colors">
                {btn.label}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
