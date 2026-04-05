import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import AppShell from './components/AppShell';

export const metadata: Metadata = {
  title: '錢跡',
  description: '記帳，就這麼簡單。不用帳號，立刻開始。',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: '錢跡' },
  openGraph: {
    title: '錢跡 — 記帳，就這麼簡單',
    description: '不用帳號，立刻開始記帳。幾秒完成，天天習慣。',
    siteName: '錢跡',
    locale: 'zh_TW',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 1, themeColor: '#6c63ff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body style={{ background: 'var(--background)', minHeight: '100dvh' }}>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
