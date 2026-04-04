'use client';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', name: '', companyName: '', taxId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit() {
    setLoading(true); setError('');
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        await register({ email: form.email, password: form.password, name: form.name, companyName: form.companyName || undefined, taxId: form.taxId || undefined });
      }
      router.replace('/');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const inp = (placeholder: string, key: string, type = 'text') => (
    <input type={type} placeholder={placeholder} value={(form as any)[key]} onChange={set(key)}
      style={{ width: '100%', border: '1.5px solid #e8ecf4', borderRadius: 14, padding: '13px 16px', fontSize: 15, outline: 'none', color: '#1a1a2e', marginBottom: 12, background: '#fafbff' }} />
  );

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(160deg, #6c63ff 0%, #48cfad 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>💰</div>
          <div style={{ color: '#fff', fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>錢跡</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 }}>個人 · 公司 記帳系統</div>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '28px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: '#f5f6fa', borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '9px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#6c63ff' : '#8892a4',
                fontWeight: tab === t ? 700 : 400, fontSize: 14,
                boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}>{t === 'login' ? '登入' : '註冊'}</button>
            ))}
          </div>

          {inp('Email', 'email', 'email')}
          {inp('密碼（至少8位）', 'password', 'password')}
          {tab === 'register' && (
            <>
              {inp('姓名 / 暱稱', 'name')}
              {inp('公司名稱（選填）', 'companyName')}
              {inp('統一編號（選填）', 'taxId')}
            </>
          )}

          {error && <div style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 10, textAlign: 'center' }}>{error}</div>}

          <button onClick={submit} disabled={loading} style={{
            width: '100%', background: loading ? '#a29bfe' : 'linear-gradient(135deg, #6c63ff, #48cfad)',
            border: 'none', borderRadius: 14, color: '#fff', fontWeight: 700, fontSize: 16,
            padding: '15px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
          }}>{loading ? '處理中...' : (tab === 'login' ? '登入' : '建立帳號')}</button>
        </div>
      </div>
    </div>
  );
}
