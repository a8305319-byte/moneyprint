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

// ── 試用倒數格式化 ─────────────────────────────────────────────────────────────
function formatTimeLeft(expiresAt: number): string {
  const ms = Math.max(0, expiresAt - Date.now());
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `還剩 ${h} 小時 ${m} 分`;
  if (m > 0) return `還剩 ${m} 分鐘`;
  return '即將到期';
}

// ── Shell ──────────────────────────────────────────────────────────────────────
const PUBLIC_PATHS = ['/', '/login'];

function ShellInner({ children }: { children: ReactNode }) {
  const { user, loading, demoMode, trialExpired, trialExpiresAt } = useAuth();
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

  // ── 試用期到期畫面 ──────────────────────────────────────────────────────────
  if (demoMode && trialExpired && !isPublic) {
    return (
      <div style={{
        minHeight: '100dvh', background: '#0a0a0f',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 28px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        <div style={{ animation: 'fadeUp 0.4s ease both', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 340 }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>⏰</div>
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 800, marginBottom: 10, textAlign: 'center' }}>
            試用期已結束
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, textAlign: 'center', marginBottom: 36, lineHeight: 1.6 }}>
            建立免費帳號，資料永久保存<br />繼續使用所有功能
          </div>
          <Link href="/login" style={{
            background: 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)',
            color: '#fff', borderRadius: 20, padding: '18px 0',
            fontSize: 17, fontWeight: 800, textDecoration: 'none',
            width: '100%', textAlign: 'center', display: 'block',
            boxShadow: '0 14px 44px rgba(91,95,199,0.45)',
          }}>免費建立帳號</Link>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 16 }}>
            完全免費 · 30 秒完成
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: isNav ? 80 : 0 }}>
      {/* 試用期橫幅 */}
      {demoMode && !isPublic && (
        <div style={{
          background: 'rgba(91,95,199,0.08)',
          borderBottom: '1px solid rgba(91,95,199,0.14)',
          padding: '10px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ color: '#5b5fc7', fontSize: 12, fontWeight: 500 }}>
            試用模式
            {trialExpiresAt && (
              <span style={{ color: '#94a3b8', marginLeft: 6 }}>
                · {formatTimeLeft(trialExpiresAt)}
              </span>
            )}
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
