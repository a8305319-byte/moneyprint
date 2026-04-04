'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const path = usePathname();
  const { user } = useAuth();
  const isBiz = user?.mode === 'BUSINESS';

  const tabs = isBiz ? [
    { href: '/business',         icon: '🏢', label: '公司' },
    { href: '/business/invoices',icon: '🧾', label: '發票' },
    { href: '/business/add',     icon: '➕', label: '新增', accent: true },
    { href: '/business/reports', icon: '📊', label: '報表' },
    { href: '/accounts',         icon: '⚙️', label: '設定' },
  ] : [
    { href: '/',         icon: '🏠', label: '總覽' },
    { href: '/ledger',   icon: '📒', label: '帳本' },
    { href: '/reports',  icon: '📊', label: '報表' },
    { href: '/matches',  icon: '🔗', label: '配對' },
    { href: '/accounts', icon: '⚙️', label: '設定' },
  ];

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 480,
      background: '#fff', borderTop: '1px solid #e8ecf4',
      display: 'flex', zIndex: 50,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {tabs.map(t => {
        const active = t.href === '/' ? path === '/' : path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '8px 0', color: active ? '#6c63ff' : '#8892a4',
            textDecoration: 'none', fontSize: 10, fontWeight: active ? 700 : 400, gap: 2,
          }}>
            {(t as any).accent ? (
              <div style={{ width: 44, height: 44, background: '#6c63ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginTop: -16, boxShadow: '0 4px 16px rgba(108,99,255,0.4)' }}>{t.icon}</div>
            ) : (
              <span style={{ fontSize: 22 }}>{t.icon}</span>
            )}
            {!(t as any).accent && t.label}
          </Link>
        );
      })}
    </nav>
  );
}
