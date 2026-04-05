'use client';
import { useAuth } from '../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import BottomNav from './BottomNav';

const PUBLIC_PATHS = ['/', '/login'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const isNav = !PUBLIC_PATHS.includes(pathname); // show bottom nav on all protected pages

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) router.replace('/login');
  }, [loading, user, isPublic]);

  if (loading) {
    return (
      <div style={{
        height: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#0a0a0f',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 22,
          background: 'rgba(91,95,199,0.2)',
          border: '1px solid rgba(91,95,199,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, marginBottom: 18,
        }}>💰</div>
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>錢跡</div>
      </div>
    );
  }

  if (!user && !isPublic) return null;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: isNav ? 80 : 0 }}>
      {children}
      {isNav && <BottomNav />}
    </div>
  );
}
