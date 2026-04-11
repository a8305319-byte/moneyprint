'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '../hooks/useAuthGuard';

interface LedgerTx {
  id: string; txDate: string; description: string;
  amount: string; direction: 'DEBIT' | 'CREDIT'; status: string;
  category?: { name: string; icon?: string };
}

const MONTH_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const d = new Date(); d.setMonth(d.getMonth() - i);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
});

// Parse date string safely without timezone shift
function parseTxDate(txDate: string): Date {
  const s = String(txDate).slice(0, 10); // "YYYY-MM-DD"
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatGroupDate(txDate: string): string {
  const d = parseTxDate(txDate);
  return d.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' });
}

type ImportState = 'idle' | 'uploading' | 'done' | 'error';
interface ImportResult { imported: number; duplicated: number; failed: number; }

export default function LedgerPage() {
  useAuthGuard();
  const { apiFetch, demoMode } = useAuth();
  const router = useRouter();
  const [txs, setTxs] = useState<LedgerTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(MONTH_OPTIONS[0]);
  const [deleteTarget, setDeleteTarget] = useState<LedgerTx | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Search / filter state (client-side)
  const [search, setSearch] = useState('');
  const [filterDir, setFilterDir] = useState<'' | 'DEBIT' | 'CREDIT'>('');

  // Edit state
  const [editTarget, setEditTarget] = useState<LedgerTx | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDir, setEditDir] = useState<'DEBIT' | 'CREDIT'>('DEBIT');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // CSV import state
  const fileRef = useRef<HTMLInputElement>(null);
  const [importState, setImportState] = useState<ImportState>('idle');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiFetch(`/ledger?month=${month}`)
      .then(r => r.json()).then(d => setTxs(d.data?.data ?? d.data ?? []))
      .catch(() => setTxs([])).finally(() => setLoading(false));
  }, [month]);

  // Filtered list (client-side search + direction)
  const filtered = txs.filter(tx => {
    if (filterDir && tx.direction !== filterDir) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return tx.description.toLowerCase().includes(q)
        || (tx.category?.name ?? '').toLowerCase().includes(q);
    }
    return true;
  });

  // Group by date using timezone-safe parsing
  const grouped = filtered.reduce((acc, tx) => {
    const key = formatGroupDate(tx.txDate);
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {} as Record<string, LedgerTx[]>);

  const totalExp = txs.filter(t => t.direction === 'DEBIT').reduce((s, t) => s + Number(t.amount), 0);
  const totalInc = txs.filter(t => t.direction === 'CREDIT').reduce((s, t) => s + Number(t.amount), 0);

  function openEdit(tx: LedgerTx) {
    setEditTarget(tx);
    setEditDesc(tx.description);
    setEditAmount(String(Number(tx.amount)));
    setEditDir(tx.direction);
    setEditCategory(tx.category?.name ?? '');
    setEditDate(tx.txDate.slice(0, 10));
    setEditError('');
  }

  async function saveEdit() {
    if (!editTarget) return;
    if (!editDesc.trim()) { setEditError('說明不可為空'); return; }
    const amt = parseFloat(editAmount);
    if (!amt || amt <= 0) { setEditError('金額必須大於 0'); return; }
    setEditSaving(true); setEditError('');
    try {
      const r = await apiFetch(`/ledger/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: editDesc.trim(),
          amount: amt,
          direction: editDir,
          categoryName: editCategory.trim() || undefined,
          txDate: editDate,
        }),
      });
      const j = await r.json();
      if (!r.ok) { setEditError(j.message ?? '儲存失敗'); return; }
      const updated: LedgerTx = j.data?.transaction ?? j.data ?? j;
      setTxs(prev => prev.map(t => t.id === editTarget.id ? { ...t, ...updated } : t));
      setEditTarget(null);
    } catch { setEditError('網路錯誤，請稍後再試'); }
    finally { setEditSaving(false); }
  }

  async function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (demoMode) {
      setImportState('error');
      setImportError('示範模式不支援 CSV 匯入，請建立帳號後使用');
      return;
    }

    setImportState('uploading');
    setImportError('');
    setImportResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const r = await apiFetch('/ledger/import-bank-csv', { method: 'POST', body: form });
      const j = await r.json();
      if (!r.ok) {
        setImportState('error');
        setImportError(j.message ?? '匯入失敗');
        return;
      }
      const d = j.data ?? j;
      setImportResult({ imported: d.imported ?? 0, duplicated: d.duplicated ?? 0, failed: d.failed ?? 0 });
      setImportState('done');
      // reload list for current month
      setLoading(true);
      apiFetch(`/ledger?month=${month}`)
        .then(r2 => r2.json()).then(d2 => setTxs(d2.data?.data ?? d2.data ?? []))
        .catch(() => {}).finally(() => setLoading(false));
    } catch {
      setImportState('error');
      setImportError('網路錯誤，請稍後再試');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await apiFetch(`/ledger/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setTxs(prev => prev.filter(t => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setDeleteError('刪除失敗，請再試一次');
    }
    setDeleting(false);
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#f4f6fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pop { 0% { transform: scale(0.96); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .tx-row:active { background: #f8fafc !important; }
        .del-btn:active { opacity: 0.7; }
      `}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #5b5fc7 0%, #7c3aed 100%)', padding: '56px 20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: '-0.3px' }}>帳本</div>
          {!loading && txs.length > 0 && (
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500 }}>共 {txs.length} 筆</div>
          )}
        </div>

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

        {/* ── 銀行 CSV 匯入卡片 ── */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)', marginBottom: 16 }}>
          <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: 'none' }} onChange={handleCsvUpload} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b' }}>匯入銀行 CSV</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>支援中信、富邦、國泰、玉山、台新、永豐 · UTF-8 / Big5</div>
            </div>
            <button
              onClick={() => { setImportState('idle'); setImportResult(null); setImportError(''); fileRef.current?.click(); }}
              disabled={importState === 'uploading'}
              style={{
                flexShrink: 0, padding: '8px 16px', borderRadius: 10, border: 'none',
                background: importState === 'uploading' ? '#f1f5f9' : 'linear-gradient(135deg, #5b5fc7, #7c3aed)',
                color: importState === 'uploading' ? '#94a3b8' : '#fff',
                fontSize: 13, fontWeight: 700, cursor: importState === 'uploading' ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {importState === 'uploading' ? (
                <>
                  <div style={{ width: 13, height: 13, border: '2px solid rgba(148,163,184,0.3)', borderTopColor: '#94a3b8', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  上傳中…
                </>
              ) : '📥 選擇檔案'}
            </button>
          </div>

          {importState === 'done' && importResult && (
            <div style={{ marginTop: 10, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#14532d', display: 'flex', gap: 16 }}>
              <span>✅ 匯入 <strong>{importResult.imported}</strong> 筆</span>
              <span>🔁 重複 <strong>{importResult.duplicated}</strong> 筆</span>
              {importResult.failed > 0 && <span>❌ 失敗 <strong>{importResult.failed}</strong> 筆</span>}
            </div>
          )}
          {importState === 'error' && importError && (
            <div style={{ marginTop: 10, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#991b1b' }}>
              ❌ {importError}
            </div>
          )}
        </div>

        {/* ── 搜尋 + 篩選 ── */}
        {!loading && txs.length > 0 && (
          <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜尋說明或分類…"
              style={{
                flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 12,
                padding: '10px 14px', fontSize: 14, background: '#fff',
                outline: 'none', color: '#1e1b4b',
                boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
              }}
            />
            <button onClick={() => setFilterDir(filterDir === 'DEBIT' ? '' : 'DEBIT')} style={{
              flexShrink: 0, padding: '0 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: filterDir === 'DEBIT' ? '#fff1f2' : '#fff',
              color: filterDir === 'DEBIT' ? '#f43f5e' : '#64748b',
              fontWeight: 700, fontSize: 13,
              border: filterDir === 'DEBIT' ? '1.5px solid #fca5a5' : '1.5px solid #e2e8f0',
            } as React.CSSProperties}>支出</button>
            <button onClick={() => setFilterDir(filterDir === 'CREDIT' ? '' : 'CREDIT')} style={{
              flexShrink: 0, padding: '0 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: filterDir === 'CREDIT' ? '#f0fdf4' : '#fff',
              color: filterDir === 'CREDIT' ? '#10b981' : '#64748b',
              fontWeight: 700, fontSize: 13,
              border: filterDir === 'CREDIT' ? '1.5px solid #86efac' : '1.5px solid #e2e8f0',
            } as React.CSSProperties}>收入</button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid rgba(91,95,199,0.15)', borderTopColor: '#5b5fc7', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : txs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>📭</div>
            <div style={{ color: '#1e1b4b', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>這個月還沒有記錄</div>
            <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 28 }}>去記第一筆帳吧</div>
            <button
              onClick={() => router.push('/app')}
              style={{
                background: 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)',
                border: 'none', borderRadius: 16, color: '#fff',
                fontWeight: 700, fontSize: 15, padding: '14px 32px', cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(91,95,199,0.35)',
              }}
            >去記帳</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontSize: 14 }}>
            沒有符合條件的記錄
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
                  <div key={tx.id} className="tx-row" style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                    borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'background 0.1s', cursor: 'pointer',
                  }}
                    onClick={() => openEdit(tx)}
                  >
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

                    {/* Delete trigger */}
                    <button
                      className="del-btn"
                      onClick={e => { e.stopPropagation(); setDeleteTarget(tx); setDeleteError(''); }}
                      style={{
                        flexShrink: 0, background: 'none', border: 'none',
                        padding: '4px 2px', cursor: 'pointer', opacity: 0.35,
                        display: 'flex', alignItems: 'center',
                      }}
                      title="刪除"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Edit sheet ── */}
      {editTarget && (
        <>
          <div onClick={() => setEditTarget(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 90, backdropFilter: 'blur(2px)' }}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 480, background: '#fff',
            borderRadius: '20px 20px 0 0',
            padding: '20px 20px calc(24px + env(safe-area-inset-bottom))',
            zIndex: 91, boxShadow: '0 -8px 40px rgba(15,23,42,0.15)',
            animation: 'pop 0.2s ease both',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1e1b4b' }}>編輯記錄</div>
              <button onClick={() => setEditTarget(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8', padding: 4 }}>✕</button>
            </div>

            {/* Direction toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {(['DEBIT', 'CREDIT'] as const).map(d => (
                <button key={d} onClick={() => setEditDir(d)} style={{
                  flex: 1, padding: '9px', borderRadius: 10, cursor: 'pointer', border: 'none',
                  background: editDir === d ? (d === 'DEBIT' ? '#fff1f2' : '#f0fdf4') : '#f8fafc',
                  color: editDir === d ? (d === 'DEBIT' ? '#f43f5e' : '#10b981') : '#94a3b8',
                  fontWeight: 700, fontSize: 13,
                  outline: editDir === d ? `2px solid ${d === 'DEBIT' ? '#fca5a5' : '#86efac'}` : '2px solid transparent',
                }}>{d === 'DEBIT' ? '支出' : '收入'}</button>
              ))}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 5, fontWeight: 600 }}>說明</div>
              <input value={editDesc} onChange={e => setEditDesc(e.target.value)}
                style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: '#1e1b4b', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

            {/* Amount + Date */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 5, fontWeight: 600 }}>金額</div>
                <input value={editAmount} onChange={e => setEditAmount(e.target.value)} type="number" min="0"
                  style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: '#1e1b4b', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 5, fontWeight: 600 }}>日期</div>
                <input value={editDate} onChange={e => setEditDate(e.target.value)} type="date"
                  style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '10px 12px', fontSize: 13, color: '#1e1b4b', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
            </div>

            {/* Category */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 5, fontWeight: 600 }}>分類（可選）</div>
              <input value={editCategory} onChange={e => setEditCategory(e.target.value)}
                placeholder="餐飲 / 交通 / 購物…"
                style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: '#1e1b4b', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

            {editError && <div style={{ color: '#e11d48', fontSize: 13, marginBottom: 10, fontWeight: 600 }}>{editError}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => setEditTarget(null)}
                style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '14px', color: '#64748b', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                取消
              </button>
              <button onClick={saveEdit} disabled={editSaving}
                style={{
                  background: editSaving ? '#c7d2fe' : 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)',
                  border: 'none', borderRadius: 14, padding: '14px', color: '#fff',
                  fontSize: 15, fontWeight: 700, cursor: editSaving ? 'not-allowed' : 'pointer',
                  boxShadow: editSaving ? 'none' : '0 4px 16px rgba(91,95,199,0.35)',
                }}>
                {editSaving ? '儲存中…' : '儲存'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete confirmation sheet */}
      {deleteTarget && (
        <>
          <div
            onClick={() => setDeleteTarget(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
              zIndex: 90, backdropFilter: 'blur(2px)',
            }}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 480,
            background: '#fff', borderRadius: '20px 20px 0 0',
            padding: '24px 20px calc(24px + env(safe-area-inset-bottom))',
            zIndex: 91, boxShadow: '0 -8px 40px rgba(15,23,42,0.15)',
            animation: 'pop 0.2s ease both',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1e1b4b', marginBottom: 6 }}>
              確定刪除這筆記錄？
            </div>
            <div style={{
              background: '#f8fafc', borderRadius: 14, padding: '12px 14px', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 20 }}>{deleteTarget.category?.icon ?? (deleteTarget.direction === 'DEBIT' ? '↑' : '↓')}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e1b4b' }}>{deleteTarget.description}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  {deleteTarget.direction === 'DEBIT' ? '-' : '+'}NT$ {Number(deleteTarget.amount).toLocaleString()}
                </div>
              </div>
            </div>
            {deleteError && (
              <div style={{ color: '#e11d48', fontSize: 13, marginBottom: 10, fontWeight: 600 }}>{deleteError}</div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  background: '#f8fafc', border: '1.5px solid #e2e8f0',
                  borderRadius: 14, padding: '14px', color: '#64748b',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                }}
              >取消</button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={{
                  background: deleting ? '#fecdd3' : 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  border: 'none', borderRadius: 14, padding: '14px', color: '#fff',
                  fontSize: 15, fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer',
                  boxShadow: deleting ? 'none' : '0 4px 16px rgba(244,63,94,0.35)',
                }}
              >{deleting ? '刪除中…' : '確認刪除'}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
