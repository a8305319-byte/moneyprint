import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from './components/BottomNav';

export const metadata: Metadata = {
  title: '錢跡',
  description: '個人記帳 — 自動比對銀行與發票',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: '錢跡' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#6c63ff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body style={{ background: 'var(--background)', minHeight: '100dvh', paddingBottom: '72px' }}>
        <main className="max-w-lg mx-auto">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
