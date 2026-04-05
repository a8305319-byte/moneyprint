'use client';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#5b5fc7', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#8b5cf6'];

const MONTH_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const d = new Date(); d.setMonth(d.getMonth() - i);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return { value: `${y}-${m}`, label: `${y} 年 ${d.getMonth() + 1} 月` };
});

type Phase = 'idle' | 'loading' | 'done' | 'error';

export default function AppPage() {
  const { apiFetch } = useAuth();
  const router = useRouter();

  const [month, setMonth] = useState(MONTH_OPTIONS[0].value);
  const [phase, setPhase] = useState<Phase>('idle');
  const [summary, setSummary] = useState<any>(null);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [txs, setTxs] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  const selectedLabel = MONTH_OPTIONS.find(o => o.value === month)?.label ?? month;

  async function query() {
    setPhase('loading');
    try {
      const [s, b, t] = await Promise.all([
        apiFetch(`/reports/monthly-summary?month=${month}`).then(r => r.json()),
        apiFetch(`/reports/category-breakdown?month=${month}`).then(r => r.json()),
        apiFetch(`/ledger?month=${month}`).then(r => r.json()),
      ]);
      setSummary(s.data);
      setBreakdown((b.data ?? []).slice(0, 5));
      setTxs((t.data ?? []).slice(0, 10));
      setPhase('done');
    } catch {
      setPhase('error');
    }
  }

  const fmt = (n: number) => `NT$ ${Math.abs(n ?? 0).toLocaleString()}`;
  const hasData = txs.length > 0 || summary;

  function copyResult() {
    if (!summary) return;
    const text = [
      `${selectedLabel} 帳務摘要`,
      `支出：${fmt(summary.totalExpense ?? 0)}`,
      `收入：${fmt(summary.totalIncome ?? 0)}`,
      `淨額：${(summary.netFlow ?? 0) >= 0 ? '+' : ''}${fmt(summary.netFlow ?? 0)}`,
      `共 ${summary.txCount ?? 0} 筆`,
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#f4f6fb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      paddingBottom: 32,
    }}>
      <style>{`@keyframes sp { to { transform: rotate(360deg); } }`}</style>

      {/* ── Header ── */}
      <div style={{
        background: '#1e1b4b',
        padding: '52px 20px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px' }}>
          MoneyPrint
        </div>
        <button onClick={() => router.push('/accounts')} style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10, color: 'rgba(255,255,255,0.5)',
          fontSize: 12, padding: '6px 12px', cursor: 'pointer',
        }}>設定</button>
      </div>

      <div style={{ padding: '20px 16px 0' }}>

        {/* ══ ① INPUT CARD ══ */}
        <div style={{
          background: '#fff', borderRadius: 20, padding: '22px 20px',
          boxShadow: '0 2px 16px rgba(15,23,42,0.07)', marginBottom: 12,
        }}>
          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 12, letterSpacing: '0.3px' }}>
            選擇月份
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {MONTH_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => { setMonth(o.value); setPhase('idle'); }}
                style={{
                  padding: '9px 16px', borderRadius: 12, border: '2px solid',
                  borderColor: month === o.value ? '#5b5fc7' : '#e2e8f0',
                  background: month === o.value ? '#eff2ff' : '#f8fafc',
                  color: month === o.value ? '#5b5fc7' : '#64748b',
                  fontSize: 13, fontWeight: month === o.value ? 700 : 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {o.value.slice(5)}月
              </button>
            ))}
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: '#cbd5e1' }}>
            {selectedLabel}
          </div>
        </div>

        {/* ══ ② ACTION BUTTON ══ */}
        <button
          onClick={query}
          disabled={phase === 'loading'}
          style={{
            width: '100%',
            background: phase === 'loading'
              ? 'rgba(91,95,199,0.5)'
              : 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)',
            border: 'none', borderRadius: 16,
            color: '#fff', fontWeight: 700, fontSize: 17,
            padding: '18px', cursor: phase === 'loading' ? 'default' : 'pointer',
            boxShadow: phase === 'loading' ? 'none' : '0 8px 28px rgba(91,95,199,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            marginBottom: 12, transition: 'all 0.2s',
          }}
        >
          {phase === 'loading' ? (
            <>
              <span style={{
                width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.25)',
                borderTopColor: '#fff', borderRadius: '50%',
                animation: 'sp 0.7s linear infinite', display: 'inline-block',
              }} />
              查詢中
            </>
          ) : '查看帳務'}
        </button>

        {/* ══ ③ RESULT CARD ══ */}
        {phase === 'idle' && (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '32px 20px',
            boxShadow: '0 2px 16px rgba(15,23,42,0.07)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
            <div style={{ color: '#94a3b8', fontSize: 14 }}>選擇月份，點擊「查看帳務」</div>
          </div>
        )}

        {phase === 'error' && (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '24px 20px',
            boxShadow: '0 2px 16px rgba(15,23,42,0.07)',
            border: '1.5px solid #fecdd3',
          }}>
            <div style={{ color: '#e11d48', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
              無法取得資料
            </div>
            <div style={{ color: '#94a3b8', fontSize: 13 }}>
              請確認網路連線，或稍後再試
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Summary numbers */}
            {summary ? (
              <div style={{
                background: '#fff', borderRadius: 20, padding: '22px 20px',
                boxShadow: '0 2px 16px rgba(15,23,42,0.07)',
              }}>
                {/* Success badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: '#f0fdf4', borderRadius: 20, padding: '5px 12px',
                    color: '#059669', fontSize: 12, fontWeight: 700,
                  }}>
                    ✓ 已取得 {selectedLabel} 資料
                  </div>
                  <button
                    onClick={copyResult}
                    style={{
                      background: copied ? '#f0fdf4' : '#f8fafc',
                      border: `1px solid ${copied ? '#bbf7d0' : '#e2e8f0'}`,
                      borderRadius: 10, padding: '5px 12px',
                      color: copied ? '#059669' : '#64748b',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {copied ? '✓ 已複製' : '複製'}
                  </button>
                </div>

                {/* Big number */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>支出</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: '#f43f5e', letterSpacing: '-1px' }}>
                    {fmt(summary.totalExpense ?? 0)}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {[
                    { label: '收入', value: fmt(summary.totalIncome ?? 0), color: '#10b981' },
                    { label: '淨額', value: `${(summary.netFlow ?? 0) >= 0 ? '+' : ''}${fmt(summary.netFlow ?? 0)}`, color: (summary.netFlow ?? 0) >= 0 ? '#10b981' : '#f43f5e' },
                    { label: '筆數', value: `${summary.txCount ?? 0} 筆`, color: '#5b5fc7' },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: '#f8fafc', borderRadius: 12, padding: '12px 10px', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* No data for this month */
              <div style={{
                background: '#fff', borderRadius: 20, padding: '32px 20px',
                boxShadow: '0 2px 16px rgba(15,23,42,0.07)', textAlign: 'center',
              }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>📂</div>
                <div style={{ color: '#1e1b4b', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                  這個月沒有記錄
                </div>
                <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 22 }}>
                  先匯入對帳單，資料就會出現
                </div>
                <button
                  onClick={() => router.push('/accounts')}
                  style={{
                    background: '#5b5fc7', border: 'none', borderRadius: 12,
                    color: '#fff', fontWeight: 700, fontSize: 14,
                    padding: '13px 28px', cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(91,95,199,0.35)',
                  }}
                >
                  匯入對帳單
                </button>
              </div>
            )}

            {/* Category breakdown */}
            {breakdown.length > 0 && (
              <div style={{
                background: '#fff', borderRadius: 20, padding: '20px',
                boxShadow: '0 2px 16px rgba(15,23,42,0.07)',
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1e1b4b', marginBottom: 14 }}>支出分類</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <ResponsiveContainer width={88} height={88}>
                    <PieChart>
                      <Pie data={breakdown} dataKey="totalAmount" cx="50%" cy="50%"
                        innerRadius={25} outerRadius={42} paddingAngle={3} strokeWidth={0}>
                        {breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => `NT$ ${Number(v).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {breakdown.map((b, i) => (
                      <div key={b.categoryName} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: 12, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.categoryName}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{b.percentage?.toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Transactions */}
            {txs.length > 0 && (
              <div style={{
                background: '#fff', borderRadius: 20, padding: '20px',
                boxShadow: '0 2px 16px rgba(15,23,42,0.07)',
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1e1b4b', marginBottom: 14 }}>明細</div>
                {txs.map((tx, i) => (
                  <div key={tx.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 0',
                    borderBottom: i < txs.length - 1 ? '1px solid #f1f5f9' : 'none',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                      background: tx.direction === 'DEBIT' ? '#fff1f2' : '#f0fdf4',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
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
                      color: tx.direction === 'DEBIT' ? '#f43f5e' : '#10b981', flexShrink: 0,
                    }}>
                      {tx.direction === 'DEBIT' ? '-' : '+'}NT$ {Number(tx.amount).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
