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
  const { apiFetch, demoMode } = useAuth();
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
      <style>{`
        @keyframes sp { to { transform: rotate(360deg); } }
        .month-chip:active { transform: scale(0.94); }
        .primary-btn:not(:disabled):active { transform: scale(0.98); }
        .next-btn:hover { border-color: #5b5fc7 !important; background: #f0f2ff !important; color: #5b5fc7 !important; }
        .next-btn:active { transform: scale(0.97); }
        .copy-btn:hover { opacity: 0.85; }
        .settings-btn:hover { background: rgba(255,255,255,0.14) !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        background: '#1e1b4b',
        padding: '52px 20px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px' }}>
          MoneyPrint
        </div>
        <button
          onClick={() => router.push(demoMode ? '/login' : '/accounts')}
          style={{
            background: demoMode ? 'rgba(91,95,199,0.55)' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${demoMode ? 'rgba(91,95,199,0.5)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 10, color: '#fff',
            fontSize: 12, fontWeight: demoMode ? 700 : 400,
            padding: '6px 14px', cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >{demoMode ? '建立帳號' : '設定'}</button>
      </div>

      <div style={{ padding: '20px 16px 0' }}>

        {/* ══ ① INPUT CARD ══ */}
        <div style={{
          background: '#fff', borderRadius: 20, padding: '22px 20px',
          boxShadow: '0 2px 16px rgba(15,23,42,0.07)', marginBottom: 12,
        }}>
          <div style={{
            fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 14,
            letterSpacing: '0.8px', textTransform: 'uppercase',
          }}>
            選擇月份
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {MONTH_OPTIONS.map(o => (
              <button
                key={o.value}
                className="month-chip"
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
          <div style={{ marginTop: 12, fontSize: 12, color: '#cbd5e1', fontWeight: 500 }}>
            {selectedLabel}
          </div>
        </div>

        {/* ══ ② ACTION BUTTON ══ */}
        <button
          className="primary-btn"
          onClick={query}
          disabled={phase === 'loading'}
          style={{
            width: '100%',
            background: phase === 'loading'
              ? 'rgba(91,95,199,0.45)'
              : 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)',
            border: 'none', borderRadius: 16,
            color: '#fff', fontWeight: 700, fontSize: 17,
            padding: '18px', cursor: phase === 'loading' ? 'default' : 'pointer',
            boxShadow: phase === 'loading' ? 'none' : '0 8px 28px rgba(91,95,199,0.38)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            marginBottom: 12, transition: 'all 0.2s',
          }}
        >
          {phase === 'loading' ? (
            <>
              <span style={{
                width: 16, height: 16,
                border: '2.5px solid rgba(255,255,255,0.25)',
                borderTopColor: '#fff', borderRadius: '50%',
                animation: 'sp 0.7s linear infinite',
                display: 'inline-block',
              }} />
              正在取得資料…
            </>
          ) : '查看帳務'}
        </button>

        {/* ══ ③ RESULT AREA ══ */}

        {/* — Idle — */}
        {phase === 'idle' && (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '40px 24px',
            boxShadow: '0 2px 16px rgba(15,23,42,0.07)', textAlign: 'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: '#f0f2ff', margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
            }}>📊</div>
            <div style={{ color: '#1e1b4b', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
              選好月份，點一下
            </div>
            <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>
              帳務摘要、支出分類與明細<br />一次全部呈現
            </div>
          </div>
        )}

        {/* — Error — */}
        {phase === 'error' && (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '28px 20px',
            boxShadow: '0 2px 16px rgba(15,23,42,0.07)',
            border: '1.5px solid #fecdd3',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: '#fff1f2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, marginBottom: 14,
            }}>⚠</div>
            <div style={{ color: '#e11d48', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
              取得資料失敗
            </div>
            <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.7 }}>
              網路可能不穩定，請確認後<br />
              再點上方按鈕重試一次
            </div>
          </div>
        )}

        {/* — Done — */}
        {phase === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {summary ? (
              <>
                {/* Summary */}
                <div style={{
                  background: '#fff', borderRadius: 20, padding: '22px 20px',
                  boxShadow: '0 2px 16px rgba(15,23,42,0.07)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: '#f0fdf4', borderRadius: 20, padding: '5px 12px',
                      color: '#059669', fontSize: 12, fontWeight: 700,
                    }}>
                      ✓ {selectedLabel} 已整理完成
                    </div>
                    <button
                      className="copy-btn"
                      onClick={copyResult}
                      style={{
                        background: copied ? '#f0fdf4' : '#f8fafc',
                        border: `1.5px solid ${copied ? '#bbf7d0' : '#e2e8f0'}`,
                        borderRadius: 10, padding: '6px 14px',
                        color: copied ? '#059669' : '#64748b',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {copied ? '✓ 已複製' : '複製摘要'}
                    </button>
                  </div>

                  {/* Big expense number */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 6, letterSpacing: '0.3px' }}>本月支出</div>
                    <div style={{ fontSize: 38, fontWeight: 800, color: '#f43f5e', letterSpacing: '-1.5px', lineHeight: 1 }}>
                      {fmt(summary.totalExpense ?? 0)}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    {[
                      { label: '收入', value: fmt(summary.totalIncome ?? 0), color: '#10b981' },
                      { label: '淨額', value: `${(summary.netFlow ?? 0) >= 0 ? '+' : ''}${fmt(summary.netFlow ?? 0)}`, color: (summary.netFlow ?? 0) >= 0 ? '#10b981' : '#f43f5e' },
                      { label: '筆數', value: `${summary.txCount ?? 0} 筆`, color: '#5b5fc7' },
                    ].map(s => (
                      <div key={s.label} style={{
                        background: '#f8fafc', borderRadius: 14, padding: '13px 10px', textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 5, fontWeight: 500 }}>{s.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: s.color, letterSpacing: '-0.2px' }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breakdown */}
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
                            <div style={{ flex: 1, fontSize: 12, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{b.categoryName}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{b.percentage?.toFixed(0)}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent transactions */}
                {txs.length > 0 && (
                  <div style={{
                    background: '#fff', borderRadius: 20, padding: '20px',
                    boxShadow: '0 2px 16px rgba(15,23,42,0.07)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1e1b4b' }}>最近明細</div>
                      <button
                        onClick={() => router.push('/ledger')}
                        style={{
                          background: 'none', border: 'none', color: '#5b5fc7',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0,
                        }}
                      >查看全部 →</button>
                    </div>
                    {txs.map((tx, i) => (
                      <div key={tx.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '11px 0',
                        borderBottom: i < txs.length - 1 ? '1px solid #f1f5f9' : 'none',
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
                          color: tx.direction === 'DEBIT' ? '#f43f5e' : '#10b981', flexShrink: 0,
                        }}>
                          {tx.direction === 'DEBIT' ? '-' : '+'}NT$ {Number(tx.amount).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Next steps */}
                <div style={{
                  background: '#fff', borderRadius: 20, padding: '20px',
                  boxShadow: '0 2px 16px rgba(15,23,42,0.07)',
                }}>
                  <div style={{
                    fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 14,
                    letterSpacing: '0.8px', textTransform: 'uppercase',
                  }}>下一步</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button
                      className="next-btn"
                      onClick={() => router.push('/ledger')}
                      style={{
                        background: '#f8fafc', border: '1.5px solid #e2e8f0',
                        borderRadius: 14, padding: '16px 14px',
                        color: '#1e1b4b', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 8 }}>≡</div>
                      查看完整帳本
                    </button>
                    <button
                      className="next-btn"
                      onClick={() => router.push('/reports')}
                      style={{
                        background: '#f8fafc', border: '1.5px solid #e2e8f0',
                        borderRadius: 14, padding: '16px 14px',
                        color: '#1e1b4b', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 8 }}>↗</div>
                      查看分析報表
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* No data this month */
              <div style={{
                background: '#fff', borderRadius: 20, padding: '40px 24px',
                boxShadow: '0 2px 16px rgba(15,23,42,0.07)', textAlign: 'center',
              }}>
                <div style={{ fontSize: 44, marginBottom: 16 }}>📂</div>
                <div style={{ color: '#1e1b4b', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                  這個月還沒有記錄
                </div>
                <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 24, lineHeight: 1.7 }}>
                  從網路銀行匯出對帳單後上傳<br />
                  資料就會自動出現
                </div>
                <button
                  onClick={() => router.push('/accounts')}
                  style={{
                    background: 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)',
                    border: 'none', borderRadius: 14,
                    color: '#fff', fontWeight: 700, fontSize: 14,
                    padding: '14px 28px', cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(91,95,199,0.32)',
                    transition: 'all 0.15s',
                  }}
                >
                  前往匯入對帳單
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
