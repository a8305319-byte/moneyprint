'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '../hooks/useAuthGuard';

export default function AccountsPage() {
  useAuthGuard();
  const { user, logout, switchMode, updateProfile, demoMode } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadOk, setUploadOk] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [quota, setQuota] = useState(String(user?.invoiceQuota ?? 0));
  const [savingQuota, setSavingQuota] = useState(false);
  const [quotaSaved, setQuotaSaved] = useState(false);
  const [switchingMode, setSwitchingMode] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function upload() {
    if (demoMode) {
      setUploadError('示範模式不支援匯入，請先建立帳號以使用完整功能');
      return;
    }
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true); setUploadError(''); setUploadOk(false);
    const form = new FormData();
    form.append('file', file);
    form.append('accountId', 'default');
    try {
      const t = localStorage.getItem('mp_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/bank-imports/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}` },
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setUploadOk(true);
      setUploadCount(json.data?.rowCount ?? 0);
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (e: any) {
      const msg = e.message ?? '上傳失敗';
      setUploadError(msg.includes('format') || msg.includes('格式')
        ? '檔案格式不符，請匯出 CSV 或 XLSX 再試'
        : '上傳失敗，請確認檔案後再試');
    }
    finally { setUploading(false); }
  }

  async function saveQuota() {
    setSavingQuota(true); setQuotaSaved(false);
    await updateProfile({ invoiceQuota: Number(quota) });
    setSavingQuota(false); setQuotaSaved(true);
    setTimeout(() => setQuotaSaved(false), 2500);
  }

  async function handleSwitchMode(m: 'PERSONAL' | 'BUSINESS') {
    setSwitchingMode(true);
    await switchMode(m);
    setSwitchingMode(false);
  }

  function doLogout() {
    const wasDemo = demoMode;
    logout();
    router.replace(wasDemo ? '/' : '/login');
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#f4f6fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #5b5fc7 100%)', padding: '56px 20px 28px' }}>
        {demoMode ? (
          /* Demo header — no fake email, clear CTA */
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{
                display: 'inline-block', background: 'rgba(255,255,255,0.12)',
                borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700,
                color: 'rgba(255,255,255,0.7)', letterSpacing: '0.6px',
                textTransform: 'uppercase', marginBottom: 10,
              }}>示範模式</div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
                資料僅存本機
              </div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.5 }}>
                建立帳號，雲端同步不怕遺失
              </div>
            </div>
            <button onClick={doLogout} style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 20, color: 'rgba(255,255,255,0.6)', fontSize: 12,
              padding: '7px 16px', cursor: 'pointer',
            }}>結束示範</button>
          </div>
        ) : (
          /* Real user header */
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{
                width: 50, height: 50, borderRadius: 16,
                background: 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, marginBottom: 10,
              }}>👤</div>
              <div style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>{user?.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>{user?.email}</div>
            </div>
            <button onClick={doLogout} style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 20, color: 'rgba(255,255,255,0.6)', fontSize: 12,
              padding: '7px 16px', cursor: 'pointer',
            }}>登出</button>
          </div>
        )}
      </div>

      <div style={{ padding: '16px' }}>

        {/* Demo CTA card */}
        {demoMode && (
          <div style={{
            background: 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)',
            borderRadius: 20, padding: '20px',
            boxShadow: '0 8px 28px rgba(91,95,199,0.35)', marginBottom: 14,
          }}>
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
              建立帳號，資料永久保存
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
              示範模式的記錄僅存在本裝置瀏覽器。<br />建立免費帳號，所有記錄雲端同步、跨裝置存取。
            </div>
            <Link href="/login" style={{
              display: 'block', textAlign: 'center',
              background: '#fff', borderRadius: 14,
              color: '#5b5fc7', fontSize: 15, fontWeight: 800,
              padding: '14px', textDecoration: 'none',
            }}>免費建立帳號</Link>
          </div>
        )}

        {/* Mode switcher */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1e1b4b', marginBottom: 4 }}>記帳模式</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>切換後所有頁面會跟著改變</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {([
              ['PERSONAL', '個人', '👤', '日常支出與收入'],
              ['BUSINESS', '公司', '🏢', '發票與稅務管理'],
            ] as const).map(([m, label, icon, sub]) => (
              <button key={m} onClick={() => handleSwitchMode(m)} disabled={switchingMode} style={{
                padding: '16px 12px', borderRadius: 16, border: '2px solid',
                borderColor: user?.mode === m ? '#5b5fc7' : '#e2e8f0',
                background: user?.mode === m ? '#eff2ff' : '#f8fafc',
                color: user?.mode === m ? '#5b5fc7' : '#64748b',
                fontWeight: user?.mode === m ? 700 : 500, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: 24 }}>{icon}</span>
                <span style={{ fontSize: 14 }}>{label}</span>
                <span style={{ fontSize: 10, color: user?.mode === m ? 'rgba(91,95,199,0.7)' : '#94a3b8', fontWeight: 400 }}>{sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Business settings */}
        {user?.mode === 'BUSINESS' && !demoMode && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1e1b4b', marginBottom: 16 }}>公司資料</div>
            {[
              ['公司名稱', user.companyName],
              ['統一編號', user.taxId],
            ].map(([label, value]) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, color: value ? '#1e1b4b' : '#cbd5e1', fontWeight: 600 }}>
                  {value ?? '未填寫'}
                </div>
              </div>
            ))}
            <div style={{ height: 1, background: '#f1f5f9', margin: '14px 0' }} />
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>本月最多可開幾張發票</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number" value={quota} onChange={e => setQuota(e.target.value)}
                style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '11px 14px', fontSize: 14, outline: 'none', color: '#1e1b4b' }}
                onFocus={e => (e.target.style.borderColor = '#5b5fc7')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
              />
              <button onClick={saveQuota} disabled={savingQuota} style={{
                background: quotaSaved ? '#10b981' : '#5b5fc7',
                border: 'none', borderRadius: 12, color: '#fff', fontWeight: 600,
                fontSize: 13, padding: '11px 18px', cursor: 'pointer', minWidth: 60,
                transition: 'background 0.3s',
              }}>{savingQuota ? '...' : quotaSaved ? '✓' : '儲存'}</button>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          {[
            { href: '/invoices', icon: '🧾', label: '電子發票', sub: '同步手機載具', demoSub: '需真實帳號才能同步' },
            { href: '/matches',  icon: '⇄',  label: '交易配對', sub: '帳單 × 發票',  demoSub: '需匯入銀行對帳單' },
          ].map(c => (
            <Link key={c.href} href={c.href} style={{
              background: '#fff', borderRadius: 18, padding: '18px 16px',
              textDecoration: 'none', boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
              display: 'block',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e1b4b' }}>{c.label}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                {demoMode ? c.demoSub : c.sub}
              </div>
            </Link>
          ))}
        </div>

        {/* Bank CSV import — live, redirect to ledger page */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1e1b4b' }}>匯入銀行對帳單</div>
            <span style={{ fontSize: 10, background: '#ecfdf5', color: '#059669', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>已開放</span>
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
            支援中信、富邦、國泰、玉山、台新、永豐 · CSV / UTF-8 / Big5 自動偵測
          </div>
          <button
            onClick={() => router.push('/ledger')}
            style={{
              width: '100%', background: 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)',
              border: 'none', borderRadius: 14, color: '#fff',
              fontWeight: 700, fontSize: 15, padding: '15px', cursor: 'pointer',
            }}
          >前往帳本匯入 →</button>
        </div>
      </div>
    </div>
  );
}
