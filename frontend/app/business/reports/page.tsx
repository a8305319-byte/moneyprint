'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const MONTHS = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth()-i); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; });

export default function BusinessReportsPage() {
  const [month, setMonth] = useState(MONTHS[0]);
  const [summary, setSummary] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('mp_token');
    fetch(`${API}/business-invoices/summary?month=${month}`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json()).then(d => setSummary(d.data)).catch(() => {});
  }, [month]);

  async function downloadPdf() {
    setDownloading(true);
    const t = localStorage.getItem('mp_token');
    try {
      const res = await fetch(`${API}/business-invoices/report/pdf?month=${month}`, { headers: { Authorization: `Bearer ${t}` } });
      if (!res.ok) throw new Error('下載失敗');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `錢跡-${month}-發票報表.pdf`;
      a.click(); URL.revokeObjectURL(url);
    } catch (e: any) { alert(e.message); }
    finally { setDownloading(false); }
  }

  const fmt = (n: number) => `NT$ ${Math.abs(n ?? 0).toLocaleString()}`;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--background)' }}>
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #6c63ff 100%)', padding: '48px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>📊 發票報表</div>
          <button onClick={downloadPdf} disabled={downloading} style={{
            background: downloading ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.25)',
            border: 'none', borderRadius: 20, color: '#fff', fontSize: 13, fontWeight: 600,
            padding: '8px 16px', cursor: downloading ? 'not-allowed' : 'pointer',
          }}>{downloading ? '產製中...' : '⬇ PDF 下載'}</button>
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
          {MONTHS.map(m => (
            <button key={m} onClick={() => setMonth(m)} style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: m === month ? '#fff' : 'rgba(255,255,255,0.2)',
              color: m === month ? '#6c63ff' : '#fff', fontSize: 13, fontWeight: m === month ? 700 : 400,
            }}>{m.slice(5)}月</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Net tax highlight */}
        <div style={{ background: 'linear-gradient(135deg, #6c63ff, #a29bfe)', borderRadius: 20, padding: '20px', marginBottom: 16, boxShadow: '0 8px 24px rgba(108,99,255,0.3)' }}>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>應納營業稅</div>
          <div style={{ color: '#fff', fontSize: 36, fontWeight: 800, marginTop: 4 }}>{fmt(summary?.netTax ?? 0)}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 8 }}>
            {(summary?.netTax ?? 0) > 0 ? '需繳稅' : (summary?.netTax ?? 0) < 0 ? '可退稅' : ''}
          </div>
        </div>

        {/* Received */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px', marginBottom: 12, boxShadow: '0 2px 16px rgba(108,99,255,0.07)' }}>
          <div style={{ fontWeight: 700, color: '#26de81', fontSize: 15, marginBottom: 14 }}>📥 進項（收到的發票）</div>
          {[
            ['張數', `${summary?.received?.count ?? 0} 張`],
            ['含稅金額', fmt(summary?.received?.amount ?? 0)],
            ['未稅金額', fmt(summary?.received?.untaxedAmount ?? 0)],
            ['進項稅額', fmt(summary?.received?.taxAmount ?? 0)],
          ].map(([k,v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f2f8' }}>
              <span style={{ fontSize: 13, color: '#8892a4' }}>{k}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Issued */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px', marginBottom: 12, boxShadow: '0 2px 16px rgba(108,99,255,0.07)' }}>
          <div style={{ fontWeight: 700, color: '#ff6b6b', fontSize: 15, marginBottom: 14 }}>📤 銷項（開出的發票）</div>
          {[
            ['張數', `${summary?.issued?.count ?? 0} 張`],
            ['含稅金額', fmt(summary?.issued?.amount ?? 0)],
            ['未稅金額', fmt(summary?.issued?.untaxedAmount ?? 0)],
            ['銷項稅額', fmt(summary?.issued?.taxAmount ?? 0)],
            ['剩餘可開張數', `${summary?.remainingQuota ?? 0} 張`],
          ].map(([k,v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f2f8' }}>
              <span style={{ fontSize: 13, color: '#8892a4' }}>{k}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Tax calc explanation */}
        <div style={{ background: '#fafbff', border: '1px solid #e8ecf4', borderRadius: 16, padding: '14px', marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: '#6c63ff', fontWeight: 700, marginBottom: 6 }}>📌 營業稅計算說明</div>
          <div style={{ fontSize: 12, color: '#8892a4', lineHeight: 1.7 }}>
            應納稅額 = 銷項稅額 − 進項稅額<br />
            正值：需向稅局申報繳納<br />
            負值：可申請留抵或退稅<br />
            一般稅率：5%（含稅金額 × 5/105）
          </div>
        </div>
      </div>
    </div>
  );
}
