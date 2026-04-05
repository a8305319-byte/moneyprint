'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AccountsPage() {
  const { user, logout, switchMode, updateProfile, apiFetch } = useAuth();
  const router = useRouter();
  const [accountId, setAccountId] = useState('acc-default');
  const [uploading, setUploading] = useState(false);
  const [uploadOk, setUploadOk] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [error, setError] = useState('');
  const [quota, setQuota] = useState(String(user?.invoiceQuota ?? 0));
  const [savingQuota, setSavingQuota] = useState(false);
  const [quotaSaved, setQuotaSaved] = useState(false);
  const [switchingMode, setSwitchingMode] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true); setError(''); setUploadOk(false);
    const form = new FormData();
    form.append('file', file);
    form.append('accountId', accountId);
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
    } catch (e: any) { setError(e.message ?? '上傳失敗'); }
    finally { setUploading(false); }
  }

  async function saveQuota() {
    setSavingQuota(true); setQuotaSaved(false);
    await updateProfile({ invoiceQuota: Number(quota) });
    setSavingQuota(false); setQuotaSaved(true);
    setTimeout(() => setQuotaSaved(false), 2000);
  }

  async function handleSwitchMode(m: 'PERSONAL' | 'BUSINESS') {
    setSwitchingMode(true);
    await switchMode(m);
    setSwitchingMode(false);
  }

  function doLogout() { logout(); router.replace('/login'); }

  return (
    <div style={{ minHeight: '100dvh', background: '#f4f6fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #5b5fc7 100%)', padding: '56px 20px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{
              width: 52, height: 52, borderRadius: 18,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, marginBottom: 12,
            }}>👤</div>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>{user?.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 }}>{user?.email}</div>
          </div>
          <button onClick={doLogout} style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 20, color: 'rgba(255,255,255,0.8)', fontSize: 12,
            padding: '7px 16px', cursor: 'pointer',
          }}>登出</button>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Mode switcher */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1e1b4b', marginBottom: 14 }}>使用模式</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {([['PERSONAL', '個人記帳', '👤'], ['BUSINESS', '公司帳務', '🏢']] as const).map(([m, label, icon]) => (
              <button key={m} onClick={() => handleSwitchMode(m)} disabled={switchingMode} style={{
                padding: '16px 12px', borderRadius: 16, border: '2px solid',
                borderColor: user?.mode === m ? '#5b5fc7' : '#e2e8f0',
                background: user?.mode === m ? '#eff2ff' : '#f8fafc',
                color: user?.mode === m ? '#5b5fc7' : '#64748b',
                fontWeight: user?.mode === m ? 700 : 500, cursor: 'pointer', fontSize: 14,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: 22 }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Business settings */}
        {user?.mode === 'BUSINESS' && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1e1b4b', marginBottom: 16 }}>公司資料</div>
            {[
              { label: '公司名稱', value: user.companyName },
              { label: '統一編號', value: user.taxId },
            ].map(r => (
              <div key={r.label} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 3 }}>{r.label}</div>
                <div style={{ fontSize: 14, color: '#1e1b4b', fontWeight: 600 }}>{r.value ?? '未設定'}</div>
              </div>
            ))}
            <div style={{ height: 1, background: '#f1f5f9', margin: '16px 0' }} />
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>每月可開發票張數</div>
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
                fontSize: 13, padding: '11px 18px', cursor: 'pointer', transition: 'background 0.2s',
              }}>{savingQuota ? '儲存中' : quotaSaved ? '已儲存 ✓' : '儲存'}</button>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          {[
            { href: '/invoices', icon: '🧾', label: '電子發票', sub: '同步手機載具' },
            { href: '/matches', icon: '⇄', label: '交易配對', sub: '比對帳單發票' },
          ].map(c => (
            <Link key={c.href} href={c.href} style={{
              background: '#fff', borderRadius: 18, padding: '18px',
              textDecoration: 'none', boxShadow: '0 2px 12px rgba(15,23,42,0.06)', display: 'block',
            }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e1b4b' }}>{c.label}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>{c.sub}</div>
            </Link>
          ))}
        </div>

        {/* Bank upload */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1e1b4b', marginBottom: 16 }}>匯入銀行對帳單</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>帳戶代號</div>
            <input
              value={accountId} onChange={e => setAccountId(e.target.value)}
              style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '10px 14px', fontSize: 14, outline: 'none', color: '#1e1b4b', boxSizing: 'border-box' }}
              onFocus={e => (e.target.style.borderColor = '#5b5fc7')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>
          <label style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            border: `2px dashed ${selectedFile ? '#5b5fc7' : '#e2e8f0'}`,
            borderRadius: 14, padding: '28px 20px', cursor: 'pointer',
            background: selectedFile ? '#eff2ff' : '#f8fafc', marginBottom: 12,
            transition: 'all 0.2s',
          }}>
            <input ref={fileRef} type="file" accept=".csv,.xlsx" style={{ display: 'none' }}
              onChange={e => setSelectedFile(e.target.files?.[0] ?? null)} />
            <div style={{ fontSize: 30, marginBottom: 8 }}>{selectedFile ? '📄' : '📁'}</div>
            <div style={{ fontSize: 13, color: selectedFile ? '#5b5fc7' : '#94a3b8', fontWeight: 600 }}>
              {selectedFile ? selectedFile.name : '點擊選取 CSV 或 XLSX'}
            </div>
          </label>
          <button onClick={upload} disabled={uploading || !selectedFile} style={{
            width: '100%',
            background: !selectedFile ? '#e2e8f0' : 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)',
            border: 'none', borderRadius: 14, color: !selectedFile ? '#94a3b8' : '#fff',
            fontWeight: 700, fontSize: 15, padding: '14px', cursor: !selectedFile ? 'not-allowed' : 'pointer',
            boxShadow: !selectedFile ? 'none' : '0 6px 20px rgba(91,95,199,0.35)',
          }}>
            {uploading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                上傳中
              </span>
            ) : '匯入'}
          </button>
          {error && <div style={{ marginTop: 10, background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '10px 14px', color: '#e11d48', fontSize: 13 }}>{error}</div>}
          {uploadOk && (
            <div style={{ marginTop: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', color: '#059669', fontWeight: 600, fontSize: 13, textAlign: 'center' }}>
              匯入成功，共 {uploadCount} 筆交易
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
