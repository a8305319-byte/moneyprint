import Sidebar from '@/components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-base">
      <Sidebar />
      <div className="ml-72">
        <header className="flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">宏遠會計事務所</h1>
            <p className="text-base">使用者：王小美（資深會計）</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded bg-slate-100 px-4 py-3">🔔 通知（未讀 5）</button>
            <button className="rounded bg-red-600 px-4 py-3 text-white">登出</button>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
