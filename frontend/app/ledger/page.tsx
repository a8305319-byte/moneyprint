'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface LedgerTx {
  id: string;
  txDate: string;
  description: string;
  amount: string;
  direction: 'DEBIT' | 'CREDIT';
  status: string;
  category?: { name: string; icon?: string };
}

export default function LedgerPage() {
  const [txs, setTxs] = useState<LedgerTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/ledger?month=${month}`)
      .then(r => r.json())
      .then(d => setTxs(d.data ?? []))
      .catch(() => setTxs([]))
      .finally(() => setLoading(false));
  }, [month]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">帳本</h1>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">載入中...</div>
      ) : txs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-3">📒</div>
          <div>本月尚無資料，請先匯入銀行對帳單</div>
        </div>
      ) : (
        <div className="space-y-2">
          {txs.map(tx => (
            <div key={tx.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-lg">{tx.category?.icon ?? (tx.direction === 'DEBIT' ? '💸' : '💰')}</div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{tx.description}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span>{new Date(tx.txDate).toLocaleDateString('zh-TW')}</span>
                    {tx.category && <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-xs">{tx.category.name}</span>}
                  </div>
                </div>
              </div>
              <div className={`font-bold text-base ${tx.direction === 'DEBIT' ? 'text-red-500' : 'text-green-600'}`}>
                {tx.direction === 'DEBIT' ? '-' : '+'}NT$ {Number(tx.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
