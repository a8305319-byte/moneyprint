const notifications = [
  { id: 1, type: '逾期', title: '案件 A001 已逾期 2 天', time: '2026-05-17 09:00', read: false },
  { id: 2, type: '送審', title: '陳會計送來案件 A003 待覆核', time: '2026-05-17 09:30', read: false },
  { id: 3, type: '指派', title: '您被指派處理新光物流 2026-05 申報', time: '2026-05-16 14:00', read: true },
];

export default function NotificationsPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">通知提醒</h1>
      <div className="flex gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <input className="rounded border px-4 py-3" placeholder="搜尋通知" />
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
        <button className="rounded bg-blue-600 px-4 py-3 text-white">全部標為已讀</button>
      </div>
      <section className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className={`rounded border p-4 ${n.read ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex justify-between">
              <span className="font-semibold">{n.read ? '' : '🔵 '}{n.title}</span>
              <span className="text-sm text-slate-400">{n.time}</span>
            </div>
            <span className="text-sm text-slate-500">類型：{n.type}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
