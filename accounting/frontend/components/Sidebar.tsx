const links = [
  { href: '/dashboard', label: '🏠 首頁工作台' },
  { href: '/clients', label: '👥 客戶管理' },
  { href: '/cases', label: '📁 案件管理' },
  { href: '/monthly', label: '📅 每月帳務作業' },
  { href: '/documents', label: '📄 文件與憑證管理' },
  { href: '/filings', label: '📋 稅務申報管理' },
  { href: '/special', label: '🔧 特殊業務工具' },
  { href: '/tasks', label: '✅ 任務派工' },
  { href: '/reviews', label: '🔍 主管覆核' },
  { href: '/contracts', label: '📝 收款與合約' },
  { href: '/reports', label: '📊 報表中心' },
  { href: '/employees', label: '👤 員工管理' },
  { href: '/salary', label: '💰 薪資與勞健保' },
  { href: '/notifications', label: '🔔 通知提醒' },
  { href: '/handover', label: '🔄 交接管理' },
  { href: '/permissions', label: '🔐 權限管理' },
  { href: '/operation-logs', label: '📒 操作紀錄' },
  { href: '/login-logs', label: '🔑 登入紀錄' },
  { href: '/trash', label: '🗑 垃圾桶與復原' },
  { href: '/settings', label: '⚙️ 系統設定' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar fixed left-0 top-0 h-screen w-72 overflow-y-auto bg-slate-800 text-white flex flex-col">
      <div className="px-5 py-5 border-b border-slate-700">
        <p className="text-xl font-bold">會計事務所</p>
        <p className="text-sm text-slate-400">多人協作工作平台</p>
      </div>
      <nav className="flex-1 py-3">
        {links.map(link => (
          <a
            key={link.href}
            href={link.href}
            className="flex items-center px-5 py-3 text-base text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
