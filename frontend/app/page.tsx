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

  function startNow() {
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
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .main-btn:active { transform: scale(0.97); }
        .sub-btn:active { transform: scale(0.97); }
      `}</style>

      {/* Glow */}
      <div style={{
        position: 'absolute', top: '18%', left: '50%',
        transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(91,95,199,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        animation: 'fadeUp 0.5s ease both',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: '100%', maxWidth: 340,
      }}>

        {/* Icon */}
        <div style={{
          width: 80, height: 80, borderRadius: 28, marginBottom: 24,
          background: 'rgba(91,95,199,0.15)',
          border: '1.5px solid rgba(91,95,199,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
        }}>💰</div>

        {/* Title */}
        <div style={{
          color: '#fff', fontSize: 44, fontWeight: 800,
          letterSpacing: '-2px', marginBottom: 10, lineHeight: 1,
        }}>錢跡</div>

        {/* Tagline */}
        <div style={{
          color: 'rgba(255,255,255,0.35)', fontSize: 17,
          marginBottom: 32, textAlign: 'center',
        }}>個人財務全自動整合</div>

        {/* Feature chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 40 }}>
          {[
            { icon: '📧', text: 'Gmail 自動抓發票' },
            { icon: '🏦', text: '銀行 CSV 匯入' },
            { icon: '📊', text: '每月收支報表' },
            { icon: '🧾', text: '電子發票管理' },
            { icon: '🏛️', text: '統一發票對獎' },
          ].map(f => (
            <div key={f.text} style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 20, padding: '6px 13px', fontSize: 12,
              color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span>{f.icon}</span><span>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <button
          className="main-btn"
          onClick={startNow}
          style={{
            background: 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)',
            color: '#fff', border: 'none', borderRadius: 20,
            fontSize: 18, fontWeight: 800, padding: '20px 0',
            cursor: 'pointer',
            boxShadow: '0 14px 44px rgba(91,95,199,0.45)',
            width: '100%', letterSpacing: '-0.3px',
            transition: 'transform 0.12s, box-shadow 0.12s',
          }}
        >
          免費試用
        </button>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 10, textAlign: 'center' }}>
          無需註冊 · 無需信用卡 · Gmail 授權一次自動同步
        </div>

        {/* Login link */}
        <button
          className="sub-btn"
          onClick={() => router.push('/login')}
          style={{
            background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.35)', fontSize: 14,
            marginTop: 20, cursor: 'pointer', padding: '8px 24px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
        >
          已有帳號？登入
        </button>
      </div>
    </div>
  );
}
