'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#5b5fc7', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#8b5cf6'];

const MONTHS = Array.from({ length: 6 }, (_, i) => {
  const d = new Date(); d.setMonth(d.getMonth() - i);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
});

interface Summary { month: string; totalIncome: number; totalExpense: number; netFlow: number; txCount: number; }
interface Category { categoryName: string; totalAmount: number; txCount: number; percentage: number; }

export default function ReportsPage() {
  useAuthGuard();
  const { apiFetch } = useAuth();
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);

  const [month, setMonth]         = useState(MONTHS[0]);
  const [summary, setSummary]     = useState<Summary | null>(null);
  const [breakdown, setBreakdown] = useState<Category[]>([]);
  const [trend, setTrend]         = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch(`/reports/monthly-summary?month=${month}`).then(r => r.json()).catch(() => ({ data: null })),
      apiFetch(`/reports/category-breakdown?month=${month}`).then(r => r.json()).catch(() => ({ data: [] })),
      apiFetch(`/reports/monthly-trend?months=6`).then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([s, b, t]) => {
      setSummary(s.data);
      setBreakdown(b.data ?? []);
      setTrend((t.data ?? []).slice().reverse().map((x: any) => ({ ...x, label: x.month?.slice(5) + '月' })));
    }).finally(() => setLoading(false));
  }, [month]);

  // ── PDF 下載（client-side：html2canvas + jsPDF）──────────────────────────
  async function downloadPdf() {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF }   = await import('jspdf');
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, backgroundColor: '#f4f6fb', logging: false, useCORS: true,
      });
      const imgData  = canvas.toDataURL('image/png');
      const pdf      = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW     = pdf.internal.pageSize.getWidth();
      const pdfH     = pdf.internal.pageSize.getHeight();
      const imgH     = (canvas.height * pdfW) / canvas.width;
      let heightLeft = imgH;
      let position   = 0;
      pdf.addImage(imgData, 'PNG', 0, position, pdfW, imgH);
      heightLeft -= pdfH;
      while (heightLeft > 0) {
        position -= pdfH;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfW, imgH);
        heightLeft -= pdfH;
      }
      pdf.save(`錢跡-${month}-個人報表.pdf`);
    } catch (e) {
      console.error('[PDF]', e);
    } finally { setDownloading(false); }
  }

  const fmt     = (n: number) => `NT$ ${Math.abs(n ?? 0).toLocaleString()}`;
  const hasData = summary && (summary.totalExpense > 0 || summary.totalIncome > 0);

  return (
    <div style={{ minHeight: '100dvh', background: '#f4f6fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #10b981 0%, #059669 100%)', padding: '56px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>報表</div>
          {/* PDF 下載按鈕 */}
          {hasData && (
            <button onClick={downloadPdf} disabled={downloading} style={{
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: 20, color: '#fff', fontSize: 13, fontWeight: 600,
              padding: '7px 14px', cursor: downloading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {downloading ? (
                <>
                  <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  產製中
                </>
              ) : '↓ PDF'}
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {MONTHS.map(m => (
            <button key={m} onClick={() => setMonth(m)} style={{
              flexShrink: 0, padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: m === month ? '#fff' : 'rgba(255,255,255,0.18)',
              color: m === month ? '#059669' : '#fff',
              fontSize: 13, fontWeight: m === month ? 700 : 500,
            }}>{m.slice(5)}月</button>
          ))}
        </div>
      </div>

      {/* 可擷取的報表主體（PDF 用） */}
      <div ref={reportRef} style={{ padding: '16px 16px 32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid rgba(16,185,129,0.15)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : !hasData ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 22,
              background: 'rgba(16,185,129,0.1)', margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
            }}>📊</div>
            <div style={{ color: '#1e1b4b', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>這個月還沒有資料</div>
            <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6, marginBottom: 28 }}>
              開始記帳，報表就會自動出現
            </div>
            <button
              onClick={() => router.push('/app')}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none', borderRadius: 16, color: '#fff',
                fontWeight: 700, fontSize: 15, padding: '14px 32px', cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(16,185,129,0.35)',
              }}
            >去記帳</button>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            {summary && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  {[
                    { label: '支出', value: summary.totalExpense, color: '#f43f5e' },
                    { label: '收入', value: summary.totalIncome,  color: '#10b981' },
                  ].map(c => (
                    <div key={c.label} style={{ background: '#fff', borderRadius: 18, padding: '18px 16px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>{c.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: c.color, letterSpacing: '-0.5px' }}>{fmt(c.value)}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#fff', borderRadius: 18, padding: '18px 16px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>淨額</div>
                    <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px', color: (summary.netFlow ?? 0) >= 0 ? '#10b981' : '#f43f5e' }}>
                      {(summary.netFlow ?? 0) >= 0 ? '+' : ''}{fmt(summary.netFlow ?? 0)}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{summary.txCount} 筆記錄</div>
                </div>
              </div>
            )}

            {/* 6-month trend */}
            {trend.length > 0 && trend.some(t => t.totalExpense > 0 || t.totalIncome > 0) && (
              <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1e1b4b', marginBottom: 18 }}>近 6 個月趨勢</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={trend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(v: any) => `NT$ ${Number(v).toLocaleString()}`}
                      contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }}
                      cursor={{ fill: 'rgba(91,95,199,0.04)' }}
                    />
                    <Bar dataKey="totalExpense" name="支出" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={20} />
                    <Bar dataKey="totalIncome"  name="收入" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12 }}>
                  {[{ color: '#f43f5e', label: '支出' }, { color: '#10b981', label: '收入' }].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category breakdown */}
            {breakdown.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1e1b4b', marginBottom: 18 }}>支出類別</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div style={{ flexShrink: 0 }}>
                    <ResponsiveContainer width={100} height={100}>
                      <PieChart>
                        <Pie data={breakdown} dataKey="totalAmount" cx="50%" cy="50%" innerRadius={28} outerRadius={48} paddingAngle={3} strokeWidth={0}>
                          {breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {breakdown.slice(0, 5).map((b, i) => (
                      <div key={b.categoryName} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: 12, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{b.categoryName}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0, fontWeight: 600 }}>{b.percentage?.toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
                {breakdown.map((b, i) => (
                  <div key={b.categoryName} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: '#1e1b4b', fontWeight: 500 }}>{b.categoryName}</span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>NT$ {Number(b.totalAmount).toLocaleString()}</span>
                    </div>
                    <div style={{ height: 6, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 4,
                        background: COLORS[i % COLORS.length],
                        width: `${b.percentage}%`,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
