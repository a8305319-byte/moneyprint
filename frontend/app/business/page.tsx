'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { useAuthGuard } from '../hooks/useAuthGuard';

const thisMonth = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };

export default function BusinessDashboard() {
  useAuthGuard({ requireBusiness: true });
  const { user, apiFetch } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const month = thisMonth();

  useEffect(() => {
    apiFetch(`/business-invoices/summary?month=${month}`)
      .then(r => r.json()).then(d => setSummary(d.data))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => `NT$ ${Math.abs(n ?? 0).toLocaleString()}`;
  const netTax = summary?.netTax ?? 0;

  return (
    <div style={{ minHeight: '100dvh', background: '#f4f6fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #5b5fc7 100%)', padding: '56px 24px 72px' }}>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 2 }}>
          {user?.companyName ?? user?.name}
          {user?.taxId && <span style={{ marginLeft: 8 }}>統編 {user.taxId}</span>}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 }}>{month.replace('-', ' 年 ')} 月</div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 2 }}>應納稅額</div>
        <div style={{
          fontSize: 40, fontWeight: 800, letterSpacing: '-1.5px',
          color: netTax > 0 ? '#fca5a5' : netTax < 0 ? '#6ee7b7' : '#fff',
        }}>
          {fmt(netTax)}
        </div>
        {netTax !== 0 && (
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 }}>
            {netTax > 0 ? '需繳納' : '可退稅或留抵'}
          </div>
        )}
      </div>

      <div style={{ padding: '0 16px 32px', marginTop: -44 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid rgba(91,95,199,0.15)', borderTopColor: '#5b5fc7', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              {[
                { label: '收到的發票', count: summary?.received?.count ?? 0, amount: summary?.received?.amount ?? 0, color: '#10b981', bg: '#f0fdf4', icon: '↓' },
                { label: '開出的發票', count: summary?.issued?.count ?? 0, amount: summary?.issued?.amount ?? 0, color: '#f43f5e', bg: '#fff1f2', icon: '↑' },
              ].map(c => (
                <div key={c.label} style={{ background: '#fff', borderRadius: 20, padding: '18px', boxShadow: '0 2px 12px rgba(15,23,42,0.07)' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 12, background: c.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, color: c.color, fontWeight: 700, marginBottom: 10,
                  }}>{c.icon}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>{c.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1e1b4b' }}>{c.count} 張</div>
                  <div style={{ fontSize: 13, color: c.color, fontWeight: 600, marginTop: 2 }}>NT$ {c.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>

            {/* Tax breakdown */}
            <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(15,23,42,0.07)', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1e1b4b' }}>本月稅務</div>
                <Link href="/business/reports" style={{ fontSize: 13, color: '#5b5fc7', textDecoration: 'none', fontWeight: 600 }}>詳細報表</Link>
              </div>
              {[
                { label: '銷項未稅', value: fmt(summary?.issued?.untaxedAmount ?? 0) },
                { label: '銷項稅額', value: fmt(summary?.issued?.taxAmount ?? 0) },
                { label: '進項未稅', value: fmt(summary?.received?.untaxedAmount ?? 0) },
                { label: '進項稅額', value: fmt(summary?.received?.taxAmount ?? 0) },
                { label: '應納營業稅', value: fmt(netTax), bold: true, color: netTax > 0 ? '#f43f5e' : '#10b981' },
                { label: '剩餘可開張數', value: `${summary?.remainingQuota ?? 0} 張` },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>{r.label}</span>
                  <span style={{ fontSize: 13, fontWeight: (r as any).bold ? 800 : 600, color: (r as any).color ?? '#1e1b4b' }}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* Add button */}
            <Link href="/business/add" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)',
              borderRadius: 18, padding: '18px', color: '#fff',
              fontWeight: 700, fontSize: 16, textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(91,95,199,0.4)',
            }}>+ 新增發票</Link>
          </>
        )}
      </div>
    </div>
  );
}
