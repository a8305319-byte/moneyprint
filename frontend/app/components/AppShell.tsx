'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import BottomNav from './BottomNav';

const PUBLIC_PATHS = ['/', '/login'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, demoMode } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const isNav = !PUBLIC_PATHS.includes(pathname);

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
      {/* Demo mode banner */}
      {demoMode && !isPublic && (
        <div style={{
          background: 'rgba(91,95,199,0.08)',
          borderBottom: '1px solid rgba(91,95,199,0.14)',
          padding: '10px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ color: '#5b5fc7', fontSize: 12, fontWeight: 500 }}>
            示範模式 — 資料不會儲存
          </span>
          <Link href="/login" style={{
            color: '#5b5fc7', fontSize: 12, fontWeight: 700,
            textDecoration: 'none',
            background: '#eff2ff', borderRadius: 8, padding: '4px 12px',
          }}>
            建立帳號
          </Link>
        </div>
      )}
      {children}
      {isNav && <BottomNav />}
    </div>
  );
}
