'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAuthGuard } from '../hooks/useAuthGuard';

interface Match {
  id: string; confidence: number;
  items: Array<{
    bankTx?: { merchant: string; txDate: string; amount: string; direction: string };
    invoice?: { sellerName: string; invoiceDate: string; amount: string };
  }>;
}

export default function MatchesPage() {
  useAuthGuard();
  const { apiFetch } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [actionError, setActionError] = useState('');

  async function load() {
    const res = await apiFetch('/matches/pending');
    const json = await res.json();
    setMatches(json.data ?? []);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function autoMatch() {
    setRunning(true); setActionError('');
    try {
      await apiFetch('/matches/auto', { method: 'POST' });
      await load();
    } catch {
      setActionError('自動比對失敗，請稍後再試');
    } finally { setRunning(false); }
  }

  async function confirm(id: string) {
    try {
      await apiFetch(`/matches/${id}/confirm`, { method: 'POST' });
      setMatches(m => m.filter(x => x.id !== id));
    } catch {
      setActionError('操作失敗，請再試一次');
    }
  }

  async function reject(id: string) {
    try {
      await apiFetch(`/matches/${id}/reject`, { method: 'POST' });
      setMatches(m => m.filter(x => x.id !== id));
    } catch {
      setActionError('操作失敗，請再試一次');
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#f4f6fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #7c3aed 0%, #5b5fc7 100%)', padding: '56px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>配對</div>
          <button onClick={autoMatch} disabled={running || loading} style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            borderRadius: 22, color: '#fff', fontSize: 13, fontWeight: 600,
            padding: '9px 20px', cursor: running ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {running ? (
              <>
                <span style={{ display: 'inline-block', width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                比對中
              </>
            ) : '自動比對'}
          </button>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
          {loading ? '載入中...' : matches.length > 0 ? `${matches.length} 筆待確認` : '暫無待確認項目'}
        </div>
      </div>

      <div style={{ padding: '16px 16px 32px' }}>
        {actionError && (
          <div style={{
            background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12,
            padding: '12px 16px', color: '#e11d48', fontSize: 13, fontWeight: 600,
            marginBottom: 12,
          }}>{actionError}</div>
        )}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid rgba(91,95,199,0.15)', borderTopColor: '#5b5fc7', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '72px 24px' }}>
            <div style={{
              width: 60, height: 60, borderRadius: 20,
              background: '#f0fdf4', margin: '0 auto 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
            }}>✓</div>
            <div style={{ color: '#1e1b4b', fontSize: 17, fontWeight: 800, marginBottom: 8 }}>全部處理完畢</div>
            <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>點擊「自動比對」<br />開始下一輪配對</div>
          </div>
        ) : matches.map(m => {
          const bankItem = m.items.find(i => i.bankTx);
          const invItem = m.items.find(i => i.invoice);
          const pct = Math.round(m.confidence * 100);
          const confColor = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#f43f5e';

          return (
            <div key={m.id} style={{
              background: '#fff', borderRadius: 20, marginBottom: 14,
              boxShadow: '0 2px 16px rgba(15,23,42,0.07)', overflow: 'hidden',
            }}>
              {/* Confidence bar */}
              <div style={{ height: 3, background: '#f1f5f9' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: confColor, transition: 'width 0.5s ease' }} />
              </div>

              <div style={{ padding: '16px' }}>
                {/* Confidence badge */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <div style={{
                    borderRadius: 20, padding: '4px 12px',
                    background: pct >= 80 ? '#f0fdf4' : pct >= 50 ? '#fffbeb' : '#fff1f2',
                    fontSize: 12, fontWeight: 700, color: confColor,
                  }}>吻合 {pct}%</div>
                </div>

                {/* Two-column comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  <div style={{ background: '#eff2ff', borderRadius: 14, padding: '13px 12px' }}>
                    <div style={{ fontSize: 10, color: '#5b5fc7', fontWeight: 700, marginBottom: 6 }}>銀行</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {bankItem?.bankTx?.merchant ?? '-'}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 5 }}>
                      {bankItem?.bankTx?.txDate ? new Date(bankItem.bankTx.txDate).toLocaleDateString('zh-TW') : ''}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#5b5fc7' }}>
                      NT$ {Number(bankItem?.bankTx?.amount ?? 0).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ background: '#fffbeb', borderRadius: 14, padding: '13px 12px' }}>
                    <div style={{ fontSize: 10, color: '#d97706', fontWeight: 700, marginBottom: 6 }}>發票</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {invItem?.invoice?.sellerName ?? '-'}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 5 }}>
                      {invItem?.invoice?.invoiceDate ? new Date(invItem.invoice.invoiceDate).toLocaleDateString('zh-TW') : ''}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#d97706' }}>
                      NT$ {Number(invItem?.invoice?.amount ?? 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button onClick={() => confirm(m.id)} style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none', borderRadius: 13, color: '#fff',
                    fontWeight: 700, fontSize: 14, padding: '13px', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                  }}>確認配對</button>
                  <button onClick={() => reject(m.id)} style={{
                    background: '#f8fafc', border: '1.5px solid #e2e8f0',
                    borderRadius: 13, color: '#64748b',
                    fontWeight: 600, fontSize: 14, padding: '13px', cursor: 'pointer',
                  }}>不配對</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
