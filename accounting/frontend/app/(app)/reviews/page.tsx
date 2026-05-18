'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, getUser } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  待覆核: 'bg-yellow-100 text-yellow-800',
  已核准: 'bg-green-100 text-green-800',
  已退回: 'bg-red-100 text-red-800',
};

const REVIEW_STATUS_MAP: Record<string, string> = {
  送主管覆核: '待覆核',
  退回修改: '已退回',
  已申報: '已核准',
  歸檔: '已核准',
  結案: '已核准',
};

const REVIEW_STATUSES = ['全部', '待覆核', '已核准', '已退回'];

export default function ReviewsPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const user = getUser();

  useEffect(() => {
    api.get('/cases')
      .then((res) => {
        const reviewable = res.data.filter((c: any) => REVIEW_STATUS_MAP[c.status]);
        setCases(reviewable);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const reviews = cases.map((c) => ({
    caseId: c.id,
    client: c.clientName,
    type: c.type,
    month: c.month,
    submitter: c.owner,
    submittedAt: c.timeline?.findLast?.((t: any) => t.action === '送主管覆核')?.at ?? c.createdAt,
    status: REVIEW_STATUS_MAP[c.status] ?? '待覆核',
    reviewer: c.lastModifiedBy,
    reviewedAt: c.timeline?.findLast?.((t: any) => t.action === '退回修改' || t.action === '已申報')?.at ?? '',
    rejectReason: c.rejectReason,
  }));

  const filtered = reviews.filter((r) => {
    const matchStatus = filterStatus === '全部' || r.status === filterStatus;
    const matchSearch = r.client.includes(search) || r.caseId.includes(search) || r.submitter.includes(search);
    return matchStatus && matchSearch;
  });

  const pending = reviews.filter((r) => r.status === '待覆核').length;
  const approved = reviews.filter((r) => r.status === '已核准').length;
  const rejected = reviews.filter((r) => r.status === '已退回').length;

  const handleApprove = async (caseId: string) => {
    setSubmitting(true);
    try {
      await api.patch(`/cases/${caseId}/status`, {
        status: '已申報',
        lastModifiedBy: user?.name ?? '',
      });
      setCases((prev) => prev.map((c) => c.id === caseId ? { ...c, status: '已申報', lastModifiedBy: user?.name } : c));
      setSelectedId(null);
    } catch (err: any) {
      alert(err.message ?? '核准失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (caseId: string) => {
    setSubmitting(true);
    try {
      await api.patch(`/cases/${caseId}/status`, {
        status: '退回修改',
        lastModifiedBy: user?.name ?? '',
        rejectReason,
      });
      setCases((prev) => prev.map((c) => c.id === caseId ? { ...c, status: '退回修改', rejectReason, lastModifiedBy: user?.name } : c));
      setSelectedId(null);
      setRejectReason('');
    } catch (err: any) {
      alert(err.message ?? '退回失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="space-y-5 text-base">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">主管覆核</h1>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{loading ? '…' : pending}</p>
          <p className="mt-1 text-slate-500">待覆核</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{loading ? '…' : approved}</p>
          <p className="mt-1 text-slate-500">已核准</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{loading ? '…' : rejected}</p>
          <p className="mt-1 text-slate-500">已退回</p>
        </div>
      </div>

      {/* 篩選 */}
      <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4">
        <input
          className="rounded border px-4 py-3 text-base w-52"
          placeholder="搜尋客戶、案件、送審人…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="rounded border px-4 py-3 text-base" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          {REVIEW_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200"
          onClick={() => { setSearch(''); setFilterStatus('全部'); }}>清除篩選</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">無法載入覆核資料：{error}</div>
      )}

      {/* 覆核列表 */}
      <div className="grid gap-4">
        {loading && <div className="rounded-lg border bg-white p-8 text-center text-slate-400">載入中…</div>}
        {!loading && filtered.length === 0 && (
          <div className="rounded-lg border bg-white p-8 text-center text-slate-400">無符合條件的覆核記錄</div>
        )}
        {filtered.map((r) => (
          <div key={r.caseId} className={`rounded-lg border bg-white p-5 ${selectedId === r.caseId ? 'border-blue-400 ring-2 ring-blue-200' : 'hover:border-slate-300'}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <Link href={`/cases/${r.caseId}`} className="font-mono font-bold text-blue-600 hover:underline">{r.caseId}</Link>
                  <span className="text-slate-500">·</span>
                  <span className="font-semibold">{r.client}</span>
                  <span className="text-slate-500">{r.type} {r.month}</span>
                </div>
                <p className="mt-1 text-slate-600">
                  送審人：<span className="font-medium">{r.submitter}</span>
                  {r.submittedAt && <span className="ml-3 text-slate-400">{r.submittedAt}</span>}
                </p>
                {r.reviewedAt && (
                  <p className="text-slate-600">
                    覆核人：<span className="font-medium">{r.reviewer}</span>
                    <span className="ml-3 text-slate-400">{r.reviewedAt}</span>
                  </p>
                )}
                {r.rejectReason && (
                  <div className="mt-2 rounded bg-red-50 border border-red-200 px-3 py-2 text-red-700 text-sm">
                    退回原因：{r.rejectReason}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[r.status]}`}>
                  {r.status}
                </span>
                {r.status === '待覆核' && (
                  <button
                    className="rounded bg-blue-600 px-4 py-2 text-white text-sm hover:bg-blue-700"
                    onClick={() => setSelectedId(selectedId === r.caseId ? null : r.caseId)}
                  >
                    {selectedId === r.caseId ? '收起' : '開始覆核'}
                  </button>
                )}
              </div>
            </div>

            {/* 覆核操作面板 */}
            {selectedId === r.caseId && r.status === '待覆核' && (
              <div className="mt-4 border-t pt-4">
                <div className="flex gap-3">
                  <Link href={`/cases/${r.caseId}`}>
                    <button className="rounded bg-slate-200 px-4 py-3 hover:bg-slate-300">查看案件詳情</button>
                  </Link>
                </div>
                <div className="mt-4">
                  <p className="mb-2 font-semibold">退回原因（選填）：</p>
                  <textarea
                    className="w-full rounded border px-4 py-3 text-base"
                    placeholder="若要退回請填寫退回原因…"
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
                <div className="mt-3 flex gap-3">
                  <button
                    className="rounded bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
                    disabled={submitting}
                    onClick={() => handleApprove(r.caseId)}
                  >
                    ✓ 核准通過
                  </button>
                  <button
                    className="rounded bg-red-600 px-6 py-3 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
                    disabled={submitting || !rejectReason.trim()}
                    onClick={() => handleReject(r.caseId)}
                  >
                    ✗ 退回修改
                  </button>
                  <button className="rounded bg-slate-200 px-4 py-3 hover:bg-slate-300" onClick={() => { setSelectedId(null); setRejectReason(''); }}>
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
