'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function AccountsPage() {
  const [accountId, setAccountId] = useState('acc-default');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ importId: string } | null>(null);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true); setError(''); setResult(null);
    const form = new FormData();
    form.append('file', file);
    form.append('accountId', accountId);
    try {
      const res = await fetch(`${API}/bank-imports/upload`, { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setResult(json.data);
    } catch (e: any) {
      setError(e.message ?? '上傳失敗');
    } finally { setUploading(false); }
  }

  const quickLinks = [
    { href: '/invoices', icon: '🧾', label: '電子發票', sub: '同步載具', accent: '#ffd93d' },
    { href: '/matches', icon: '🔗', label: '配對管理', sub: '比對交易', accent: '#6c63ff' },
    { href: '/ledger', icon: '📒', label: '帳本', sub: '查看記錄', accent: '#48cfad' },
    { href: '/reports', icon: '📊', label: '報表', sub: '消費分析', accent: '#f78fb3' },
  ];

  return (
    <div style={{ minHeight: '100dvh', background: '#f5f6fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #6c63ff 100%)', padding: '52px 20px 32px' }}>
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: '-0.3px' }}>設定</div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 5, fontWeight: 500 }}>匯入資料與管理</div>
      </div>

      <div style={{ padding: '16px 16px 32px' }}>
        {/* Quick links grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {quickLinks.map(c => (
            <Link key={c.href} href={c.href} style={{
              background: '#fff', borderRadius: 20, padding: '18px 16px', textDecoration: 'none',
              boxShadow: '0 2px 16px rgba(108,99,255,0.07)', display: 'block',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, background: `${c.accent}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, marginBottom: 10,
              }}>{c.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 3 }}>{c.label}</div>
              <div style={{ fontSize: 12, color: '#8892a4' }}>{c.sub}</div>
            </Link>
          ))}
        </div>

        {/* Upload card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 20px rgba(108,99,255,0.08)', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: '#f0eeff', borderRadius: 10, padding: '5px 8px', fontSize: 18 }}>🏦</span>
            匯入銀行對帳單
          </div>

          {/* Account ID */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: '#8892a4', fontWeight: 600, marginBottom: 7, letterSpacing: '0.3px' }}>帳戶 ID</div>
            <input
              value={accountId} onChange={e => setAccountId(e.target.value)}
              style={{
                width: '100%', border: '1.5px solid #e8ecf4', borderRadius: 12,
                padding: '11px 14px', fontSize: 14, outline: 'none', color: '#1a1a2e',
                boxSizing: 'border-box', background: '#fafbff',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#6c63ff')}
              onBlur={e => (e.target.style.borderColor = '#e8ecf4')}
            />
          </div>

          {/* File picker */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, color: '#8892a4', fontWeight: 600, marginBottom: 7, letterSpacing: '0.3px' }}>選擇 CSV / XLSX 檔案</div>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: `2px dashed ${fileName ? '#6c63ff' : '#dde2ef'}`, borderRadius: 16,
              padding: '28px 20px', cursor: 'pointer',
              background: fileName ? '#fafbff' : '#f9fafc',
              transition: 'all 0.2s',
            }}>
              <input
                ref={fileRef} type="file" accept=".csv,.xlsx" style={{ display: 'none' }}
                onChange={e => setFileName(e.target.files?.[0]?.name ?? '')}
              />
              {fileName ? (
                <>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                  <div style={{ fontSize: 13, color: '#6c63ff', fontWeight: 700, textAlign: 'center', wordBreak: 'break-all' }}>{fileName}</div>
                  <div style={{ fontSize: 11, color: '#8892a4', marginTop: 4 }}>點擊重新選取</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📁</div>
                  <div style={{ fontSize: 13, color: '#6c63ff', fontWeight: 700 }}>點擊選取檔案</div>
                  <div style={{ fontSize: 11, color: '#8892a4', marginTop: 4 }}>支援 CSV、XLSX 格式</div>
                </>
              )}
            </label>
          </div>

          {/* Submit */}
          <button onClick={upload} disabled={uploading || !fileName} style={{
            width: '100%',
            background: uploading || !fileName ? '#c4bfff' : 'linear-gradient(135deg, #6c63ff 0%, #a29bfe 100%)',
            border: 'none', borderRadius: 14, color: '#fff',
            fontWeight: 700, fontSize: 15, padding: '14px',
            cursor: uploading || !fileName ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {uploading ? (
              <>
                <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                上傳中...
              </>
            ) : '上傳並匯入'}
          </button>

          {error && (
            <div style={{ marginTop: 12, background: '#fff0f0', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span style={{ color: '#ff6b6b', fontSize: 13, fontWeight: 500 }}>{error}</span>
            </div>
          )}
          {result && (
            <div style={{ marginTop: 12, background: '#f0fff8', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ color: '#26de81', fontWeight: 800, fontSize: 14, marginBottom: 4 }}>✓ 匯入任務已建立</div>
              <div style={{ color: '#8892a4', fontSize: 11 }}>Import ID: {result.importId}</div>
            </div>
          )}
        </div>

        {/* CSV hint */}
        <div style={{ background: '#fafbff', borderRadius: 16, padding: '14px 16px', border: '1.5px solid #e8ecf4' }}>
          <div style={{ fontSize: 12, color: '#6c63ff', fontWeight: 800, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            📌 CSV 格式說明
          </div>
          <div style={{ fontSize: 12, color: '#8892a4', lineHeight: 1.7 }}>
            第一行為欄位名稱，需包含日期、金額、說明欄位（中英文均可）。<br />
            例如：<span style={{ color: '#6c63ff', fontWeight: 600 }}>日期, 金額, 摘要, 備註</span>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
