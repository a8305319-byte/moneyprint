'use client';
import Link from 'next/link';
import { useState } from 'react';

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

const documents = [
  { id: 'D001', name: '宏達貿易5月進項憑證彙整.xlsx', category: '發票憑證', client: '宏達貿易', caseId: 'A001', uploader: '陳美玲', size: '285KB', uploadedAt: '2026-05-08', ext: 'xlsx' },
  { id: 'D002', name: '宏達貿易5月銷項憑證彙整.xlsx', category: '發票憑證', client: '宏達貿易', caseId: 'A001', uploader: '陳美玲', size: '194KB', uploadedAt: '2026-05-08', ext: 'xlsx' },
  { id: 'D003', name: '客戶對帳單5月.pdf', category: '報表', client: '宏達貿易', caseId: 'A001', uploader: '陳美玲', size: '512KB', uploadedAt: '2026-05-08', ext: 'pdf' },
  { id: 'D004', name: '信義建設年度合約2026.pdf', category: '合約', client: '信義建設', caseId: '', uploader: '李建宏', size: '1.2MB', uploadedAt: '2026-05-01', ext: 'pdf' },
  { id: 'D005', name: '新光物流扣繳申報書.pdf', category: '申報書', client: '新光物流', caseId: 'A002', uploader: '王志明', size: '340KB', uploadedAt: '2026-05-16', ext: 'pdf' },
  { id: 'D006', name: '全台科技薪資明細5月.xlsx', category: '薪資資料', client: '全台科技', caseId: 'A003', uploader: '林佳慧', size: '156KB', uploadedAt: '2026-05-15', ext: 'xlsx' },
  { id: 'D007', name: '大安診所發票20260501.jpg', category: '發票憑證', client: '大安診所', caseId: 'A008', uploader: '張淑芬', size: '2.1MB', uploadedAt: '2026-05-10', ext: 'jpg' },
  { id: 'D008', name: '松山食品固定資產清單.xlsx', category: '報表', client: '松山食品', caseId: '', uploader: '林佳慧', size: '98KB', uploadedAt: '2026-05-12', ext: 'xlsx' },
  { id: 'D009', name: '宏達貿易年度記帳合約2026.docx', category: '合約', client: '宏達貿易', caseId: '', uploader: '陳美玲', size: '88KB', uploadedAt: '2025-12-15', ext: 'docx' },
];

const CATEGORIES = ['全部', '發票憑證', '合約', '申報書', '報表', '薪資資料'];
const CLIENTS = ['全部', '宏達貿易', '新光物流', '全台科技', '信義建設', '松山食品', '大安診所'];

export default function DocumentsPage() {
  const [filterCategory, setFilterCategory] = useState('全部');
  const [filterClient, setFilterClient] = useState('全部');
  const [search, setSearch] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const filtered = documents.filter((d) => {
    const matchCategory = filterCategory === '全部' || d.category === filterCategory;
    const matchClient = filterClient === '全部' || d.client === filterClient;
    const matchSearch = d.name.includes(search) || d.client.includes(search);
    return matchCategory && matchClient && matchSearch;
  });

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
          {CLIENTS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => { setSearch(''); setFilterCategory('全部'); setFilterClient('全部'); }}>清除篩選</button>
      </div>

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
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-slate-400">無符合條件的文件</td></tr>
            )}
            {filtered.map((d) => (
              <tr key={d.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{EXT_ICONS[d.ext] ?? '📄'}</span>
                    <span className="font-medium text-sm">{d.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{d.category}</td>
                <td className="px-4 py-3 text-sm">{d.client}</td>
                <td className="px-4 py-3">
                  {d.caseId
                    ? <Link href={`/cases/${d.caseId}`} className="font-mono text-sm text-blue-600 hover:underline">{d.caseId}</Link>
                    : <span className="text-slate-400 text-sm">—</span>
                  }
                </td>
                <td className="px-4 py-3 text-sm">{d.uploader}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{d.size}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{d.uploadedAt}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="rounded bg-slate-200 px-3 py-2 text-sm hover:bg-slate-300">預覽</button>
                    <button className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">下載</button>
                    <button className="rounded bg-red-100 px-3 py-2 text-sm text-red-600 hover:bg-red-200">刪除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t bg-slate-50 px-4 py-3 text-sm text-slate-500">
          顯示 {filtered.length} / {documents.length} 筆文件
        </div>
      </div>
    </main>
  );
}
