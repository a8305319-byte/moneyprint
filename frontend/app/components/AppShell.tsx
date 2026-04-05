'use client';
import { useAuth } from '../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import BottomNav from './BottomNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = pathname === '/login';

  useEffect(() => {
    if (!loading && !user && !isPublic) router.replace('/login');
  }, [loading, user, isPublic]);

  if (loading) {
    return (
      <div style={{
        height: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, #5b5fc7 0%, #7c3aed 100%)',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 24,
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, marginBottom: 20,
          backdropFilter: 'blur(8px)',
        }}>💰</div>
        <div style={{ color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>錢跡</div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 6 }}>載入中...</div>
      </div>
    );
  }

  if (!user && !isPublic) return null;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: isPublic ? 0 : 80 }}>
      {children}
      {!isPublic && <BottomNav />}
    </div>
  );
}
