'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface LedgerTx {
  id: string; txDate: string; description: string;
  amount: string; direction: 'DEBIT' | 'CREDIT'; status: string;
  category?: { name: string; icon?: string };
}

const MONTH_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const d = new Date(); d.setMonth(d.getMonth() - i);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
});

export default function LedgerPage() {
  const [txs, setTxs] = useState<LedgerTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(MONTH_OPTIONS[0]);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/ledger?month=${month}`)
      .then(r => r.json()).then(d => setTxs(d.data ?? []))
      .catch(() => setTxs([])).finally(() => setLoading(false));
  }, [month]);

  const grouped = txs.reduce((acc, tx) => {
    const d = new Date(tx.txDate).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' });
    if (!acc[d]) acc[d] = [];
    acc[d].push(tx); return acc;
  }, {} as Record<string, LedgerTx[]>);

  const totalExp = txs.filter(t => t.direction === 'DEBIT').reduce((s, t) => s + Number(t.amount), 0);
  const totalInc = txs.filter(t => t.direction === 'CREDIT').reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div style={{ minHeight: '100dvh', background: '#f5f6fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #6c63ff 0%, #a29bfe 100%)', padding: '52px 20px 28px', position: 'relative' }}>
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: '-0.3px', marginBottom: 20 }}>帳本</div>

        {/* Month selector */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {MONTH_OPTIONS.map(m => (
            <button key={m} onClick={() => setMonth(m)} style={{
              flexShrink: 0, padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: m === month ? '#fff' : 'rgba(255,255,255,0.18)',
              color: m === month ? '#6c63ff' : '#fff',
              fontSize: 13, fontWeight: m === month ? 700 : 500,
              transition: 'all 0.2s',
            }}>{m.slice(5)}月</button>
          ))}
        </div>

        {/* Summary */}
        <div style={{ display: 'flex', gap: 32, marginTop: 20 }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4 }}>支出</div>
            <div style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>NT$ {totalExp.toLocaleString()}</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.2)', alignSelf: 'stretch' }} />
          <div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4 }}>收入</div>
            <div style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>NT$ {totalInc.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ display: 'inline-block', width: 36, height: 36, border: '3px solid #e8ecf4', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ color: '#8892a4', fontSize: 14, marginTop: 16 }}>載入中...</div>
          </div>
        ) : txs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
            <div style={{ color: '#1a1a2e', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>本月尚無記錄</div>
            <div style={{ color: '#8892a4', fontSize: 13 }}>請先匯入銀行對帳單</div>
          </div>
        ) : Object.entries(grouped).map(([date, items]) => {
          const dayExp = items.filter(t => t.direction === 'DEBIT').reduce((s, t) => s + Number(t.amount), 0);
          return (
            <div key={date} style={{ marginBottom: 20 }}>
              {/* Date row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingLeft: 4, paddingRight: 4 }}>
                <div style={{ fontSize: 12, color: '#8892a4', fontWeight: 700, letterSpacing: '0.3px' }}>{date}</div>
                {dayExp > 0 && (
                  <div style={{ fontSize: 12, color: '#ff6b6b', fontWeight: 600 }}>-NT$ {dayExp.toLocaleString()}</div>
                )}
              </div>

              {/* Card */}
              <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 20px rgba(108,99,255,0.07)' }}>
                {items.map((tx, i) => (
                  <div key={tx.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                    borderBottom: i < items.length - 1 ? '1px solid #f0f2f8' : 'none',
                  }}>
                    {/* Icon */}
                    <div style={{
                      width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                      background: tx.direction === 'DEBIT' ? '#fff0f0' : '#f0fff8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19,
                    }}>
                      {tx.category?.icon ?? (tx.direction === 'DEBIT' ? '💸' : '💰')}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tx.description}
                      </div>
                      {tx.category && (
                        <div style={{
                          display: 'inline-block', marginTop: 3,
                          fontSize: 11, color: '#6c63ff', fontWeight: 700,
                          background: '#f0eeff', borderRadius: 6, padding: '2px 7px',
                        }}>
                          {tx.category.name}
                        </div>
                      )}
                    </div>

                    {/* Amount */}
                    <div style={{ fontWeight: 800, fontSize: 15, color: tx.direction === 'DEBIT' ? '#ff6b6b' : '#26de81', flexShrink: 0, letterSpacing: '-0.3px' }}>
                      {tx.direction === 'DEBIT' ? '-' : '+'}NT$ {Number(tx.amount).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
