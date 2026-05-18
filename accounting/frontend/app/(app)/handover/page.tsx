'use client';
import { useEffect, useState } from 'react';
import { api, getUser } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  進行中: 'bg-blue-100 text-blue-800',
  已完成: 'bg-green-100 text-green-800',
};

export default function HandoverPage() {
  const [handovers, setHandovers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fromEmployee: '', toEmployee: '', note: '', caseIds: '' });
  const [submitting, setSubmitting] = useState(false);

  const user = getUser();

  useEffect(() => {
    api.get('/handover')
      .then((res) => setHandovers(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fromEmployee || !form.toEmployee) return;
    setSubmitting(true);
    try {
      const res = await api.post('/handover', {
        fromEmployee: form.fromEmployee,
        toEmployee: form.toEmployee,
        note: form.note,
        caseIds: form.caseIds ? form.caseIds.split(',').map((s) => s.trim()).filter(Boolean) : [],
        lastModifiedBy: user?.name ?? '',
      });
      setHandovers((prev) => [res.data, ...prev]);
      setForm({ fromEmployee: '', toEmployee: '', note: '', caseIds: '' });
      setShowForm(false);
    } catch (err: any) {
      alert(err.message ?? '建立失敗');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = (id: string) => {
    api.patch(`/handover/${id}/complete`, { lastModifiedBy: user?.name ?? '' }).then((res) => {
      setHandovers((prev) => prev.map((h) => h.id === id ? res.data : h));
    });
  };

  return (
    <main className="space-y-5 text-base">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">交接管理</h1>
        <button
          className="rounded bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '取消' : '＋ 新增交接單'}
        </button>
      </div>

      {/* 新增表單 */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-lg border bg-white p-6 space-y-4">
          <h2 className="text-xl font-semibold">新增交接單</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-semibold">交接人（從）</label>
              <input
                className="w-full rounded border px-4 py-3"
                placeholder="員工姓名"
                value={form.fromEmployee}
                onChange={(e) => setForm({ ...form, fromEmployee: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold">接收人（給）</label>
              <input
                className="w-full rounded border px-4 py-3"
                placeholder="員工姓名"
                value={form.toEmployee}
                onChange={(e) => setForm({ ...form, toEmployee: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block font-semibold">關聯案件編號（逗號分隔，選填）</label>
            <input
              className="w-full rounded border px-4 py-3"
              placeholder="A001, A002, A003"
              value={form.caseIds}
              onChange={(e) => setForm({ ...form, caseIds: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block font-semibold">備註</label>
            <textarea
              className="w-full rounded border px-4 py-3"
              rows={3}
              placeholder="交接說明"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? '建立中…' : '建立交接單'}
          </button>
        </form>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">無法載入交接資料：{error}</div>
      )}

      {/* 交接列表 */}
      <div className="space-y-3">
        {loading && <div className="rounded-lg border bg-white p-8 text-center text-slate-400">載入中…</div>}
        {!loading && handovers.length === 0 && (
          <div className="rounded-lg border bg-white p-8 text-center text-slate-400">目前沒有交接記錄</div>
        )}
        {handovers.map((h) => (
          <div key={h.id} className="rounded-lg border bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-slate-500">{h.id}</span>
                  <span className="font-bold">{h.fromEmployee}</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-bold">{h.toEmployee}</span>
                </div>
                <p className="mt-1 text-slate-600 text-sm">
                  {h.caseIds?.length > 0 && <span>案件 {h.caseIds.length} 個　</span>}
                  {h.clientCount > 0 && <span>客戶 {h.clientCount} 家　</span>}
                  建立時間：{h.createdAt}
                  {h.completedAt && <span>　完成時間：{h.completedAt}</span>}
                </p>
                {h.note && <p className="mt-1 text-sm text-slate-500">備注：{h.note}</p>}
                {h.caseIds?.length > 0 && (
                  <p className="mt-1 text-sm text-blue-600">
                    關聯案件：{h.caseIds.join('、')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[h.status] ?? 'bg-slate-100'}`}>
                  {h.status}
                </span>
                {h.status === '進行中' && (
                  <button
                    className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                    onClick={() => handleComplete(h.id)}
                  >
                    標記完成
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
