'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

interface Invoice {
  id: string; invoiceNo: string; invoiceDate: string;
  sellerName: string; amount: string;
}

const MONTHS = Array.from({ length: 3 }, (_, i) => {
  const d = new Date(); d.setMonth(d.getMonth() - i);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
});

export default function InvoicesPage() {
  const { apiFetch } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [carrier, setCarrier] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [month, setMonth] = useState(MONTHS[0]);

  async function load() {
    const res = await apiFetch(`/invoices?month=${month}`);
    const json = await res.json();
    setInvoices(json.data ?? []);
  }

  useEffect(() => { load(); }, [month]);

  async function sync() {
    setSyncing(true);
    try {
      await apiFetch(`/invoices/sync?carrier=${encodeURIComponent(carrier)}`, { method: 'POST' });
      await load();
    } finally {
      setSyncing(false);
    }
  }

  const total = invoices.reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div style={{ minHeight: '100dvh', background: '#f5f6fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%)', padding: '52px 20px 28px' }}>
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: '-0.3px', marginBottom: 4 }}>電子發票</div>
        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
          {invoices.length} 張 · 共 NT$ {total.toLocaleString()}
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {MONTHS.map(m => (
            <button key={m} onClick={() => setMonth(m)} style={{
              flexShrink: 0, padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: m === month ? '#fff' : 'rgba(255,255,255,0.22)',
              color: m === month ? '#ff6b6b' : '#fff',
              fontSize: 13, fontWeight: m === month ? 700 : 500,
            }}>{m.slice(5)}月</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 32px' }}>
        {/* Sync card */}
        <div style={{
          background: '#fff', borderRadius: 20, padding: '14px 16px',
          boxShadow: '0 2px 16px rgba(108,99,255,0.08)', marginBottom: 16,
          display: 'flex', gap: 10, alignItems: 'center',
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              value={carrier} onChange={e => setCarrier(e.target.value)}
              placeholder="手機條碼（/XXXXXXX）"
              style={{
                width: '100%', border: '1.5px solid #e8ecf4', borderRadius: 12,
                padding: '11px 14px', fontSize: 14, outline: 'none', color: '#1a1a2e',
                boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = '#ff6b6b')}
              onBlur={e => (e.target.style.borderColor = '#e8ecf4')}
            />
          </div>
          <button onClick={sync} disabled={syncing} style={{
            background: syncing ? '#ffb3b3' : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
            border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700,
            fontSize: 14, padding: '11px 18px', cursor: syncing ? 'not-allowed' : 'pointer',
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {syncing ? (
              <>
                <span style={{ display: 'inline-block', width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                同步中
              </>
            ) : '同步'}
          </button>
        </div>

        {/* Invoice list */}
        {invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🧾</div>
            <div style={{ color: '#1a1a2e', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>本月尚無發票</div>
            <div style={{ color: '#8892a4', fontSize: 13 }}>輸入手機條碼後點擊同步</div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 20px rgba(108,99,255,0.07)' }}>
            {invoices.map((inv, i) => (
              <div key={inv.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                borderBottom: i < invoices.length - 1 ? '1px solid #f0f2f8' : 'none',
              }}>
                {/* Icon */}
                <div style={{
                  width: 42, height: 42, borderRadius: 13, background: '#fff8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 19, flexShrink: 0,
                }}>🧾</div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {inv.sellerName}
                  </div>
                  <div style={{ fontSize: 11, color: '#8892a4', marginTop: 3 }}>
                    {inv.invoiceNo} · {new Date(inv.invoiceDate).toLocaleDateString('zh-TW')}
                  </div>
                </div>

                {/* Amount */}
                <div style={{ fontWeight: 800, fontSize: 15, color: '#ff6b6b', flexShrink: 0, letterSpacing: '-0.3px' }}>
                  -NT$ {Number(inv.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
