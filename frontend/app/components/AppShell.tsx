'use client';
import Link from 'next/link';
import { Component, ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import BottomNav from './BottomNav';

// ── Error Boundary ─────────────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100dvh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#f4f6fb', padding: '24px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>😵</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1e1b4b', marginBottom: 8 }}>發生了一點問題</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 28 }}>請重新整理頁面繼續使用</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)',
              border: 'none', borderRadius: 16, color: '#fff',
              fontWeight: 700, fontSize: 16, padding: '16px 40px', cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(91,95,199,0.35)',
            }}
          >重新整理</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Shell ──────────────────────────────────────────────────────────────────────
const PUBLIC_PATHS = ['/', '/login'];

function ShellInner({ children }: { children: ReactNode }) {
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

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ShellInner>{children}</ShellInner>
    </ErrorBoundary>
  );
}
