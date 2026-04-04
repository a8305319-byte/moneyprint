'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Match {
  id: string;
  confidence: number;
  items: Array<{
    bankTx?: { merchant: string; txDate: string; amount: string; direction: string };
    invoice?: { sellerName: string; invoiceDate: string; amount: string };
  }>;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [running, setRunning] = useState(false);

  async function load() {
    const res = await fetch(`${API}/matches/pending`);
    const json = await res.json();
    setMatches(json.data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function autoMatch() {
    setRunning(true);
    await fetch(`${API}/matches/auto`, { method: 'POST' });
    await load();
    setRunning(false);
  }

  async function confirm(id: string) {
    await fetch(`${API}/matches/${id}/confirm`, { method: 'POST' });
    setMatches(m => m.filter(x => x.id !== id));
  }

  async function reject(id: string) {
    await fetch(`${API}/matches/${id}/reject`, { method: 'POST' });
    setMatches(m => m.filter(x => x.id !== id));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">配對</h1>
        <button onClick={autoMatch} disabled={running}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg">
          {running ? '比對中...' : '自動比對'}
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">✅</div>
          <div className="text-lg font-medium">沒有待配對項目</div>
          <div className="text-sm mt-1">點擊「自動比對」開始</div>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map(m => {
            const bankItem = m.items.find(i => i.bankTx);
            const invItem = m.items.find(i => i.invoice);
            return (
              <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-xs text-blue-500 font-semibold mb-1">銀行交易</div>
                      <div className="text-sm font-medium text-gray-800">{bankItem?.bankTx?.merchant ?? '-'}</div>
                      <div className="text-xs text-gray-400">{bankItem?.bankTx?.txDate ? new Date(bankItem.bankTx.txDate).toLocaleDateString('zh-TW') : ''}</div>
                      <div className="text-base font-bold text-blue-700 mt-1">NT$ {Number(bankItem?.bankTx?.amount ?? 0).toLocaleString()}</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <div className="text-xs text-amber-500 font-semibold mb-1">電子發票</div>
                      <div className="text-sm font-medium text-gray-800">{invItem?.invoice?.sellerName ?? '-'}</div>
                      <div className="text-xs text-gray-400">{invItem?.invoice?.invoiceDate ? new Date(invItem.invoice.invoiceDate).toLocaleDateString('zh-TW') : ''}</div>
                      <div className="text-base font-bold text-amber-700 mt-1">NT$ {Number(invItem?.invoice?.amount ?? 0).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 min-w-[90px]">
                    <div className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                      m.confidence >= 0.8 ? 'bg-green-100 text-green-700' :
                      m.confidence >= 0.5 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-600'}`}>
                      {(m.confidence * 100).toFixed(0)}% 吻合
                    </div>
                    <button onClick={() => confirm(m.id)}
                      className="w-full text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg">確認</button>
                    <button onClick={() => reject(m.id)}
                      className="w-full text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg">拒絕</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
