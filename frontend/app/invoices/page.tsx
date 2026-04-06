'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAuthGuard } from '../hooks/useAuthGuard';

interface Invoice {
  id: string; invoiceNo: string; invoiceDate: string;
  sellerName: string; amount: string; source: string;
}

// 最近 3 個月可選
const MONTHS = Array.from({ length: 3 }, (_, i) => {
  const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
});

type SyncState = 'idle' | 'syncing' | 'done' | 'error' | 'no_app_id';

export default function InvoicesPage() {
  useAuthGuard();
  const { apiFetch } = useAuth();

  const [invoices,    setInvoices]    = useState<Invoice[]>([]);
  const [listMonth,   setListMonth]   = useState(MONTHS[0]);
  const [loading,     setLoading]     = useState(true);

  // 同步表單狀態
  const [cardNo,      setCardNo]      = useState('');
  const [cardEncrypt, setCardEncrypt] = useState('');
  const [syncMonths,  setSyncMonths]  = useState<string[]>([MONTHS[0]]);
  const [syncState,   setSyncState]   = useState<SyncState>('idle');
  const [syncResult,  setSyncResult]  = useState<{ synced: number; already: number; total: number } | null>(null);
  const [syncError,   setSyncError]   = useState('');
  const encryptRef = useRef<HTMLInputElement>(null);

  // 載入既有綁定的 cardNo
  useEffect(() => {
    apiFetch('/invoices/carrier/binding')
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j?.data?.cardNo) setCardNo(j.data.cardNo); })
      .catch(() => {});
  }, []);

  // 載入發票清單
  async function loadInvoices() {
    setLoading(true);
    try {
      const r = await apiFetch(`/invoices?month=${listMonth}`);
      const j = await r.json();
      setInvoices(j.data ?? []);
    } finally { setLoading(false); }
  }
  useEffect(() => { loadInvoices(); }, [listMonth]);

  // 切換同步月份（多選）
  function toggleMonth(m: string) {
    setSyncMonths(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m],
    );
  }

  async function sync() {
    if (!cardNo.trim() || !CARD_NO_RE.test(cardNo)) {
      setSyncError('手機條碼格式錯誤（/XXXXXXX，/ 開頭 + 7 碼大寫英數）');
      return;
    }
    if (!cardEncrypt.trim()) {
      setSyncError('請填入手機條碼驗證碼');
      return;
    }
    if (syncMonths.length === 0) {
      setSyncError('請至少選擇一個月份');
      return;
    }

    setSyncState('syncing'); setSyncError(''); setSyncResult(null);

    try {
      const r = await apiFetch('/invoices/carrier/sync', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ cardNo, cardEncrypt, months: syncMonths }),
      });
      const j = await r.json();

      if (!r.ok) {
        const msg: string = j.data?.message ?? j.message ?? '同步失敗';
        if (msg.includes('MOF_APP_ID') || msg.includes('appID') || msg.includes('財政部 API 憑證')) {
          setSyncState('no_app_id');
        } else {
          setSyncState('error');
          setSyncError(msg);
        }
        return;
      }

      const result = j.data ?? j;
      setSyncResult({ synced: result.synced, already: result.already, total: result.total });
      setSyncState('done');
      // 清除驗證碼（安全）
      setCardEncrypt('');
      // 重新載入發票清單
      await loadInvoices();
    } catch {
      setSyncState('error');
      setSyncError('網路錯誤，請稍後再試');
    }
  }

  const CARD_NO_RE = /^\/[A-Z0-9+\-.]{7}$/;
  const total = invoices.reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div style={{ minHeight: '100dvh', background: '#f4f6fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .inv-row { transition: background 0.15s; }
        .inv-row:active { background: #f8fafc; }
      `}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #f59e0b 0%, #f43f5e 100%)', padding: '56px 20px 24px' }}>
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>電子發票</div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 18 }}>
          {invoices.length} 張 · NT$ {total.toLocaleString()}
        </div>
        {/* 月份 tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {MONTHS.map(m => (
            <button key={m} onClick={() => setListMonth(m)} style={{
              flexShrink: 0, padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: m === listMonth ? '#fff' : 'rgba(255,255,255,0.22)',
              color: m === listMonth ? '#f43f5e' : '#fff',
              fontSize: 13, fontWeight: m === listMonth ? 700 : 500,
            }}>{m.slice(5)}月</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>

        {/* ── 同步卡片 ── */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '18px 16px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)', marginBottom: 16 }}>
          {/* 標題列 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e1b4b' }}>手機條碼載具同步</div>
            <span style={{ fontSize: 10, background: '#ecfdf5', color: '#059669', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>財政部電子發票</span>
          </div>

          {/* no_app_id 狀態 */}
          {syncState === 'no_app_id' && (
            <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#92400e', lineHeight: 1.7 }}>
              <strong>系統尚未完成財政部 API 授權設定</strong><br />
              服務商需向財政部財政資訊中心申請 appID（需通過 ISO 27001 認證）<br />
              申請網址：<span style={{ color: '#d97706' }}>einvoice.nat.gov.tw/APCONSUMER/BTC605W</span>
            </div>
          )}

          {/* 成功 */}
          {syncState === 'done' && syncResult && (
            <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#065f46', lineHeight: 1.7 }}>
              ✅ 同步完成 — 新增 {syncResult.synced} 張 · 已存在 {syncResult.already} 張 · 財政部共回傳 {syncResult.total} 張
            </div>
          )}

          {/* 錯誤 */}
          {syncState === 'error' && syncError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#991b1b', lineHeight: 1.6 }}>
              ❌ {syncError}
            </div>
          )}

          {/* 手機條碼輸入 */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 5, fontWeight: 600 }}>手機條碼（/XXXXXXX）</div>
            <input
              value={cardNo}
              onChange={e => { setCardNo(e.target.value.toUpperCase()); setSyncState('idle'); }}
              placeholder="/ABC1234"
              maxLength={8}
              style={{
                width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 12,
                padding: '11px 14px', fontSize: 15, color: '#1e1b4b',
                boxSizing: 'border-box', fontFamily: 'monospace', letterSpacing: 1,
                outline: 'none',
              }}
            />
          </div>

          {/* 驗證碼輸入 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 5, fontWeight: 600 }}>
              手機條碼驗證碼
              <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: 6 }}>（每次輸入，不儲存）</span>
            </div>
            <input
              ref={encryptRef}
              type="password"
              value={cardEncrypt}
              onChange={e => { setCardEncrypt(e.target.value); setSyncState('idle'); }}
              placeholder="在財政部電子發票平台設定的驗證碼"
              autoComplete="off"
              style={{
                width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 12,
                padding: '11px 14px', fontSize: 14, color: '#1e1b4b',
                boxSizing: 'border-box', outline: 'none',
              }}
            />
          </div>

          {/* 月份選擇（多選） */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, fontWeight: 600 }}>查詢月份（可多選，每月分別查詢）</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {MONTHS.map(m => (
                <button key={m} onClick={() => toggleMonth(m)} style={{
                  flex: 1, padding: '8px 0', borderRadius: 10, cursor: 'pointer',
                  border: syncMonths.includes(m) ? '2px solid #f43f5e' : '1.5px solid #e2e8f0',
                  background: syncMonths.includes(m) ? '#fff1f2' : '#f8fafc',
                  color: syncMonths.includes(m) ? '#f43f5e' : '#64748b',
                  fontSize: 13, fontWeight: syncMonths.includes(m) ? 700 : 500,
                }}>{m.slice(5)}月</button>
              ))}
            </div>
          </div>

          {/* 同步按鈕 */}
          <button
            onClick={sync}
            disabled={syncState === 'syncing'}
            style={{
              width: '100%', padding: '13px', borderRadius: 12, border: 'none',
              background: syncState === 'syncing' ? '#f1f5f9' : 'linear-gradient(135deg, #f59e0b, #f43f5e)',
              color: syncState === 'syncing' ? '#94a3b8' : '#fff',
              fontWeight: 700, fontSize: 15, cursor: syncState === 'syncing' ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {syncState === 'syncing' ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(148,163,184,0.3)', borderTopColor: '#94a3b8', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                同步中…
              </>
            ) : '同步財政部電子發票'}
          </button>

          <div style={{ marginTop: 10, fontSize: 11, color: '#94a3b8', textAlign: 'center', lineHeight: 1.5 }}>
            資料來源：財政部電子發票整合服務平台 · 驗證碼不會被儲存
          </div>
        </div>

        {/* ── 發票清單 ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid rgba(244,63,94,0.15)', borderTopColor: '#f43f5e', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '72px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🧾</div>
            <div style={{ color: '#1e1b4b', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>此月份沒有發票</div>
            <div style={{ color: '#94a3b8', fontSize: 13 }}>填入手機條碼與驗證碼，點同步即可取得</div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
            {invoices.map((inv, i) => (
              <div key={inv.id} className="inv-row" style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                borderBottom: i < invoices.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 13,
                  background: inv.source === 'MOF_CARRIER' ? '#ecfdf5' : '#f0f9ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>{inv.source === 'MOF_CARRIER' ? '🏛️' : '🧾'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {inv.sellerName}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, display: 'flex', gap: 6 }}>
                    <span>{inv.invoiceNo}</span>
                    <span>·</span>
                    <span>{new Date(inv.invoiceDate).toLocaleDateString('zh-TW')}</span>
                    {inv.source === 'MOF_CARRIER' && (
                      <span style={{ color: '#059669', fontWeight: 600 }}>財政部</span>
                    )}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#f43f5e', flexShrink: 0 }}>
                  NT$ {Number(inv.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
