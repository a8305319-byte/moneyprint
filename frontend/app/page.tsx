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
      minHeight: '100dvh', background: '#0a0a0f',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Logo */}
      <div style={{
        width: 72, height: 72, borderRadius: 24, marginBottom: 20,
        background: 'rgba(91,95,199,0.2)',
        border: '1px solid rgba(91,95,199,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 34,
      }}>💰</div>

      {/* Title */}
      <div style={{
        color: '#fff', fontSize: 36, fontWeight: 800,
        letterSpacing: '-1px', marginBottom: 10,
      }}>錢跡</div>

      {/* Tagline */}
      <div style={{
        color: 'rgba(255,255,255,0.35)', fontSize: 15,
        marginBottom: 48, textAlign: 'center', lineHeight: 1.6,
      }}>記帳，就這麼簡單</div>

      {/* CTA */}
      <button
        onClick={() => router.push('/login')}
        style={{
          background: '#5b5fc7', color: '#fff',
          border: 'none', borderRadius: 16,
          fontSize: 16, fontWeight: 700,
          padding: '17px 48px', cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(91,95,199,0.45)',
          letterSpacing: '-0.2px',
        }}
      >
        開始使用
      </button>

      <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12, marginTop: 32 }}>
        個人 · 小團隊記帳工具
      </div>
    </div>
  );
}
