'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/',        icon: '🏠', label: '總覽' },
  { href: '/ledger',  icon: '📒', label: '帳本' },
  { href: '/reports', icon: '📊', label: '報表' },
  { href: '/matches', icon: '🔗', label: '配對' },
  { href: '/accounts',icon: '⚙️', label: '設定' },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#fff',
      borderTop: '1px solid #e8ecf4',
      display: 'flex',
      zIndex: 50,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {tabs.map(t => {
        const active = t.href === '/' ? path === '/' : path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '8px 0',
            color: active ? '#6c63ff' : '#8892a4',
            textDecoration: 'none',
            fontSize: 10,
            fontWeight: active ? 700 : 400,
            gap: 2,
          }}>
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
