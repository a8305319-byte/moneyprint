'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#5b5fc7', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#8b5cf6'];

const thisMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const MONTH_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const d = new Date(); d.setMonth(d.getMonth() - i);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
});

function Spinner({ color = '#5b5fc7' }: { color?: string }) {
  return (
    <>
      <style>{`@keyframes _spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{
        display: 'inline-block', width: 18, height: 18,
        border: `2.5px solid rgba(0,0,0,0.08)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: '_spin 0.7s linear infinite',
      }} />
    </>
  );
}

export default function AppPage() {
  const { apiFetch, user } = useAuth();
  const router = useRouter();
  const [month, setMonth] = useState(thisMonth());
  const [summary, setSummary] = useState<any>(null);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [recentTxs, setRecentTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch(`/reports/monthly-summary?month=${month}`).then(r => r.json()).catch(() => ({ data: null })),
      apiFetch(`/reports/category-breakdown?month=${month}`).then(r => r.json()).catch(() => ({ data: [] })),
      apiFetch(`/ledger?month=${month}`).then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([s, b, t]) => {
      setSummary(s.data);
      setBreakdown((b.data ?? []).slice(0, 5));
      setRecentTxs((t.data ?? []).slice(0, 8));
    }).finally(() => setLoading(false));
  }, [month]);

  const hasData = recentTxs.length > 0;
  const fmt = (n: number) => `NT$ ${Math.abs(n ?? 0).toLocaleString()}`;
  const monthLabel = `${month.slice(0, 4)} 年 ${Number(month.slice(5))} 月`;

  return (
    <div style={{
      minHeight: '100dvh', background: '#f4f6fb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <style>{`@keyframes _spin { to { transform: rotate(360deg); } }`}</style>

      {/* ─── Header ─── */}
      <div style={{
        background: 'linear-gradient(160deg, #1e1b4b 0%, #5b5fc7 100%)',
        padding: '52px 20px 68px',
      }}>
        {/* Month selector */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 20 }}>
          {MONTH_OPTIONS.map(m => (
            <button key={m} onClick={() => setMonth(m)} style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: m === month ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.12)',
              color: m === month ? '#5b5fc7' : 'rgba(255,255,255,0.7)',
              fontSize: 12, fontWeight: m === month ? 700 : 500,
            }}>{m.slice(5)}月</button>
          ))}
        </div>

        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>{monthLabel} 支出</div>
        <div style={{
          color: '#fff', fontSize: 42, fontWeight: 800,
          letterSpacing: '-1.5px', lineHeight: 1,
        }}>
          {loading ? '—' : fmt(summary?.totalExpense ?? 0)}
        </div>
        {!loading && summary && (
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              收入 <span style={{ color: '#6ee7b7', fontWeight: 600 }}>{fmt(summary.totalIncome)}</span>
            </span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              淨 <span style={{
                color: (summary.netFlow ?? 0) >= 0 ? '#6ee7b7' : '#fca5a5',
                fontWeight: 600,
              }}>{(summary.netFlow ?? 0) >= 0 ? '+' : ''}{fmt(summary.netFlow)}</span>
            </span>
          </div>
        )}
      </div>

      {/* ─── Content ─── */}
      <div style={{ padding: '0 16px 32px', marginTop: -44 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '3px solid rgba(91,95,199,0.15)', borderTopColor: '#5b5fc7',
              animation: '_spin 0.7s linear infinite',
            }} />
          </div>
        ) : !hasData ? (
          /* ── Empty state: guide to import ── */
          <div style={{
            background: '#fff', borderRadius: 20, padding: '32px 20px',
            boxShadow: '0 2px 16px rgba(15,23,42,0.07)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
            <div style={{ color: '#1e1b4b', fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
              還沒有資料
            </div>
            <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 24, lineHeight: 1.7 }}>
              從網路銀行匯出對帳單<br />上傳後立刻看到所有記錄
            </div>
            <button
              onClick={() => router.push('/accounts')}
              style={{
                background: 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)',
                border: 'none', borderRadius: 14, color: '#fff',
                fontWeight: 700, fontSize: 15, padding: '14px 32px',
                cursor: 'pointer', boxShadow: '0 6px 20px rgba(91,95,199,0.35)',
              }}
            >
              匯入對帳單
            </button>
          </div>
        ) : (
          <>
            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              {[
                { label: '交易筆數', value: `${summary?.txCount ?? 0} 筆` },
                { label: '日均支出', value: `NT$ ${Math.round((summary?.totalExpense ?? 0) / new Date().getDate()).toLocaleString()}` },
              ].map(c => (
                <div key={c.label} style={{
                  background: '#fff', borderRadius: 18, padding: '18px 16px',
                  boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
                }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1e1b4b', letterSpacing: '-0.5px' }}>{c.value}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* Category breakdown */}
            {breakdown.length > 0 && (
              <div style={{
                background: '#fff', borderRadius: 20, padding: '20px',
                boxShadow: '0 2px 12px rgba(15,23,42,0.06)', marginBottom: 14,
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1e1b4b', marginBottom: 14 }}>支出分類</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ flexShrink: 0 }}>
                    <ResponsiveContainer width={96} height={96}>
                      <PieChart>
                        <Pie data={breakdown} dataKey="totalAmount" cx="50%" cy="50%"
                          innerRadius={28} outerRadius={46} paddingAngle={3} strokeWidth={0}>
                          {breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => `NT$ ${Number(v).toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {breakdown.map((b, i) => (
                      <div key={b.categoryName} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: 12, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.categoryName}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{b.percentage?.toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent transactions */}
            <div style={{
              background: '#fff', borderRadius: 20, padding: '20px',
              boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1e1b4b', marginBottom: 14 }}>最近記錄</div>
              {recentTxs.map((tx, i) => (
                <div key={tx.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
                  borderBottom: i < recentTxs.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                    background: tx.direction === 'DEBIT' ? '#fff1f2' : '#f0fdf4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  }}>
                    {tx.category?.icon ?? (tx.direction === 'DEBIT' ? '↑' : '↓')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.description}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      {new Date(tx.txDate).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}
                      {tx.category && <span style={{ marginLeft: 6, color: '#5b5fc7', fontWeight: 600 }}>{tx.category.name}</span>}
                    </div>
                  </div>
                  <div style={{
                    fontWeight: 700, fontSize: 13,
                    color: tx.direction === 'DEBIT' ? '#f43f5e' : '#10b981',
                    flexShrink: 0,
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
