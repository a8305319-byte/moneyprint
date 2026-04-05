'use client';
import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#5b5fc7', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899'];

const thisMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

function Spinner() {
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '3px solid rgba(91,95,199,0.15)',
        borderTopColor: '#5b5fc7',
        animation: 'spin 0.7s linear infinite',
        margin: '60px auto',
      }} />
    </>
  );
}

export default function Dashboard() {
  const { apiFetch, user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [recentTxs, setRecentTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const month = thisMonth();
  const monthLabel = `${new Date().getFullYear()} 年 ${new Date().getMonth() + 1} 月`;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch(`/reports/monthly-summary?month=${month}`).then(r => r.json()).catch(() => ({ data: null })),
      apiFetch(`/reports/category-breakdown?month=${month}`).then(r => r.json()).catch(() => ({ data: [] })),
      apiFetch(`/ledger?month=${month}`).then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([s, b, t]) => {
      setSummary(s.data);
      setBreakdown((b.data ?? []).slice(0, 5));
      setRecentTxs((t.data ?? []).slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => `NT$ ${Math.abs(n ?? 0).toLocaleString()}`;
  const netColor = (summary?.netFlow ?? 0) >= 0 ? '#10b981' : '#f43f5e';

  return (
    <div style={{ minHeight: '100dvh', background: '#f4f6fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, #5b5fc7 0%, #7c3aed 100%)',
        padding: '56px 24px 72px',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 6 }}>{monthLabel}</div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 2 }}>支出</div>
        <div style={{ color: '#fff', fontSize: 40, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1 }}>
          {fmt(summary?.totalExpense ?? 0)}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
            收入 <span style={{ color: '#6ee7b7', fontWeight: 700 }}>{fmt(summary?.totalIncome ?? 0)}</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>·</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
            淨 <span style={{ color: (summary?.netFlow ?? 0) >= 0 ? '#6ee7b7' : '#fca5a5', fontWeight: 700 }}>
              {(summary?.netFlow ?? 0) >= 0 ? '+' : ''}{fmt(summary?.netFlow ?? 0)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px 32px', marginTop: -44 }}>
        {loading ? <Spinner /> : (
          <>
            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: '交易筆數', value: `${summary?.txCount ?? 0} 筆`, icon: '🧾', color: '#5b5fc7' },
                { label: '日均支出', value: `NT$ ${Math.round((summary?.totalExpense ?? 0) / (new Date().getDate() || 1)).toLocaleString()}`, icon: '📅', color: '#7c3aed' },
              ].map(c => (
                <div key={c.label} style={{
                  background: '#fff', borderRadius: 20, padding: '20px 18px',
                  boxShadow: '0 2px 16px rgba(15,23,42,0.07)',
                }}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{c.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1e1b4b', letterSpacing: '-0.5px' }}>{c.value}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* Category pie */}
            {breakdown.length > 0 && (
              <div style={{
                background: '#fff', borderRadius: 20, padding: '20px',
                boxShadow: '0 2px 16px rgba(15,23,42,0.07)', marginBottom: 16,
              }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1e1b4b', marginBottom: 16 }}>支出分類</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ flexShrink: 0 }}>
                    <ResponsiveContainer width={110} height={110}>
                      <PieChart>
                        <Pie data={breakdown} dataKey="totalAmount" cx="50%" cy="50%"
                          innerRadius={32} outerRadius={52} paddingAngle={3} strokeWidth={0}>
                          {breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => [`NT$ ${Number(v).toLocaleString()}`, '']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {breakdown.map((b, i) => (
                      <div key={b.categoryName} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: 13, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.categoryName}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0, fontWeight: 600 }}>{b.percentage?.toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent transactions */}
            <div style={{
              background: '#fff', borderRadius: 20, padding: '20px',
              boxShadow: '0 2px 16px rgba(15,23,42,0.07)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1e1b4b', marginBottom: 14 }}>最近記錄</div>
              {recentTxs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
                  <div style={{ color: '#64748b', fontSize: 13 }}>本月還沒有記錄</div>
                  <div style={{ color: '#cbd5e1', fontSize: 12, marginTop: 4 }}>到設定頁匯入對帳單</div>
                </div>
              ) : recentTxs.map((tx, i) => (
                <div key={tx.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
                  borderBottom: i < recentTxs.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 13, flexShrink: 0,
                    background: tx.direction === 'DEBIT' ? '#fff1f2' : '#f0fdf4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>
                    {tx.category?.icon ?? (tx.direction === 'DEBIT' ? '↑' : '↓')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.description}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      {new Date(tx.txDate).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}
                      {tx.category && <span style={{ marginLeft: 6, color: '#5b5fc7', fontWeight: 600 }}>{tx.category.name}</span>}
                    </div>
                  </div>
                  <div style={{
                    fontWeight: 700, fontSize: 14,
                    color: tx.direction === 'DEBIT' ? '#f43f5e' : '#10b981',
                    flexShrink: 0, letterSpacing: '-0.3px',
                  }}>
                    {tx.direction === 'DEBIT' ? '-' : '+'}NT$ {Number(tx.amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
