'use client';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { name: '餐飲', icon: '🍱' },
  { name: '交通', icon: '🚇' },
  { name: '購物', icon: '🛍' },
  { name: '娛樂', icon: '🎬' },
  { name: '通訊', icon: '📱' },
  { name: '其他', icon: '📋' },
];

type Phase = 'idle' | 'loading' | 'done' | 'error';

interface Result {
  transaction: {
    description: string;
    amount: string;
    direction: 'DEBIT' | 'CREDIT';
    category?: { name: string; icon?: string };
  };
  monthSummary: {
    totalExpense: number;
    txCount: number;
    month: string;
  };
}

export default function AppPage() {
  const { apiFetch, demoMode } = useAuth();
  const router = useRouter();

  const [direction, setDirection] = useState<'DEBIT' | 'CREDIT'>('DEBIT');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('餐飲');
  const [description, setDescription] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  const fmt = (n: number) => `NT$ ${Math.abs(n ?? 0).toLocaleString()}`;

  async function submit() {
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    setPhase('loading');
    try {
      const res = await apiFetch('/ledger', {
        method: 'POST',
        body: JSON.stringify({
          description: description.trim() || category,
          amount: amt,
          direction,
          categoryName: category,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setResult(json.data);
      setPhase('done');
    } catch {
      setPhase('error');
    }
  }

  function reset() {
    setAmount('');
    setDescription('');
    setDirection('DEBIT');
    setCategory('餐飲');
    setPhase('idle');
    setResult(null);
  }

  function share() {
    const url = 'https://frontend-three-phi-36.vercel.app';
    const text = `我剛用錢跡記帳，幾秒就整理好\n不用註冊也能用\n👉 ${url}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  }

  const canSubmit = Number(amount) > 0 && phase !== 'loading';

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#f4f6fb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      paddingBottom: 100,
    }}>
      <style>{`
        @keyframes sp { to { transform: rotate(360deg); } }
        @keyframes pop { 0% { transform: scale(0.94); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .cat-chip:active { transform: scale(0.93); }
        .dir-btn:active { transform: scale(0.96); }
        .submit-btn:not(:disabled):active { transform: scale(0.97); }
        .next-btn:active { transform: scale(0.97); }
      `}</style>

      {/* Header */}
      <div style={{
        background: '#1e1b4b',
        padding: '52px 20px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px' }}>錢跡</div>
        <button
          onClick={() => router.push(demoMode ? '/login' : '/accounts')}
          style={{
            background: demoMode ? 'rgba(91,95,199,0.5)' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${demoMode ? 'rgba(91,95,199,0.5)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 10, color: '#fff',
            fontSize: 12, fontWeight: demoMode ? 700 : 400,
            padding: '6px 14px', cursor: 'pointer',
          }}
        >{demoMode ? '建立帳號' : '設定'}</button>
      </div>

      <div style={{ padding: '20px 16px 0' }}>

        {/* ══ IDLE / FORM ══ */}
        {(phase === 'idle' || phase === 'error') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'pop 0.25s ease both' }}>

            {/* Error banner */}
            {phase === 'error' && (
              <div style={{
                background: '#fff1f2', border: '1.5px solid #fecdd3',
                borderRadius: 16, padding: '14px 16px',
                color: '#e11d48', fontSize: 13, fontWeight: 600,
              }}>
                記錄失敗，請再試一次
              </div>
            )}

            {/* Direction */}
            <div style={{
              background: '#fff', borderRadius: 20, padding: '6px',
              boxShadow: '0 2px 16px rgba(15,23,42,0.07)',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
            }}>
              {(['DEBIT', 'CREDIT'] as const).map(d => (
                <button
                  key={d}
                  className="dir-btn"
                  onClick={() => setDirection(d)}
                  style={{
                    padding: '13px', borderRadius: 14, border: 'none',
                    background: direction === d
                      ? (d === 'DEBIT' ? '#fff1f2' : '#f0fdf4')
                      : 'transparent',
                    color: direction === d
                      ? (d === 'DEBIT' ? '#f43f5e' : '#10b981')
                      : '#94a3b8',
                    fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {d === 'DEBIT' ? '支出' : '收入'}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div style={{
              background: '#fff', borderRadius: 20, padding: '20px',
              boxShadow: '0 2px 16px rgba(15,23,42,0.07)',
            }}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>金額</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#94a3b8' }}>NT$</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && canSubmit && submit()}
                  style={{
                    flex: 1, border: 'none', outline: 'none',
                    fontSize: 36, fontWeight: 800,
                    color: direction === 'DEBIT' ? '#f43f5e' : '#10b981',
                    background: 'transparent', letterSpacing: '-1px',
                    width: '100%',
                  }}
                />
              </div>
            </div>

            {/* Category */}
            <div style={{
              background: '#fff', borderRadius: 20, padding: '20px',
              boxShadow: '0 2px 16px rgba(15,23,42,0.07)',
            }}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 12 }}>類別</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CATEGORIES.map(c => (
                  <button
                    key={c.name}
                    className="cat-chip"
                    onClick={() => setCategory(c.name)}
                    style={{
                      padding: '9px 14px', borderRadius: 12, border: '2px solid',
                      borderColor: category === c.name ? '#5b5fc7' : '#e2e8f0',
                      background: category === c.name ? '#eff2ff' : '#f8fafc',
                      color: category === c.name ? '#5b5fc7' : '#64748b',
                      fontSize: 13, fontWeight: category === c.name ? 700 : 500,
                      cursor: 'pointer', transition: 'all 0.12s',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    <span>{c.icon}</span> {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{
              background: '#fff', borderRadius: 20, padding: '20px',
              boxShadow: '0 2px 16px rgba(15,23,42,0.07)',
            }}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>說明（選填）</div>
              <input
                type="text"
                placeholder={`例如：${category === '餐飲' ? '午餐便當' : category === '交通' ? '搭捷運' : '購買物品'}`}
                value={description}
                onChange={e => setDescription(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && canSubmit && submit()}
                style={{
                  width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 12,
                  padding: '13px 14px', fontSize: 15, outline: 'none',
                  color: '#1e1b4b', background: '#f8fafc', boxSizing: 'border-box',
                }}
                onFocus={e => (e.target.style.borderColor = '#5b5fc7')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>

            {/* Submit */}
            <button
              className="submit-btn"
              onClick={submit}
              disabled={!canSubmit}
              style={{
                width: '100%',
                background: canSubmit
                  ? 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)'
                  : '#e2e8f0',
                border: 'none', borderRadius: 18,
                color: canSubmit ? '#fff' : '#94a3b8',
                fontWeight: 800, fontSize: 18,
                padding: '20px', cursor: canSubmit ? 'pointer' : 'default',
                boxShadow: canSubmit ? '0 8px 28px rgba(91,95,199,0.38)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              記帳
            </button>
          </div>
        )}

        {/* ══ LOADING ══ */}
        {phase === 'loading' && (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '60px 20px',
            boxShadow: '0 2px 16px rgba(15,23,42,0.07)', textAlign: 'center',
          }}>
            <div style={{
              display: 'inline-block', width: 36, height: 36,
              border: '3px solid rgba(91,95,199,0.15)',
              borderTopColor: '#5b5fc7', borderRadius: '50%',
              animation: 'sp 0.7s linear infinite', marginBottom: 16,
            }} />
            <div style={{ color: '#94a3b8', fontSize: 14 }}>記錄中…</div>
          </div>
        )}

        {/* ══ DONE ══ */}
        {phase === 'done' && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'pop 0.3s ease both' }}>

            {/* Result card */}
            <div style={{
              background: '#fff', borderRadius: 20, padding: '24px 20px',
              boxShadow: '0 2px 16px rgba(15,23,42,0.07)',
            }}>
              {/* Success badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#f0fdf4', borderRadius: 20, padding: '6px 14px',
                color: '#059669', fontSize: 13, fontWeight: 700, marginBottom: 20,
              }}>
                ✅ 已幫你記下來了
              </div>

              {/* This entry */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 17, flexShrink: 0,
                  background: result.transaction.direction === 'DEBIT' ? '#fff1f2' : '#f0fdf4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                }}>
                  {result.transaction.category?.icon ?? (result.transaction.direction === 'DEBIT' ? '↑' : '↓')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1e1b4b', marginBottom: 3 }}>
                    {result.transaction.description}
                  </div>
                  {result.transaction.category && (
                    <div style={{
                      display: 'inline-block', fontSize: 11, color: '#5b5fc7',
                      fontWeight: 600, background: '#eff2ff', borderRadius: 6, padding: '2px 8px',
                    }}>
                      {result.transaction.category.name}
                    </div>
                  )}
                </div>
                <div style={{
                  fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px',
                  color: result.transaction.direction === 'DEBIT' ? '#f43f5e' : '#10b981',
                  flexShrink: 0,
                }}>
                  {result.transaction.direction === 'DEBIT' ? '-' : '+'}NT$ {Number(result.transaction.amount).toLocaleString()}
                </div>
              </div>

              {/* Monthly accumulated */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: '#f8fafc', borderRadius: 14, padding: '13px 14px' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>本月支出</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#f43f5e', letterSpacing: '-0.3px' }}>
                    {fmt(result.monthSummary.totalExpense)}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 14, padding: '13px 14px' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>本月已記</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#5b5fc7' }}>
                    {result.monthSummary.txCount} 筆
                  </div>
                </div>
              </div>
            </div>

            {/* Primary: 再記一筆 */}
            <button
              onClick={reset}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)',
                border: 'none', borderRadius: 18,
                color: '#fff', fontWeight: 800, fontSize: 18,
                padding: '20px', cursor: 'pointer',
                boxShadow: '0 8px 28px rgba(91,95,199,0.38)',
                transition: 'transform 0.12s',
              }}
              className="next-btn"
            >
              再記一筆
            </button>

            {/* Secondary actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                className="next-btn"
                onClick={() => router.push('/ledger')}
                style={{
                  background: '#fff', border: '1.5px solid #e2e8f0',
                  borderRadius: 16, padding: '15px 12px',
                  color: '#1e1b4b', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                查看本月
              </button>
              <button
                className="next-btn"
                onClick={share}
                style={{
                  background: copied ? '#f0fdf4' : '#fff',
                  border: `1.5px solid ${copied ? '#bbf7d0' : '#e2e8f0'}`,
                  borderRadius: 16, padding: '15px 12px',
                  color: copied ? '#059669' : '#64748b',
                  fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {copied ? '✓ 已複製' : '分享給朋友'}
              </button>
            </div>

            {/* LINE share */}
            <a
              href={`https://line.me/R/msg/text/${encodeURIComponent(`我剛用錢跡記帳，幾秒就整理好\n不用註冊也能用\n👉 https://frontend-three-phi-36.vercel.app`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#06C755', borderRadius: 16, padding: '13px',
                color: '#fff', fontSize: 14, fontWeight: 700,
                textDecoration: 'none', transition: 'opacity 0.15s',
              }}
            >
              <span style={{ fontSize: 18 }}>💬</span>
              分享到 LINE
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
