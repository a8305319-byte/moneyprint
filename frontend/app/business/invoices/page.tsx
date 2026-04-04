'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const MONTHS = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth()-i); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; });

export default function BusinessInvoicesPage() {
  const [tab, setTab] = useState<'RECEIVED'|'ISSUED'>('RECEIVED');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [month, setMonth] = useState(MONTHS[0]);

  useEffect(() => {
    const t = localStorage.getItem('mp_token');
    fetch(`${API}/business-invoices?direction=${tab}&month=${month}`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json()).then(d => setInvoices(d.data ?? [])).catch(() => {});
  }, [tab, month]);

  const total = invoices.reduce((s, i) => s + Number(i.amount), 0);
  const totalTax = invoices.reduce((s, i) => s + Number(i.taxAmount), 0);

  const formatTypes: Record<string, string> = {
    ELECTRONIC: '電子發票', PAPER: '紙本', RECEIPT: '收據', CLOUD: '雲端', UNIFORM: '統一發票',
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--background)' }}>
      <div style={{ background: tab === 'RECEIVED' ? 'linear-gradient(135deg, #26de81 0%, #48cfad 100%)' : 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%)', padding: '48px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>發票管理</div>
          <Link href="/business/add" style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 20, color: '#fff', fontSize: 13, fontWeight: 600, padding: '7px 16px', textDecoration: 'none' }}>+ 新增</Link>
        </div>
        {/* Direction tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 3, marginBottom: 12 }}>
          {([['RECEIVED','📥 進項（收到）'],['ISSUED','📤 銷項（開出）']] as const).map(([v,l]) => (
            <button key={v} onClick={() => setTab(v)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer', background: tab === v ? '#fff' : 'transparent', color: tab === v ? '#1a1a2e' : '#fff', fontWeight: tab === v ? 700 : 400, fontSize: 13 }}>{l}</button>
          ))}
        </div>
        {/* Month selector */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
          {MONTHS.map(m => (
            <button key={m} onClick={() => setMonth(m)} style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', background: m === month ? '#fff' : 'rgba(255,255,255,0.2)', color: m === month ? '#1a1a2e' : '#fff', fontSize: 12, fontWeight: m === month ? 700 : 400 }}>{m.slice(5)}月</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Summary */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', marginBottom: 14, display: 'flex', justifyContent: 'space-around', boxShadow: '0 2px 12px rgba(108,99,255,0.07)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#8892a4' }}>張數</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>{invoices.length}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#8892a4' }}>含稅總額</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>NT$ {total.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#8892a4' }}>稅額</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#6c63ff' }}>NT$ {totalTax.toLocaleString()}</div>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48 }}>🧾</div>
            <div style={{ color: '#8892a4', marginTop: 12 }}>本月尚無{tab === 'RECEIVED' ? '進項' : '銷項'}發票</div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 16px rgba(108,99,255,0.07)' }}>
            {invoices.map((inv, i) => (
              <div key={inv.id} style={{ padding: '14px 16px', borderBottom: i < invoices.length-1 ? '1px solid #f0f2f8' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>{inv.counterpartyName}</div>
                    <div style={{ fontSize: 11, color: '#8892a4', marginTop: 3 }}>
                      {inv.invoiceNo} · {new Date(inv.invoiceDate).toLocaleDateString('zh-TW')}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: 10, background: '#f0f0ff', color: '#6c63ff', borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>{formatTypes[inv.format] ?? inv.format}</span>
                      {inv.counterpartyTaxId && <span style={{ fontSize: 10, color: '#8892a4' }}>#{inv.counterpartyTaxId}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: tab === 'RECEIVED' ? '#26de81' : '#ff6b6b' }}>NT$ {Number(inv.amount).toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: '#8892a4', marginTop: 2 }}>稅 NT$ {Number(inv.taxAmount).toLocaleString()}</div>
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
