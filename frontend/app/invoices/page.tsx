'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Invoice {
  id: string; invoiceNo: string; invoiceDate: string;
  sellerName: string; amount: string;
}

const MONTHS = Array.from({ length: 3 }, (_, i) => {
  const d = new Date(); d.setMonth(d.getMonth() - i);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
});

export default function InvoicesPage() {
  const { apiFetch } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [carrier, setCarrier] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [syncCount, setSyncCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(MONTHS[0]);

  async function load() {
    const res = await apiFetch(`/invoices?month=${month}`);
    const json = await res.json();
    setInvoices(json.data ?? []);
  }

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [month]);

  async function sync() {
    setSyncing(true); setSyncDone(false);
    try {
      const prevCount = invoices.length;
      await apiFetch(`/invoices/sync?carrier=${encodeURIComponent(carrier)}`, { method: 'POST' });
      await load();
      setSyncCount(invoices.length - prevCount);
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 3500);
    } finally { setSyncing(false); }
  }

  const total = invoices.reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div style={{ minHeight: '100dvh', background: '#f4f6fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #f59e0b 0%, #f43f5e 100%)', padding: '56px 20px 24px' }}>
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>電子發票</div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 18 }}>
          {invoices.length} 張 · NT$ {total.toLocaleString()}
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {MONTHS.map(m => (
            <button key={m} onClick={() => setMonth(m)} style={{
              flexShrink: 0, padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: m === month ? '#fff' : 'rgba(255,255,255,0.22)',
              color: m === month ? '#f43f5e' : '#fff',
              fontSize: 13, fontWeight: m === month ? 700 : 500,
            }}>{m.slice(5)}月</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 32px' }}>
        {/* Sync card */}
        <div style={{
          background: '#fff', borderRadius: 18, padding: '16px',
          boxShadow: '0 2px 12px rgba(15,23,42,0.06)', marginBottom: 16,
        }}>
          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>手機條碼載具</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={carrier} onChange={e => setCarrier(e.target.value)}
              placeholder="/XXXXXXX"
              style={{
                flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 12,
                padding: '11px 14px', fontSize: 14, outline: 'none', color: '#1e1b4b',
                boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = '#f43f5e')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
            <button onClick={sync} disabled={syncing} style={{
              background: syncing ? '#fecdd3' : 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
              border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700,
              fontSize: 14, padding: '11px 20px', cursor: syncing ? 'not-allowed' : 'pointer',
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: syncing ? 'none' : '0 4px 12px rgba(244,63,94,0.35)',
            }}>
              {syncing ? (
                <>
                  <span style={{ display: 'inline-block', width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  同步中
                </>
              ) : '同步'}
            </button>
          </div>
          {syncDone && (
            <div style={{ marginTop: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', color: '#059669', fontSize: 13, fontWeight: 600 }}>
              ✓ 同步完成{syncCount > 0 ? `，新增 ${syncCount} 張發票` : '，已是最新'}
            </div>
          )}
        </div>

        {/* Invoice list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid rgba(244,63,94,0.15)', borderTopColor: '#f43f5e', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '72px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🧾</div>
            <div style={{ color: '#1e1b4b', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>還沒有發票</div>
            <div style={{ color: '#94a3b8', fontSize: 13 }}>填入載具條碼，點同步就會出現</div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
            {invoices.map((inv, i) => (
              <div key={inv.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                borderBottom: i < invoices.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 13, background: '#fff7ed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>🧾</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {inv.sellerName}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                    {inv.invoiceNo} · {new Date(inv.invoiceDate).toLocaleDateString('zh-TW')}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#f43f5e', flexShrink: 0 }}>
                  NT$ {Number(inv.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
