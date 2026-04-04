'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Invoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  sellerName: string;
  amount: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [carrier, setCarrier] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  async function load() {
    const res = await fetch(`${API}/invoices?month=${month}`);
    const json = await res.json();
    setInvoices(json.data ?? []);
  }

  useEffect(() => { load(); }, [month]);

  async function sync() {
    setSyncing(true);
    await fetch(`${API}/invoices/sync?carrier=${encodeURIComponent(carrier)}`, { method: 'POST' });
    setTimeout(() => { load(); setSyncing(false); }, 2000);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">電子發票</h1>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex gap-3">
        <input value={carrier} onChange={e => setCarrier(e.target.value)}
          placeholder="載具號碼（手機條碼）"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <button onClick={sync} disabled={syncing}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg">
          {syncing ? '同步中...' : '同步發票'}
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🧾</div>
          <div>本月尚無發票資料</div>
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map(inv => (
            <div key={inv.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-gray-800">{inv.sellerName}</div>
                <div className="text-xs text-gray-400">{inv.invoiceNo} · {new Date(inv.invoiceDate).toLocaleDateString('zh-TW')}</div>
              </div>
              <div className="font-bold text-red-500">-NT$ {Number(inv.amount).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
