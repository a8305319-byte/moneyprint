'use client';
import { useState, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function AccountsPage() {
  const [accountId, setAccountId] = useState('acc-default');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ importId: string } | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    const form = new FormData();
    form.append('file', file);
    form.append('accountId', accountId);
    try {
      const res = await fetch(`${API}/bank-imports/upload`, { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setResult(json.data);
    } catch (e: any) {
      setError(e.message ?? '上傳失敗');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">銀行匯入</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">帳戶 ID</label>
          <input value={accountId} onChange={e => setAccountId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">選擇 CSV 對帳單</label>
          <input ref={fileRef} type="file" accept=".csv,.xlsx"
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" />
        </div>

        <button onClick={upload} disabled={uploading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm">
          {uploading ? '上傳中...' : '上傳並匯入'}
        </button>

        {error && <div className="text-red-500 text-sm">{error}</div>}
        {result && (
          <div className="bg-green-50 text-green-700 rounded-lg p-3 text-sm">
            匯入任務已建立！Import ID: <code className="font-mono">{result.importId}</code>
          </div>
        )}
      </div>

      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
        <strong>CSV 格式說明：</strong>第一行為欄位名稱，需包含日期、金額、說明等欄位（中英文均可）。
      </div>
    </div>
  );
}
