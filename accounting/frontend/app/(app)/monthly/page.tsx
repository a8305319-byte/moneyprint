export default function MonthlyPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">每月帳務總覽</h1>
      <div className="flex flex-wrap gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <input className="rounded border px-4 py-3" placeholder="搜尋客戶" />
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
        <select className="rounded border px-4 py-3">
          <option>2026-05</option><option>2026-04</option><option>2026-03</option>
        </select>
        <button className="rounded bg-blue-600 px-4 py-3 text-white">批次建立本月案件</button>
      </div>
      <section className="rounded border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between rounded border p-3">
          <div>
            <p className="font-semibold">宏達貿易</p>
            <p className="text-slate-600">負責人：陳會計</p>
          </div>
          <div className="text-right">
            <div className="w-40 rounded-full bg-slate-200 h-3">
              <div className="rounded-full bg-blue-500 h-3" style={{ width: '80%' }} />
            </div>
            <p className="text-sm mt-1">80%　待覆核</p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded border p-3">
          <div>
            <p className="font-semibold">新光物流</p>
            <p className="text-slate-600">負責人：王會計</p>
          </div>
          <div className="text-right">
            <div className="w-40 rounded-full bg-slate-200 h-3">
              <div className="rounded-full bg-amber-500 h-3" style={{ width: '60%' }} />
            </div>
            <p className="text-sm mt-1">60%　補件中</p>
          </div>
        </div>
      </section>
    </main>
  );
}
