import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '會計事務所多人協作工作平台',
  description: '會計事務所內部管理系統',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
