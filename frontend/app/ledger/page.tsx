'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LedgerTx {
  id: string; txDate: string; description: string;
  amount: string; direction: 'DEBIT' | 'CREDIT'; status: string;
  category?: { name: string; icon?: string };
}

const MONTH_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const d = new Date(); d.setMonth(d.getMonth() - i);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
});

export default function LedgerPage() {
  const { apiFetch } = useAuth();
  const [txs, setTxs] = useState<LedgerTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(MONTH_OPTIONS[0]);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/ledger?month=${month}`)
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
    <div style={{ minHeight: '100dvh', background: '#f4f6fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #5b5fc7 0%, #7c3aed 100%)', padding: '56px 20px 24px' }}>
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: '-0.3px', marginBottom: 18 }}>帳本</div>

        {/* Month selector */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {MONTH_OPTIONS.map(m => (
            <button key={m} onClick={() => setMonth(m)} style={{
              flexShrink: 0, padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: m === month ? '#fff' : 'rgba(255,255,255,0.18)',
              color: m === month ? '#5b5fc7' : '#fff',
              fontSize: 13, fontWeight: m === month ? 700 : 500,
            }}>{m.slice(5)}月</button>
          ))}
        </div>

        {/* Summary */}
        <div style={{ display: 'flex', gap: 24, marginTop: 18 }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600, marginBottom: 3 }}>支出</div>
            <div style={{ color: '#fca5a5', fontSize: 20, fontWeight: 800 }}>NT$ {totalExp.toLocaleString()}</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
          <div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600, marginBottom: 3 }}>收入</div>
            <div style={{ color: '#6ee7b7', fontSize: 20, fontWeight: 800 }}>NT$ {totalInc.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid rgba(91,95,199,0.15)', borderTopColor: '#5b5fc7', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : txs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>📭</div>
            <div style={{ color: '#1e1b4b', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>本月尚無記錄</div>
            <div style={{ color: '#94a3b8', fontSize: 13 }}>請至設定頁匯入銀行對帳單</div>
          </div>
        ) : Object.entries(grouped).map(([date, items]) => {
          const dayExp = items.filter(t => t.direction === 'DEBIT').reduce((s, t) => s + Number(t.amount), 0);
          return (
            <div key={date} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '0 4px' }}>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{date}</div>
                {dayExp > 0 && <div style={{ fontSize: 12, color: '#f43f5e', fontWeight: 600 }}>-NT$ {dayExp.toLocaleString()}</div>}
              </div>

              <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
                {items.map((tx, i) => (
                  <div key={tx.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                    borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none',
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
                      {tx.category && (
                        <div style={{
                          display: 'inline-block', marginTop: 3,
                          fontSize: 11, color: '#5b5fc7', fontWeight: 600,
                          background: '#eff2ff', borderRadius: 6, padding: '2px 7px',
                        }}>{tx.category.name}</div>
                      )}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
