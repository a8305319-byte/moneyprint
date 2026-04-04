import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '錢跡',
  description: '個人記帳系統',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 flex items-center gap-6 h-14">
            <Link href="/" className="font-bold text-lg text-indigo-600 tracking-wide">錢跡</Link>
            <Link href="/ledger" className="text-sm text-gray-600 hover:text-indigo-600">帳本</Link>
            <Link href="/accounts" className="text-sm text-gray-600 hover:text-indigo-600">銀行匯入</Link>
            <Link href="/invoices" className="text-sm text-gray-600 hover:text-indigo-600">發票</Link>
            <Link href="/matches" className="text-sm text-gray-600 hover:text-indigo-600">配對</Link>
            <Link href="/reports" className="text-sm text-gray-600 hover:text-indigo-600">報表</Link>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
