'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const NAV_PERSONAL = [
  { href: '/',         icon: '⊞',  label: '總覽' },
  { href: '/ledger',   icon: '≡',   label: '帳本' },
  { href: '/reports',  icon: '↗',   label: '報表' },
  { href: '/matches',  icon: '⇄',   label: '配對' },
  { href: '/accounts', icon: '○',   label: '設定' },
];

const NAV_BUSINESS = [
  { href: '/business',          icon: '⊞',  label: '總覽' },
  { href: '/business/invoices', icon: '≡',   label: '發票' },
  { href: '/business/add',      icon: '+',   label: '新增', accent: true },
  { href: '/business/reports',  icon: '↗',   label: '報表' },
  { href: '/accounts',          icon: '○',   label: '設定' },
];

export default function BottomNav() {
  const path = usePathname();
  const { user } = useAuth();
  const tabs = user?.mode === 'BUSINESS' ? NAV_BUSINESS : NAV_PERSONAL;

  return (
    <>
      <style>{`
        .bnav-tab { -webkit-tap-highlight-color: transparent; }
        .bnav-tab:active { opacity: 0.7; }
      `}</style>
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {tabs.map(t => {
          const active = t.href === '/' ? path === '/' : (t.href === '/business' ? path === '/business' : path.startsWith(t.href));
          if ((t as any).accent) {
            return (
              <Link key={t.href} href={t.href} className="bnav-tab" style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '6px 0 10px', textDecoration: 'none',
              }}>
                <div style={{
                  width: 48, height: 48,
                  background: 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)',
                  borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, color: '#fff', marginTop: -20,
                  boxShadow: '0 6px 20px rgba(91,95,199,0.45)',
                  fontWeight: 300,
                }}>+</div>
                <span style={{ fontSize: 10, color: active ? '#5b5fc7' : '#94a3b8', fontWeight: 600, marginTop: 3 }}>{t.label}</span>
              </Link>
            );
          }
          return (
            <Link key={t.href} href={t.href} className="bnav-tab" style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '10px 0 12px', textDecoration: 'none', gap: 3,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: active ? 'rgba(91,95,199,0.12)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: active ? '#5b5fc7' : '#94a3b8',
                transition: 'all 0.2s',
              }}>{t.icon}</div>
              <span style={{ fontSize: 10, color: active ? '#5b5fc7' : '#94a3b8', fontWeight: active ? 700 : 500 }}>{t.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
