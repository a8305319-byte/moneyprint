import Link from 'next/link';

const cards = [
  { href: '/ledger', icon: '📒', title: '帳本', desc: '查看所有收支明細' },
  { href: '/accounts', icon: '🏦', title: '銀行匯入', desc: '上傳 CSV 對帳單' },
  { href: '/invoices', icon: '🧾', title: '電子發票', desc: '同步載具發票' },
  { href: '/matches', icon: '🔗', title: '配對', desc: '比對銀行與發票' },
  { href: '/reports', icon: '📊', title: '報表', desc: '月度支出分析' },
];

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">錢跡</h1>
      <p className="text-gray-500 mb-10">個人記帳系統 — 自動比對銀行與發票</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(c => (
          <Link key={c.href} href={c.href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-400 hover:shadow-md transition-all group">
            <div className="text-3xl mb-3">{c.icon}</div>
            <div className="font-semibold text-gray-800 group-hover:text-indigo-600">{c.title}</div>
            <div className="text-sm text-gray-500 mt-1">{c.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
