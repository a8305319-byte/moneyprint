'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const NAV_PERSONAL = [
  { href: '/app',      icon: '⊞', label: '總覽' },
  { href: '/ledger',   icon: '≡',  label: '帳本' },
  { href: '/reports',  icon: '↗',  label: '報表' },
  { href: '/matches',  icon: '⇄',  label: '配對' },
  { href: '/accounts', icon: '○',  label: '設定' },
];

const NAV_BUSINESS = [
  { href: '/business',          icon: '⊞', label: '總覽' },
  { href: '/business/invoices', icon: '≡',  label: '發票' },
  { href: '/business/add',      icon: '+',  label: '新增', accent: true },
  { href: '/business/reports',  icon: '↗',  label: '報表' },
  { href: '/accounts',          icon: '○',  label: '設定' },
];

export default function BottomNav() {
  const path = usePathname();
  const { user } = useAuth();
  const tabs = user?.mode === 'BUSINESS' ? NAV_BUSINESS : NAV_PERSONAL;

  return (
    <>
      <style>{`.bnav { -webkit-tap-highlight-color: transparent; }`}</style>
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {tabs.map(t => {
          const isAccent = !!(t as any).accent;
          const active = t.href === '/app'
            ? path === '/app'
            : t.href === '/business'
              ? path === '/business'
              : path.startsWith(t.href);

          if (isAccent) {
            return (
              <Link key={t.href} href={t.href} className="bnav" style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '6px 0 10px', textDecoration: 'none',
              }}>
                <div style={{
                  width: 46, height: 46, marginTop: -18,
                  background: 'linear-gradient(135deg, #5b5fc7, #7c3aed)',
                  borderRadius: 15, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 24, color: '#fff',
                  boxShadow: '0 6px 20px rgba(91,95,199,0.45)', fontWeight: 300,
                }}>+</div>
                <span style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>{t.label}</span>
              </Link>
            );
          }

          return (
            <Link key={t.href} href={t.href} className="bnav" style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '10px 0 12px', textDecoration: 'none', gap: 3,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 11,
                background: active ? 'rgba(91,95,199,0.12)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, color: active ? '#5b5fc7' : '#94a3b8',
                transition: 'all 0.15s',
              }}>{t.icon}</div>
              <span style={{ fontSize: 10, color: active ? '#5b5fc7' : '#94a3b8', fontWeight: active ? 700 : 500 }}>{t.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
