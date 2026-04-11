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

type SyncState   = 'idle' | 'syncing' | 'done' | 'error' | 'no_app_id';
type GmailState  = 'loading' | 'disconnected' | 'connected' | 'syncing' | 'done' | 'error';

interface GmailStatus {
  connected: boolean;
  googleEmail?: string;
  lastSyncedAt?: string;
}

interface GmailResult {
  imported: number; duplicated: number; failed: number; total: number; syncedAt?: string;
}

// Source icon / label
function sourceLabel(source: string) {
  if (source === 'MOF_CARRIER') return { icon: '🏛️', label: '財政部', color: '#059669', bg: '#ecfdf5' };
  if (source === 'EMAIL_IMPORT') return { icon: '📧', label: 'Gmail', color: '#7c3aed', bg: '#f5f3ff' };
  return { icon: '🧾', label: '手動', color: '#0369a1', bg: '#f0f9ff' };
}

export default function InvoicesPage() {
  useAuthGuard();
  const { apiFetch, demoMode } = useAuth();

  const [invoices,    setInvoices]    = useState<Invoice[]>([]);
  const [listMonth,   setListMonth]   = useState(MONTHS[0]);
  const [loading,     setLoading]     = useState(true);

  // ── MOF 手機條碼同步 ─────────────────────────────────────────────────────
  const [cardNo,      setCardNo]      = useState('');
  const [cardEncrypt, setCardEncrypt] = useState('');
  const [syncMonths,  setSyncMonths]  = useState<string[]>([MONTHS[0]]);
  const [syncState,   setSyncState]   = useState<SyncState>('idle');
  const [syncResult,  setSyncResult]  = useState<{ synced: number; already: number; total: number } | null>(null);
  const [syncError,   setSyncError]   = useState('');
  const encryptRef = useRef<HTMLInputElement>(null);

  // ── Gmail 連接狀態 ───────────────────────────────────────────────────────
  const [gmailState,  setGmailState]  = useState<GmailState>('loading');
  const [gmailStatus, setGmailStatus] = useState<GmailStatus>({ connected: false });
  const [gmailResult, setGmailResult] = useState<GmailResult | null>(null);
  const [gmailError,  setGmailError]  = useState('');

  // 載入既有 MOF 綁定的 cardNo
  useEffect(() => {
    apiFetch('/invoices/carrier/binding')
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j?.data?.cardNo) setCardNo(j.data.cardNo); })
      .catch(() => {});
  }, []);

  // 載入 Gmail 綁定狀態
  async function loadGmailStatus() {
    try {
      const r = await apiFetch('/gmail/status');
      const j = await r.json();
      const data: GmailStatus = j.data ?? j;
      setGmailStatus(data);
      setGmailState(data.connected ? 'connected' : 'disconnected');
    } catch {
      setGmailState('disconnected');
    }
  }
  useEffect(() => { loadGmailStatus(); }, []);

  // 處理 OAuth callback 結果（URL query param）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const gmail  = params.get('gmail');
    if (gmail === 'connected') {
      loadGmailStatus();
      setGmailState('connected');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (gmail === 'error') {
      const reason = params.get('reason') ?? '';
      setGmailState('error');
      setGmailError(reason === 'no_refresh_token'
        ? '連接失敗：請重新授權以取得完整權限（點「允許」時確認勾選）'
        : reason === 'token_exchange'
        ? '連接失敗：授權碼交換失敗，請稍後再試'
        : '連接 Gmail 時發生錯誤，請稍後再試');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (gmail === 'cancelled') {
      setGmailState('disconnected');
      window.history.replaceState({}, '', window.location.pathname);
    }
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

  // ── Gmail 連接 ────────────────────────────────────────────────────────────
  async function connectGmail() {
    if (demoMode) {
      setGmailState('error');
      setGmailError('示範模式不支援 Gmail 連接。請建立正式帳號後使用。');
      return;
    }
    try {
      const r = await apiFetch('/gmail/connect/start');
      const j = await r.json();
      const url: string = j.data?.url ?? j.url ?? '';
      if (!url) throw new Error('no url');
      window.location.href = url;  // redirect to Google OAuth
    } catch {
      setGmailState('error');
      setGmailError('無法取得 Google 授權網址，請稍後再試');
    }
  }

  // ── Gmail 手動同步 ────────────────────────────────────────────────────────
  async function syncGmail() {
    setGmailState('syncing');
    setGmailError('');
    setGmailResult(null);
    try {
      const r = await apiFetch('/gmail/sync-invoices', { method: 'POST' });
      const j = await r.json();
      if (!r.ok) {
        setGmailState('error');
        setGmailError(j.data?.message ?? j.message ?? '同步失敗');
        return;
      }
      const data: GmailResult = j.data ?? j;
      setGmailResult(data);
      setGmailState('done');
      // 更新最近同步時間
      setGmailStatus(prev => ({ ...prev, lastSyncedAt: data.syncedAt ?? new Date().toISOString() }));
      await loadInvoices();
    } catch {
      setGmailState('error');
      setGmailError('網路錯誤，請稍後再試');
    }
  }

  // ── Gmail 解除綁定 ────────────────────────────────────────────────────────
  async function disconnectGmail() {
    if (!confirm('確定要解除 Gmail 綁定嗎？')) return;
    try {
      await apiFetch('/gmail/disconnect', { method: 'DELETE' });
      setGmailStatus({ connected: false });
      setGmailState('disconnected');
      setGmailResult(null);
    } catch {
      setGmailState('error');
      setGmailError('解除綁定失敗，請稍後再試');
    }
  }

  // ── MOF 手機條碼同步 ──────────────────────────────────────────────────────
  function toggleMonth(m: string) {
    setSyncMonths(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m],
    );
  }

  async function syncMof() {
    if (demoMode) {
      setSyncState('error');
      setSyncError('示範模式不支援真實同步。請建立帳號後使用此功能。');
      return;
    }
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
      setSyncResult({ synced: result.synced ?? 0, already: result.already ?? 0, total: result.total ?? 0 });
      setSyncState('done');
      setCardEncrypt('');
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

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ── Gmail 電子發票自動匯入卡片 ────────────────────────────────── */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '18px 16px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)', marginBottom: 16 }}>
          {/* 標題列 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e1b4b' }}>Gmail 電子發票自動匯入</div>
            <span style={{ fontSize: 10, background: '#f5f3ff', color: '#7c3aed', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>
              {gmailStatus.connected ? '已連接' : '未連接'}
            </span>
          </div>

          {/* 隱私說明 */}
          <div style={{ background: '#fafaf9', borderRadius: 10, padding: '9px 13px', marginBottom: 14, fontSize: 12, color: '#78716c', lineHeight: 1.7 }}>
            📧 <strong>只讀取電子發票通知郵件</strong>，不讀取其他私人信件。<br />
            系統僅掃描主旨含「電子發票」等關鍵字的郵件，不存取信件全文。
          </div>

          {/* loading */}
          {gmailState === 'loading' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ display: 'inline-block', width: 24, height: 24, border: '2.5px solid rgba(124,58,237,0.15)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            </div>
          )}

          {/* 未連接狀態 */}
          {(gmailState === 'disconnected' || gmailState === 'error') && !gmailStatus.connected && (
            <button
              onClick={connectGmail}
              style={{
                width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              <span style={{ fontSize: 18 }}>📧</span>
              連接 Gmail
            </button>
          )}

          {/* 錯誤訊息 */}
          {gmailState === 'error' && gmailError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginTop: 10, fontSize: 13, color: '#991b1b', lineHeight: 1.6 }}>
              ❌ {gmailError}
              <button onClick={() => { setGmailState(gmailStatus.connected ? 'connected' : 'disconnected'); setGmailError(''); }}
                style={{ marginLeft: 10, fontSize: 12, color: '#991b1b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                關閉
              </button>
            </div>
          )}

          {/* 已連接狀態 */}
          {gmailStatus.connected && gmailState !== 'loading' && (
            <>
              {/* 帳號資訊 */}
              <div style={{ background: '#f5f3ff', borderRadius: 10, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>📧</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#4c1d95', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {gmailStatus.googleEmail}
                  </div>
                  <div style={{ fontSize: 11, color: '#7c3aed', marginTop: 2 }}>
                    {gmailStatus.lastSyncedAt
                      ? `最近同步：${new Date(gmailStatus.lastSyncedAt).toLocaleString('zh-TW')}`
                      : '尚未同步'}
                  </div>
                </div>
              </div>

              {/* 同步結果 */}
              {gmailState === 'done' && gmailResult && (
                <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#065f46', lineHeight: 1.7 }}>
                  ✅ 同步完成 — 匯入 {gmailResult.imported} 張 · 已存在 {gmailResult.duplicated} 張 · 無法解析 {gmailResult.failed} 張 · 共掃描 {gmailResult.total} 封郵件
                </div>
              )}

              {/* 同步錯誤 */}
              {gmailState === 'error' && gmailError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#991b1b', lineHeight: 1.6 }}>
                  ❌ {gmailError}
                </div>
              )}

              {/* 按鈕列 */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={syncGmail}
                  disabled={gmailState === 'syncing'}
                  style={{
                    flex: 3, padding: '12px', borderRadius: 12, border: 'none', cursor: gmailState === 'syncing' ? 'not-allowed' : 'pointer',
                    background: gmailState === 'syncing' ? '#f1f5f9' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                    color: gmailState === 'syncing' ? '#94a3b8' : '#fff',
                    fontWeight: 700, fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {gmailState === 'syncing' ? (
                    <>
                      <div style={{ width: 15, height: 15, border: '2px solid rgba(148,163,184,0.3)', borderTopColor: '#94a3b8', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      同步中…
                    </>
                  ) : '立即同步發票'}
                </button>
                <button
                  onClick={disconnectGmail}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0',
                    background: '#fff', color: '#94a3b8', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  解除
                </button>
              </div>

              <div style={{ marginTop: 10, fontSize: 11, color: '#a78bfa', textAlign: 'center', lineHeight: 1.5 }}>
                僅掃描主旨含電子發票關鍵字的郵件 · 自動去重 · 不儲存信件原文
              </div>
            </>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── 手機條碼載具同步卡片（財政部）────────────────────────────── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '18px 16px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e1b4b' }}>手機條碼載具同步</div>
            <span style={{ fontSize: 10, background: '#fef3c7', color: '#b45309', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>
              財政部 · 申請中
            </span>
          </div>

          {demoMode && (
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#0369a1', lineHeight: 1.7 }}>
              ℹ️ 示範模式僅供體驗，真實發票同步需建立正式帳號。
            </div>
          )}

          {syncState === 'no_app_id' && (
            <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#92400e', lineHeight: 1.7 }}>
              <strong>系統尚未完成財政部 API 授權設定</strong><br />
              需向財政部申請 appID（需 ISO 27001 企業認證），期間請使用 Gmail 匯入方式。
            </div>
          )}

          {syncState === 'done' && syncResult && (
            <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#065f46', lineHeight: 1.7 }}>
              ✅ 同步完成 — 新增 {syncResult.synced} 張 · 已存在 {syncResult.already} 張 · 共 {syncResult.total} 張
            </div>
          )}

          {syncState === 'error' && syncError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#991b1b', lineHeight: 1.6 }}>
              ❌ {syncError}
            </div>
          )}

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 5, fontWeight: 600 }}>手機條碼（/XXXXXXX）</div>
            <input
              value={cardNo}
              onChange={e => { setCardNo(e.target.value.toUpperCase()); setSyncState('idle'); }}
              placeholder="/ABC1234"
              maxLength={8}
              style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '11px 14px', fontSize: 15, color: '#1e1b4b', boxSizing: 'border-box', fontFamily: 'monospace', letterSpacing: 1, outline: 'none' }}
            />
          </div>

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
              style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: '#1e1b4b', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, fontWeight: 600 }}>查詢月份（可多選）</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {MONTHS.map(m => (
                <button key={m} onClick={() => toggleMonth(m)} style={{
                  flex: 1, padding: '8px 0', borderRadius: 10, cursor: 'pointer',
                  border: syncMonths.includes(m) ? '2px solid #f59e0b' : '1.5px solid #e2e8f0',
                  background: syncMonths.includes(m) ? '#fffbeb' : '#f8fafc',
                  color: syncMonths.includes(m) ? '#b45309' : '#64748b',
                  fontSize: 13, fontWeight: syncMonths.includes(m) ? 700 : 500,
                }}>{m.slice(5)}月</button>
              ))}
            </div>
          </div>

          <button
            onClick={syncMof}
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
            <div style={{ color: '#94a3b8', fontSize: 13 }}>連接 Gmail 或填入手機條碼後同步即可取得</div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
            {invoices.map((inv, i) => {
              const src = sourceLabel(inv.source);
              return (
                <div key={inv.id} className="inv-row" style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                  borderBottom: i < invoices.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 13,
                    background: src.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0,
                  }}>{src.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inv.sellerName}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span>{inv.invoiceNo}</span>
                      <span>·</span>
                      <span>{new Date(inv.invoiceDate).toLocaleDateString('zh-TW')}</span>
                      <span style={{ color: src.color, fontWeight: 600 }}>{src.label}</span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#f43f5e', flexShrink: 0 }}>
                    NT$ {Number(inv.amount).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
