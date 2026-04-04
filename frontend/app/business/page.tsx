'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const thisMonth = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; };

export default function BusinessDashboard() {
  const { user, token } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const month = thisMonth();

  useEffect(() => {
    const t = localStorage.getItem('mp_token');
    fetch(`${API}/business-invoices/summary?month=${month}`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json()).then(d => setSummary(d.data)).catch(() => {});
  }, []);

  const fmt = (n: number) => `NT$ ${Math.abs(n ?? 0).toLocaleString()}`;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--background)' }}>
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #6c63ff 100%)', padding: '52px 24px 80px' }}>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{user?.companyName ?? user?.name}</div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 8 }}>統一編號：{user?.taxId ?? '未設定'}</div>
        <div style={{ color: '#fff', fontSize: 13 }}>{month.replace('-','年')}月</div>
        <div style={{ color: '#fff', fontSize: 36, fontWeight: 800, marginTop: 4 }}>
          應納稅額 {fmt(summary?.netTax ?? 0)}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 8 }}>
          銷項稅 {fmt(summary?.issued?.taxAmount ?? 0)} — 進項稅 {fmt(summary?.received?.taxAmount ?? 0)}
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: -52 }}>
        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[
            { label: '收到發票', count: summary?.received?.count ?? 0, amount: summary?.received?.amount ?? 0, color: '#26de81', icon: '📥' },
            { label: '開出發票', count: summary?.issued?.count ?? 0, amount: summary?.issued?.amount ?? 0, color: '#ff6b6b', icon: '📤' },
          ].map(c => (
            <div key={c.label} style={{ background: '#fff', borderRadius: 20, padding: '18px', boxShadow: '0 4px 24px rgba(108,99,255,0.10)' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontSize: 12, color: '#8892a4' }}>{c.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', marginTop: 2 }}>{c.count} 張</div>
              <div style={{ fontSize: 13, color: c.color, fontWeight: 600, marginTop: 2 }}>NT$ {c.amount.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* Quota + Tax card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 4px 24px rgba(108,99,255,0.08)', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>📋 本月統計</div>
            <Link href="/business/reports" style={{ fontSize: 13, color: '#6c63ff', textDecoration: 'none', fontWeight: 600 }}>查看報表 →</Link>
          </div>
          {[
            { label: '銷項未稅金額', value: fmt(summary?.issued?.untaxedAmount ?? 0) },
            { label: '銷項稅額 (5%)', value: fmt(summary?.issued?.taxAmount ?? 0) },
            { label: '進項未稅金額', value: fmt(summary?.received?.untaxedAmount ?? 0) },
            { label: '進項稅額 (5%)', value: fmt(summary?.received?.taxAmount ?? 0) },
            { label: '應納營業稅', value: fmt(summary?.netTax ?? 0), bold: true, color: (summary?.netTax ?? 0) > 0 ? '#ff6b6b' : '#26de81' },
            { label: '剩餘可開發票', value: `${summary?.remainingQuota ?? 0} 張` },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f2f8' }}>
              <span style={{ fontSize: 13, color: '#8892a4' }}>{r.label}</span>
              <span style={{ fontSize: 13, fontWeight: r.bold ? 800 : 600, color: r.color ?? '#1a1a2e' }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* Quick action */}
        <Link href="/business/add" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: 'linear-gradient(135deg, #6c63ff, #48cfad)', borderRadius: 20,
          padding: '18px', color: '#fff', fontWeight: 700, fontSize: 16, textDecoration: 'none',
          boxShadow: '0 8px 24px rgba(108,99,255,0.35)', marginBottom: 24,
        }}>➕ 新增發票</Link>
      </div>
    </div>
  );
}
