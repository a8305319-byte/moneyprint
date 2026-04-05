'use client';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', name: '', companyName: '', taxId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit() {
    setLoading(true); setError('');
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register({
          email: form.email, password: form.password, name: form.name,
          companyName: form.companyName || undefined, taxId: form.taxId || undefined,
        });
      }
      router.replace('/app');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const s: React.CSSProperties = {
    width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 14,
    padding: '15px 16px', fontSize: 15, outline: 'none', color: '#1e1b4b',
    background: '#f8fafc', boxSizing: 'border-box', display: 'block',
  };

  const Field = ({ placeholder, k, type = 'text' }: { placeholder: string; k: string; type?: string }) => (
    <input
      type={type} placeholder={placeholder} value={(form as any)[k]}
      onChange={set(k)} onKeyDown={e => e.key === 'Enter' && submit()}
      style={s}
      onFocus={e => (e.target.style.borderColor = '#5b5fc7')}
      onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
    />
  );

  return (
    <div style={{
      minHeight: '100dvh', background: '#0f172a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px 20px',
    }}>
      <style>{`@keyframes sp { to { transform: rotate(360deg); } }`}</style>
      {/* Logo area */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20, margin: '0 auto 14px',
          background: 'rgba(91,95,199,0.25)', border: '1px solid rgba(91,95,199,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
        }}>💰</div>
        <div style={{ color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>錢跡</div>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 5 }}>記帳，就這麼簡單</div>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 380,
        background: '#1e293b', borderRadius: 24,
        padding: '28px 24px 24px',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
          {mode === 'login' ? '歡迎回來' : '建立帳號'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Field placeholder="Email" k="email" type="email" />
          <Field placeholder="密碼" k="password" type="password" />
          {mode === 'register' && (
            <>
              <Field placeholder="你叫什麼名字" k="name" />
              <Field placeholder="公司名稱（選填）" k="companyName" />
              <Field placeholder="統一編號（選填）" k="taxId" />
            </>
          )}
        </div>

        {error && (
          <div style={{
            marginTop: 12, background: 'rgba(244,63,94,0.1)',
            border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: 10, padding: '10px 14px',
            color: '#f87171', fontSize: 13,
          }}>{error}</div>
        )}

        <button
          onClick={submit} disabled={loading}
          style={{
            width: '100%', marginTop: 16,
            background: loading ? 'rgba(91,95,199,0.5)' : '#5b5fc7',
            border: 'none', borderRadius: 14, color: '#fff',
            fontWeight: 700, fontSize: 16, padding: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'sp 0.7s linear infinite' }} />
              {mode === 'login' ? '登入中' : '建立中'}
            </span>
          ) : mode === 'login' ? '進入' : '建立帳號'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.35)', fontSize: 13,
            }}
          >
            {mode === 'login' ? '還沒有帳號？建立一個' : '已有帳號？登入'}
          </button>
        </div>
      </div>
    </div>
  );
}
