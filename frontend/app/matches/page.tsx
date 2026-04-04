'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Match {
  id: string; confidence: number;
  items: Array<{
    bankTx?: { merchant: string; txDate: string; amount: string; direction: string };
    invoice?: { sellerName: string; invoiceDate: string; amount: string };
  }>;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [running, setRunning] = useState(false);

  async function load() {
    const res = await fetch(`${API}/matches/pending`);
    const json = await res.json();
    setMatches(json.data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function autoMatch() {
    setRunning(true);
    await fetch(`${API}/matches/auto`, { method: 'POST' });
    await load(); setRunning(false);
  }

  async function confirm(id: string) {
    await fetch(`${API}/matches/${id}/confirm`, { method: 'POST' });
    setMatches(m => m.filter(x => x.id !== id));
  }

  async function reject(id: string) {
    await fetch(`${API}/matches/${id}/reject`, { method: 'POST' });
    setMatches(m => m.filter(x => x.id !== id));
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#f5f6fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #f78fb3 0%, #6c63ff 100%)', padding: '52px 20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: '-0.3px' }}>配對</div>
          <button onClick={autoMatch} disabled={running} style={{
            background: running ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.22)',
            backdropFilter: 'blur(8px)',
            border: '1.5px solid rgba(255,255,255,0.35)',
            borderRadius: 22, color: '#fff', fontSize: 13, fontWeight: 700,
            padding: '9px 20px', cursor: running ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {running ? (
              <>
                <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                比對中...
              </>
            ) : '🔍 自動比對'}
          </button>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500 }}>
          {matches.length > 0 ? `${matches.length} 筆待確認` : '無待確認項目'}
        </div>
      </div>

      <div style={{ padding: '16px 16px 32px' }}>
        {matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
            <div style={{ color: '#1a1a2e', fontSize: 18, fontWeight: 800, marginBottom: 8 }}>全部配對完成</div>
            <div style={{ color: '#8892a4', fontSize: 13 }}>點擊自動比對開始新一輪</div>
          </div>
        ) : matches.map(m => {
          const bankItem = m.items.find(i => i.bankTx);
          const invItem = m.items.find(i => i.invoice);
          const pct = Math.round(m.confidence * 100);
          const confColor = pct >= 80 ? '#26de81' : pct >= 50 ? '#ffd93d' : '#ff6b6b';
          const confBg = pct >= 80 ? '#f0fff8' : pct >= 50 ? '#fffbf0' : '#fff0f0';

          return (
            <div key={m.id} style={{
              background: '#fff', borderRadius: 20, marginBottom: 14,
              boxShadow: '0 4px 24px rgba(108,99,255,0.09)', overflow: 'hidden',
            }}>
              {/* Confidence bar */}
              <div style={{ height: 4, background: '#f0f2f8' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: confColor, transition: 'width 0.5s ease' }} />
              </div>

              <div style={{ padding: '16px 16px 14px' }}>
                {/* Confidence badge */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <div style={{
                    background: confBg, borderRadius: 20, padding: '4px 12px',
                    fontSize: 12, fontWeight: 800, color: confColor,
                  }}>吻合度 {pct}%</div>
                </div>

                {/* Two-column comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  {/* Bank */}
                  <div style={{ background: '#f0f4ff', borderRadius: 14, padding: '13px 12px' }}>
                    <div style={{ fontSize: 10, color: '#6c63ff', fontWeight: 800, marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>🏦 銀行</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {bankItem?.bankTx?.merchant ?? '-'}
                    </div>
                    <div style={{ fontSize: 11, color: '#8892a4', marginBottom: 6 }}>
                      {bankItem?.bankTx?.txDate ? new Date(bankItem.bankTx.txDate).toLocaleDateString('zh-TW') : ''}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#6c63ff' }}>
                      NT$ {Number(bankItem?.bankTx?.amount ?? 0).toLocaleString()}
                    </div>
                  </div>

                  {/* Invoice */}
                  <div style={{ background: '#fffbf0', borderRadius: 14, padding: '13px 12px' }}>
                    <div style={{ fontSize: 10, color: '#ffa502', fontWeight: 800, marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>🧾 發票</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {invItem?.invoice?.sellerName ?? '-'}
                    </div>
                    <div style={{ fontSize: 11, color: '#8892a4', marginBottom: 6 }}>
                      {invItem?.invoice?.invoiceDate ? new Date(invItem.invoice.invoiceDate).toLocaleDateString('zh-TW') : ''}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#ffa502' }}>
                      NT$ {Number(invItem?.invoice?.amount ?? 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button onClick={() => confirm(m.id)} style={{
                    background: 'linear-gradient(135deg, #26de81 0%, #20bf6b 100%)',
                    border: 'none', borderRadius: 13, color: '#fff',
                    fontWeight: 700, fontSize: 14, padding: '13px', cursor: 'pointer',
                    letterSpacing: '-0.2px',
                  }}>✓ 確認配對</button>
                  <button onClick={() => reject(m.id)} style={{
                    background: '#f5f6fa', border: '1.5px solid #e8ecf4', borderRadius: 13, color: '#8892a4',
                    fontWeight: 600, fontSize: 14, padding: '13px', cursor: 'pointer',
                  }}>✗ 拒絕</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
