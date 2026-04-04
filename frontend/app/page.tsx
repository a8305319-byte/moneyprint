'use client';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const COLORS = ['#6c63ff','#48cfad','#ff6b6b','#ffd93d','#4fc3f7','#f78fb3','#a29bfe'];

const thisMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
};

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [recentTxs, setRecentTxs] = useState<any[]>([]);
  const month = thisMonth();

  useEffect(() => {
    Promise.all([
      fetch(`${API}/reports/monthly-summary?month=${month}`).then(r=>r.json()).catch(()=>({data:null})),
      fetch(`${API}/reports/category-breakdown?month=${month}`).then(r=>r.json()).catch(()=>({data:[]})),
      fetch(`${API}/ledger?month=${month}`).then(r=>r.json()).catch(()=>({data:[]})),
    ]).then(([s,b,t]) => {
      setSummary(s.data);
      setBreakdown((b.data ?? []).slice(0,5));
      setRecentTxs((t.data ?? []).slice(0,5));
    });
  }, []);

  const fmt = (n: number) => `NT$ ${Math.abs(n ?? 0).toLocaleString()}`;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--background)' }}>
      {/* Header gradient */}
      <div style={{
        background: 'linear-gradient(135deg, #6c63ff 0%, #48cfad 100%)',
        padding: '52px 24px 80px',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 2 }}>
          {month.replace('-','年')}月支出
        </div>
        <div style={{ color: '#fff', fontSize: 38, fontWeight: 800, letterSpacing: -1 }}>
          {fmt(summary?.totalExpense ?? 0)}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 8 }}>
          收入 {fmt(summary?.totalIncome ?? 0)}
          &nbsp;·&nbsp;
          淨 <span style={{ color: (summary?.netFlow ?? 0) >= 0 ? '#b8f7e0' : '#ffb3b3', fontWeight: 700 }}>
            {(summary?.netFlow ?? 0) >= 0 ? '+' : ''}{fmt(summary?.netFlow ?? 0)}
          </span>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: -52 }}>
        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[
            { label: '交易筆數', value: `${summary?.txCount ?? 0} 筆`, icon: '🧾' },
            { label: '日均支出', value: fmt((summary?.totalExpense ?? 0) / (new Date().getDate() || 1)), icon: '📅' },
          ].map(c => (
            <div key={c.label} style={{
              background: '#fff', borderRadius: 20, padding: '18px',
              boxShadow: '0 4px 24px rgba(108,99,255,0.10)',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>{c.value}</div>
              <div style={{ fontSize: 12, color: '#8892a4', marginTop: 3 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Category pie */}
        {breakdown.length > 0 && (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '20px',
            boxShadow: '0 4px 24px rgba(108,99,255,0.08)', marginBottom: 16,
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', marginBottom: 16 }}>💡 支出類別</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={breakdown} dataKey="totalAmount" cx="50%" cy="50%"
                    innerRadius={35} outerRadius={55} paddingAngle={3} startAngle={90} endAngle={-270}>
                    {breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`NT$ ${Number(v).toLocaleString()}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {breakdown.map((b, i) => (
                  <div key={b.categoryName} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 13, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.categoryName}</div>
                    <div style={{ fontSize: 12, color: '#8892a4', flexShrink: 0 }}>{b.percentage?.toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent transactions */}
        <div style={{
          background: '#fff', borderRadius: 20, padding: '20px',
          boxShadow: '0 4px 24px rgba(108,99,255,0.08)', marginBottom: 24,
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', marginBottom: 12 }}>🕐 最近交易</div>
          {recentTxs.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#8892a4', fontSize: 13, padding: '20px 0' }}>
              尚無資料 — 請先匯入銀行對帳單
            </div>
          ) : recentTxs.map((tx, i) => (
            <div key={tx.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0',
              borderBottom: i < recentTxs.length-1 ? '1px solid #f0f2f8' : 'none',
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                background: tx.direction === 'DEBIT' ? '#fff0f0' : '#f0fff8',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>
                {tx.direction === 'DEBIT' ? '💸' : '💰'}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tx.description}
                </div>
                <div style={{ fontSize: 12, color: '#8892a4', marginTop: 2 }}>
                  {new Date(tx.txDate).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}
                  {tx.category && <span style={{ marginLeft: 6, color: '#6c63ff', fontWeight: 600 }}>{tx.category.name}</span>}
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: tx.direction === 'DEBIT' ? '#ff6b6b' : '#26de81', flexShrink: 0 }}>
                {tx.direction === 'DEBIT' ? '-' : '+'}NT$ {Number(tx.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
