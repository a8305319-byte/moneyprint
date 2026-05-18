'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const EXT_ICONS: Record<string, string> = {
  pdf: '📄',
  xlsx: '📊',
  xls: '📊',
  docx: '📝',
  doc: '📝',
  jpg: '🖼',
  jpeg: '🖼',
  png: '🖼',
};

const CATEGORIES = ['全部', '發票憑證', '合約', '申報書', '報表', '薪資資料'];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('全部');
  const [filterClient, setFilterClient] = useState('全部');
  const [search, setSearch] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    api.get('/documents')
      .then((res) => setDocuments(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const clients = ['全部', ...Array.from(new Set(documents.map((d) => d.clientName).filter(Boolean)))];

  const filtered = documents.filter((d) => {
    const matchCategory = filterCategory === '全部' || d.category === filterCategory;
    const matchClient = filterClient === '全部' || d.clientName === filterClient;
    const matchSearch = d.name?.includes(search) || d.clientName?.includes(search);
    return matchCategory && matchClient && matchSearch;
  });

  const handleDelete = (id: string) => {
    if (!confirm('確定要刪除此文件？')) return;
    api.delete(`/documents/${id}`).then(() => {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    });
  };

  return (
    <main className="space-y-5 text-base">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">文件與憑證管理</h1>
        <button className="rounded bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700">上傳文件</button>
      </div>

      {/* 拖曳上傳區 */}
      <div
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-white'}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
      >
        <p className="text-3xl mb-2">📁</p>
        <p className="text-lg font-semibold">拖曳檔案到這裡上傳</p>
        <p className="mt-1 text-slate-500">支援 PDF、JPG、PNG、Excel、Word，單檔最大 50MB</p>
        <button className="mt-4 rounded bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700">選擇檔案</button>
      </div>

      {/* 篩選 */}
      <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4">
        <input
          className="rounded border px-4 py-3 text-base w-56"
          placeholder="搜尋檔名、客戶…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="rounded border px-4 py-3 text-base" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="rounded border px-4 py-3 text-base" value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
          {clients.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => { setSearch(''); setFilterCategory('全部'); setFilterClient('全部'); }}>清除篩選</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">無法載入文件：{error}</div>
      )}

      {/* 文件表格 */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-4 py-3 text-left font-semibold">檔案名稱</th>
              <th className="px-4 py-3 text-left font-semibold">分類</th>
              <th className="px-4 py-3 text-left font-semibold">客戶</th>
              <th className="px-4 py-3 text-left font-semibold">關聯案件</th>
              <th className="px-4 py-3 text-left font-semibold">上傳人</th>
              <th className="px-4 py-3 text-left font-semibold">大小</th>
              <th className="px-4 py-3 text-left font-semibold">上傳日期</th>
              <th className="px-4 py-3 text-left font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="p-8 text-center text-slate-400">載入中…</td></tr>}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-slate-400">無符合條件的文件</td></tr>
            )}
            {filtered.map((d) => {
              const ext = d.ext ?? d.name?.split('.').pop()?.toLowerCase() ?? '';
              return (
                <tr key={d.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{EXT_ICONS[ext] ?? '📄'}</span>
                      <span className="font-medium text-sm">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{d.category}</td>
                  <td className="px-4 py-3 text-sm">{d.clientName}</td>
                  <td className="px-4 py-3">
                    {d.caseId
                      ? <Link href={`/cases/${d.caseId}`} className="font-mono text-sm text-blue-600 hover:underline">{d.caseId}</Link>
                      : <span className="text-slate-400 text-sm">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-sm">{d.uploader}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{d.size ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{d.uploadedAt ?? d.createdAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="rounded bg-slate-200 px-3 py-2 text-sm hover:bg-slate-300">預覽</button>
                      <button className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">下載</button>
                      <button
                        className="rounded bg-red-100 px-3 py-2 text-sm text-red-600 hover:bg-red-200"
                        onClick={() => handleDelete(d.id)}
                      >
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="border-t bg-slate-50 px-4 py-3 text-sm text-slate-500">
          顯示 {filtered.length} / {documents.length} 筆文件
        </div>
      </div>
    </main>
  );
}
