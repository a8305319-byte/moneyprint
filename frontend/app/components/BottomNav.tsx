'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

// SVG icon components — inline, no dependency
const IconRecord = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
  </svg>
);
const IconList = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const IconChart = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IconSwap = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);
const IconPerson = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconReceipt = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IconPlus = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const NAV_PERSONAL = [
  { href: '/app',      icon: <IconRecord />, label: '記帳' },
  { href: '/ledger',   icon: <IconList />,   label: '帳本' },
  { href: '/reports',  icon: <IconChart />,  label: '報表' },
  { href: '/matches',  icon: <IconSwap />,   label: '配對' },
  { href: '/accounts', icon: <IconPerson />, label: '設定' },
];

const NAV_BUSINESS = [
  { href: '/business',          icon: <IconChart />,   label: '總覽' },
  { href: '/business/invoices', icon: <IconReceipt />, label: '發票' },
  { href: '/business/add',      icon: <IconPlus />,    label: '新增', accent: true },
  { href: '/business/reports',  icon: <IconChart />,   label: '報表' },
  { href: '/accounts',          icon: <IconPerson />,  label: '設定' },
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
                  justifyContent: 'center', color: '#fff',
                  boxShadow: '0 6px 20px rgba(91,95,199,0.45)',
                }}>{t.icon}</div>
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
                color: active ? '#5b5fc7' : '#94a3b8',
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
