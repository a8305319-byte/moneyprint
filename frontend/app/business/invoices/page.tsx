'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

const MONTHS = Array.from({ length: 6 }, (_, i) => {
  const d = new Date(); d.setMonth(d.getMonth() - i);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
});

const FORMAT_LABELS: Record<string, string> = {
  ELECTRONIC: '電子發票', PAPER: '紙本', RECEIPT: '收據', CLOUD: '雲端', UNIFORM: '統一發票',
};

export default function BusinessInvoicesPage() {
  const { apiFetch } = useAuth();
  const [tab, setTab] = useState<'RECEIVED' | 'ISSUED'>('RECEIVED');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [month, setMonth] = useState(MONTHS[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/business-invoices?direction=${tab}&month=${month}`)
      .then(r => r.json()).then(d => setInvoices(d.data ?? []))
      .catch(() => setInvoices([])).finally(() => setLoading(false));
  }, [tab, month]);

  const total = invoices.reduce((s, i) => s + Number(i.amount), 0);
  const totalTax = invoices.reduce((s, i) => s + Number(i.taxAmount), 0);

  const accentColor = tab === 'RECEIVED' ? '#10b981' : '#f43f5e';
  const headerGrad = tab === 'RECEIVED'
    ? 'linear-gradient(160deg, #10b981 0%, #059669 100%)'
    : 'linear-gradient(160deg, #f43f5e 0%, #e11d48 100%)';

  return (
    <div style={{ minHeight: '100dvh', background: '#f4f6fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: headerGrad, padding: '56px 20px 24px', transition: 'background 0.3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>發票管理</div>
          <Link href="/business/add" style={{
            background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 20, color: '#fff', fontSize: 13, fontWeight: 600,
            padding: '7px 16px', textDecoration: 'none',
          }}>+ 新增</Link>
        </div>

        {/* Direction tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: 3, marginBottom: 14 }}>
          {([['RECEIVED', '進項（收到）'], ['ISSUED', '銷項（開出）']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)} style={{
              flex: 1, padding: '9px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: tab === v ? '#fff' : 'transparent',
              color: tab === v ? '#1e1b4b' : '#fff',
              fontWeight: tab === v ? 700 : 500, fontSize: 13,
              transition: 'all 0.2s',
            }}>{l}</button>
          ))}
        </div>

        {/* Month selector */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {MONTHS.map(m => (
            <button key={m} onClick={() => setMonth(m)} style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: m === month ? '#fff' : 'rgba(255,255,255,0.2)',
              color: m === month ? '#1e1b4b' : '#fff',
              fontSize: 12, fontWeight: m === month ? 700 : 500,
            }}>{m.slice(5)}月</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Summary bar */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '14px 18px', marginBottom: 14,
          display: 'flex', justifyContent: 'space-around',
          boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
        }}>
          {[
            { label: '張數', value: `${invoices.length} 張` },
            { label: '含稅總額', value: `NT$ ${total.toLocaleString()}` },
            { label: '稅額', value: `NT$ ${totalTax.toLocaleString()}`, color: '#5b5fc7' },
          ].map(c => (
            <div key={c.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>{c.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: (c as any).color ?? '#1e1b4b' }}>{c.value}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid rgba(91,95,199,0.15)', borderTopColor: '#5b5fc7', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
            <div style={{ color: '#64748b', fontSize: 14, fontWeight: 600 }}>本月尚無{tab === 'RECEIVED' ? '進項' : '銷項'}發票</div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
            {invoices.map((inv, i) => (
              <div key={inv.id} style={{
                padding: '14px 16px',
                borderBottom: i < invoices.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e1b4b', marginBottom: 3 }}>{inv.counterpartyName}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      {inv.invoiceNo} · {new Date(inv.invoiceDate).toLocaleDateString('zh-TW')}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                      <span style={{ fontSize: 10, background: '#eff2ff', color: '#5b5fc7', borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>
                        {FORMAT_LABELS[inv.format] ?? inv.format}
                      </span>
                      {inv.counterpartyTaxId && (
                        <span style={{ fontSize: 10, color: '#94a3b8', padding: '2px 0' }}>#{inv.counterpartyTaxId}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: accentColor }}>NT$ {Number(inv.amount).toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>稅 NT$ {Number(inv.taxAmount).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
