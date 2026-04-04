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
      <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
          <div style={{ color: '#6c63ff', fontWeight: 700 }}>錢跡</div>
        </div>
      </div>
    );
  }

  if (!user && !isPublic) return null;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: isPublic ? 0 : 72 }}>
      {children}
      {!isPublic && <BottomNav />}
    </div>
  );
}
