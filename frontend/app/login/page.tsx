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
        await register({
          email: form.email, password: form.password, name: form.name,
          companyName: form.companyName || undefined, taxId: form.taxId || undefined,
        });
      }
      router.replace('/');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const Field = ({ placeholder, k, type = 'text' }: { placeholder: string; k: string; type?: string }) => (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <input
        type={type}
        placeholder={placeholder}
        value={(form as any)[k]}
        onChange={set(k)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        style={{
          width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 14,
          padding: '14px 16px', fontSize: 15, outline: 'none', color: '#1e1b4b',
          background: '#f8fafc', boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => (e.target.style.borderColor = '#5b5fc7')}
        onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
      />
    </div>
  );

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #5b5fc7 0%, #7c3aed 60%, #0f172a 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px 20px',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 24, margin: '0 auto 16px',
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
        }}>💰</div>
        <div style={{ color: '#fff', fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>錢跡</div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>個人與小團隊記帳工具</div>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 400,
        background: '#fff', borderRadius: 28,
        padding: '28px 24px 32px',
        boxShadow: '0 32px 64px rgba(0,0,0,0.25)',
      }}>
        {/* Tab switcher */}
        <div style={{
          display: 'flex', background: '#f1f5f9',
          borderRadius: 14, padding: 4, marginBottom: 24,
        }}>
          {(['login', 'register'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }} style={{
              flex: 1, padding: '10px', borderRadius: 11, border: 'none', cursor: 'pointer',
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? '#5b5fc7' : '#94a3b8',
              fontWeight: tab === t ? 700 : 500, fontSize: 14,
              boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s',
            }}>{t === 'login' ? '登入' : '建立帳號'}</button>
          ))}
        </div>

        <Field placeholder="電子郵件" k="email" type="email" />
        <Field placeholder="密碼（至少 6 位）" k="password" type="password" />
        {tab === 'register' && (
          <>
            <Field placeholder="你的名字" k="name" />
            <Field placeholder="公司名稱（選填）" k="companyName" />
            <Field placeholder="統一編號（選填）" k="taxId" />
          </>
        )}

        {error && (
          <div style={{
            background: '#fff1f2', border: '1px solid #fecdd3',
            borderRadius: 10, padding: '10px 14px',
            color: '#e11d48', fontSize: 13, marginBottom: 12,
          }}>{error}</div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          style={{
            width: '100%', marginTop: 4,
            background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)',
            border: 'none', borderRadius: 14, color: '#fff',
            fontWeight: 700, fontSize: 16, padding: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 8px 24px rgba(91,95,199,0.4)',
            transition: 'all 0.2s',
          }}
        >
          {loading ? '處理中...' : (tab === 'login' ? '登入' : '建立帳號')}
        </button>
      </div>
    </div>
  );
}
