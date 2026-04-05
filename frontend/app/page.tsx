'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';

export default function Landing() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace('/app');
  }, [loading, user]);

  if (loading) return null;

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      userSelect: 'none',
    }}>
      {/* Icon */}
      <div style={{
        width: 64, height: 64, borderRadius: 20, marginBottom: 22,
        background: 'rgba(91,95,199,0.15)',
        border: '1px solid rgba(91,95,199,0.3)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 28,
      }}>💰</div>

      {/* Title */}
      <div style={{
        color: '#ffffff',
        fontSize: 34,
        fontWeight: 800,
        letterSpacing: '-0.8px',
        marginBottom: 10,
      }}>
        MoneyPrint
      </div>

      {/* One-liner */}
      <div style={{
        color: 'rgba(255,255,255,0.35)',
        fontSize: 15,
        marginBottom: 52,
        textAlign: 'center',
      }}>
        快速完成你的操作
      </div>

      {/* THE only button */}
      <button
        onClick={() => router.push('/login')}
        style={{
          background: '#5b5fc7',
          color: '#fff',
          border: 'none',
          borderRadius: 16,
          fontSize: 17,
          fontWeight: 700,
          padding: '18px 56px',
          cursor: 'pointer',
          boxShadow: '0 12px 36px rgba(91,95,199,0.5)',
          letterSpacing: '-0.2px',
          width: '100%',
          maxWidth: 320,
        }}
      >
        開始使用
      </button>
    </div>
  );
}
