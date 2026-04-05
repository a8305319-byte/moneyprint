'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';

export default function Landing() {
  const { user, loading, enterDemo } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace('/app');
  }, [loading, user]);

  function handleDemo() {
    enterDemo();
    router.push('/app');
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 28px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      userSelect: 'none',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .landing-cta:hover { transform: translateY(-2px); box-shadow: 0 18px 50px rgba(91,95,199,0.55) !important; }
        .landing-cta:active { transform: scale(0.98); }
        .landing-demo:hover { background: rgba(255,255,255,0.08) !important; }
        .landing-demo:active { transform: scale(0.98); }
      `}</style>

      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '22%', left: '50%',
        transform: 'translateX(-50%)',
        width: 360, height: 360, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(91,95,199,0.13) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        animation: 'fadeIn 0.5s ease both',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: '100%', maxWidth: 360,
      }}>

        {/* Icon */}
        <div style={{
          width: 76, height: 76, borderRadius: 26, marginBottom: 24,
          background: 'rgba(91,95,199,0.14)',
          border: '1.5px solid rgba(91,95,199,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34,
        }}>💰</div>

        {/* Title */}
        <div style={{
          color: '#fff', fontSize: 40, fontWeight: 800,
          letterSpacing: '-1.5px', marginBottom: 10, lineHeight: 1,
        }}>MoneyPrint</div>

        {/* Tagline */}
        <div style={{
          color: 'rgba(255,255,255,0.38)', fontSize: 16,
          marginBottom: 44, textAlign: 'center', letterSpacing: '-0.1px',
        }}>記帳，就這麼簡單</div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['快速整理', '操作簡單', '結果清楚'].map(f => (
            <div key={f} style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 20, padding: '7px 16px',
              color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 500,
            }}>{f}</div>
          ))}
        </div>

        {/* Primary CTA */}
        <button
          className="landing-cta"
          onClick={() => router.push('/login')}
          style={{
            background: 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)',
            color: '#fff', border: 'none', borderRadius: 18,
            fontSize: 17, fontWeight: 700, padding: '19px 0',
            cursor: 'pointer',
            boxShadow: '0 12px 40px rgba(91,95,199,0.42)',
            letterSpacing: '-0.2px', width: '100%',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
        >
          開始使用
        </button>

        {/* Demo CTA */}
        <button
          className="landing-demo"
          onClick={handleDemo}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 18, color: 'rgba(255,255,255,0.65)',
            fontSize: 15, fontWeight: 600, padding: '16px 0',
            cursor: 'pointer', width: '100%', marginTop: 10,
            transition: 'background 0.15s',
          }}
        >
          立即體驗
        </button>

        {/* Demo hint */}
        <div style={{
          color: 'rgba(255,255,255,0.22)', fontSize: 12,
          marginTop: 10, textAlign: 'center',
        }}>
          不用註冊，直接試用
        </div>

        <div style={{
          color: 'rgba(255,255,255,0.1)', fontSize: 11,
          marginTop: 44, letterSpacing: '0.5px',
        }}>個人帳務管理工具</div>
      </div>
    </div>
  );
}
