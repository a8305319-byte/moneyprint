'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAuthGuard } from '../../hooks/useAuthGuard';

const MONTHS = Array.from({ length: 6 }, (_, i) => {
  const d = new Date(); d.setMonth(d.getMonth() - i);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
});

export default function BusinessReportsPage() {
  useAuthGuard({ requireBusiness: true });
  const { apiFetch, demoMode } = useAuth();
  const reportRef = useRef<HTMLDivElement>(null);
  const [month, setMonth]           = useState(MONTHS[0]);
  const [summary, setSummary]       = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiFetch(`/business-invoices/summary?month=${month}`)
      .then(r => r.json()).then(d => setSummary(d.data))
      .catch(() => {}).finally(() => setLoading(false));
  }, [month]);

  async function downloadPdf() {
    setDownloading(true);
    setDownloadError('');
    try {
      if (demoMode) {
        // 示範模式：用 html2canvas 擷取頁面產生 PDF
        if (!reportRef.current) { setDownloadError('無法擷取頁面內容'); return; }
        const html2canvas = (await import('html2canvas')).default;
        const { jsPDF }   = await import('jspdf');
        const canvas = await html2canvas(reportRef.current, {
          scale: 2, backgroundColor: '#f4f6fb', logging: false, useCORS: true,
        });
        const imgData   = canvas.toDataURL('image/png');
        const pdf       = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfW      = pdf.internal.pageSize.getWidth();
        const pdfH      = pdf.internal.pageSize.getHeight();
        const imgH      = (canvas.height * pdfW) / canvas.width;
        let heightLeft  = imgH;
        let position    = 0;
        pdf.addImage(imgData, 'PNG', 0, position, pdfW, imgH);
        heightLeft -= pdfH;
        while (heightLeft > 0) {
          position -= pdfH;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfW, imgH);
          heightLeft -= pdfH;
        }
        pdf.save(`錢跡-${month}-發票報表.pdf`);
        return;
      }

      // 真實帳號：呼叫後端 API
      const t = localStorage.getItem('mp_token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? ''}/business-invoices/report/pdf?month=${month}`,
        { headers: { Authorization: `Bearer ${t}` } },
      );
      if (!res.ok) throw new Error('下載失敗，請稍後再試');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `錢跡-${month}-發票報表.pdf`;
      a.click(); URL.revokeObjectURL(url);
    } catch (e: any) {
      setDownloadError(e.message ?? '下載失敗，請稍後再試');
    } finally { setDownloading(false); }
  }

  const fmt    = (n: number) => `NT$ ${Math.abs(n ?? 0).toLocaleString()}`;
  const netTax = summary?.netTax ?? 0;

  return (
    <div style={{ minHeight: '100dvh', background: '#f4f6fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #5b5fc7 100%)', padding: '56px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>發票報表</div>
          <button onClick={downloadPdf} disabled={downloading} style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 20, color: '#fff', fontSize: 13, fontWeight: 600,
            padding: '8px 16px', cursor: downloading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {downloading ? (
              <>
                <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                產製中
              </>
            ) : '↓ 下載 PDF'}
          </button>
        </div>
        {downloadError && (
          <div style={{ background: 'rgba(244,63,94,0.25)', border: '1px solid rgba(244,63,94,0.4)', borderRadius: 10, padding: '8px 14px', color: '#fecdd3', fontSize: 12, marginBottom: 10 }}>
            {downloadError}
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {MONTHS.map(m => (
            <button key={m} onClick={() => setMonth(m)} style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: m === month ? '#fff' : 'rgba(255,255,255,0.18)',
              color: m === month ? '#5b5fc7' : '#fff',
              fontSize: 13, fontWeight: m === month ? 700 : 500,
            }}>{m.slice(5)}月</button>
          ))}
        </div>
      </div>

      {/* 可擷取的報表主體 */}
      <div ref={reportRef} style={{ padding: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid rgba(91,95,199,0.15)', borderTopColor: '#5b5fc7', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : (
          <>
            {/* Net tax card */}
            <div style={{
              background: netTax > 0
                ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
                : netTax < 0
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)',
              borderRadius: 20, padding: '24px 20px', marginBottom: 14,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 4 }}>應納營業稅</div>
              <div style={{ color: '#fff', fontSize: 38, fontWeight: 800, letterSpacing: '-1.5px' }}>{fmt(netTax)}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 6 }}>
                {netTax > 0 ? '本期需繳納' : netTax < 0 ? '本期可退稅或留抵' : '本期持平'}
              </div>
            </div>

            {/* Received */}
            <div style={{ background: '#fff', borderRadius: 20, padding: '20px', marginBottom: 12, boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
              <div style={{ fontWeight: 700, color: '#10b981', fontSize: 15, marginBottom: 14 }}>進項（收到的發票）</div>
              {[
                ['張數',    `${summary?.received?.count ?? 0} 張`],
                ['含稅金額', fmt(summary?.received?.amount ?? 0)],
                ['未稅金額', fmt(summary?.received?.untaxedAmount ?? 0)],
                ['進項稅額', fmt(summary?.received?.taxAmount ?? 0)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Issued */}
            <div style={{ background: '#fff', borderRadius: 20, padding: '20px', marginBottom: 12, boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
              <div style={{ fontWeight: 700, color: '#f43f5e', fontSize: 15, marginBottom: 14 }}>銷項（開出的發票）</div>
              {[
                ['張數',        `${summary?.issued?.count ?? 0} 張`],
                ['含稅金額',     fmt(summary?.issued?.amount ?? 0)],
                ['未稅金額',     fmt(summary?.issued?.untaxedAmount ?? 0)],
                ['銷項稅額',     fmt(summary?.issued?.taxAmount ?? 0)],
                ['剩餘可開張數', `${summary?.remainingQuota ?? 0} 張`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Formula note */}
            <div style={{ background: '#eff2ff', borderRadius: 16, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, color: '#5b5fc7', fontWeight: 700, marginBottom: 6 }}>計算說明</div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.8 }}>
                應納稅額 = 銷項稅額 − 進項稅額<br />
                正值需繳納；負值可留抵或申請退稅<br />
                稅率 5%（含稅金額 × 5 ÷ 105）
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
