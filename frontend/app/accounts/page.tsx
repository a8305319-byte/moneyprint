'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function AccountsPage() {
  const { user, logout, switchMode, updateProfile } = useAuth();
  const router = useRouter();
  const [accountId, setAccountId] = useState('acc-default');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ importId: string } | null>(null);
  const [error, setError] = useState('');
  const [quota, setQuota] = useState(String(user?.invoiceQuota ?? 0));
  const [savingQuota, setSavingQuota] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true); setError('');
    const form = new FormData();
    form.append('file', file);
    form.append('accountId', accountId);
    const t = localStorage.getItem('mp_token');
    try {
      const res = await fetch(`${API}/bank-imports/upload`, { method: 'POST', headers: { Authorization: `Bearer ${t}` }, body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setResult(json.data);
    } catch (e: any) { setError(e.message ?? '上傳失敗'); }
    finally { setUploading(false); }
  }

  async function saveQuota() {
    setSavingQuota(true);
    await updateProfile({ invoiceQuota: Number(quota) });
    setSavingQuota(false);
  }

  function doLogout() { logout(); router.replace('/login'); }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--background)' }}>
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #6c63ff 100%)', padding: '48px 20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>⚙️ 設定</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 }}>{user?.email}</div>
          </div>
          <button onClick={doLogout} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 20, color: '#fff', fontSize: 12, padding: '6px 14px', cursor: 'pointer' }}>登出</button>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Mode switcher */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 16px rgba(108,99,255,0.08)', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', marginBottom: 14 }}>🔄 使用模式</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {(['PERSONAL', 'BUSINESS'] as const).map(m => (
              <button key={m} onClick={() => switchMode(m)} style={{
                padding: '14px', borderRadius: 14, border: '2px solid',
                borderColor: user?.mode === m ? '#6c63ff' : '#e8ecf4',
                background: user?.mode === m ? '#f0f0ff' : '#fafbff',
                color: user?.mode === m ? '#6c63ff' : '#8892a4',
                fontWeight: user?.mode === m ? 700 : 400, cursor: 'pointer', fontSize: 14,
              }}>
                {m === 'PERSONAL' ? '👤 個人記帳' : '🏢 公司流水帳'}
              </button>
            ))}
          </div>
        </div>

        {/* Company settings - only in BUSINESS mode */}
        {user?.mode === 'BUSINESS' && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 16px rgba(108,99,255,0.08)', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', marginBottom: 14 }}>🏢 公司設定</div>
            <div style={{ fontSize: 13, color: '#8892a4', marginBottom: 6 }}>公司名稱</div>
            <div style={{ fontSize: 14, color: '#1a1a2e', marginBottom: 12, fontWeight: 600 }}>{user.companyName ?? '未設定'}</div>
            <div style={{ fontSize: 13, color: '#8892a4', marginBottom: 6 }}>統一編號</div>
            <div style={{ fontSize: 14, color: '#1a1a2e', marginBottom: 16, fontWeight: 600 }}>{user.taxId ?? '未設定'}</div>
            <div style={{ fontSize: 13, color: '#8892a4', marginBottom: 6 }}>每月可開發票張數</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" value={quota} onChange={e => setQuota(e.target.value)}
                style={{ flex: 1, border: '1.5px solid #e8ecf4', borderRadius: 12, padding: '10px 14px', fontSize: 14, outline: 'none' }} />
              <button onClick={saveQuota} disabled={savingQuota} style={{
                background: '#6c63ff', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: 13, padding: '10px 16px', cursor: 'pointer',
              }}>{savingQuota ? '儲存中' : '儲存'}</button>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[
            { href: '/invoices', icon: '🧾', label: '電子發票', sub: '同步載具' },
            { href: '/matches', icon: '🔗', label: '配對管理', sub: '比對交易' },
          ].map(c => (
            <Link key={c.href} href={c.href} style={{ background: '#fff', borderRadius: 20, padding: '18px', textDecoration: 'none', boxShadow: '0 2px 16px rgba(108,99,255,0.08)', display: 'block' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>{c.label}</div>
              <div style={{ fontSize: 12, color: '#8892a4', marginTop: 2 }}>{c.sub}</div>
            </Link>
          ))}
        </div>

        {/* Upload */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 16px rgba(108,99,255,0.08)', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', marginBottom: 16 }}>🏦 匯入銀行對帳單</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#8892a4', marginBottom: 6 }}>帳戶 ID</div>
            <input value={accountId} onChange={e => setAccountId(e.target.value)} style={{ width: '100%', border: '1.5px solid #e8ecf4', borderRadius: 12, padding: '10px 14px', fontSize: 14, outline: 'none', color: '#1a1a2e' }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e8ecf4', borderRadius: 12, padding: '24px', cursor: 'pointer', background: '#fafbff', marginBottom: 12 }}>
            <input ref={fileRef} type="file" accept=".csv,.xlsx" style={{ display: 'none' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
              <div style={{ fontSize: 13, color: '#6c63ff', fontWeight: 600 }}>點擊選取 CSV / XLSX</div>
            </div>
          </label>
          <button onClick={upload} disabled={uploading} style={{ width: '100%', background: '#6c63ff', border: 'none', borderRadius: 14, color: '#fff', fontWeight: 700, fontSize: 15, padding: '14px', cursor: 'pointer' }}>{uploading ? '上傳中...' : '上傳並匯入'}</button>
          {error && <div style={{ marginTop: 10, color: '#ff6b6b', fontSize: 13, textAlign: 'center' }}>{error}</div>}
          {result && <div style={{ marginTop: 12, background: '#f0fff8', borderRadius: 12, padding: '12px', textAlign: 'center', color: '#26de81', fontWeight: 700 }}>✓ 匯入成功</div>}
        </div>
      </div>
    </div>
  );
}
