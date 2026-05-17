export default function ReviewsPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">待覆核列表</h1>
      <div className="flex gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <input className="rounded border px-4 py-3" placeholder="搜尋覆核" />
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
      </div>
      <section className="space-y-3 rounded border bg-white p-4">
        <div className="rounded border p-3 hover:bg-slate-50">
          <p className="font-semibold">案件 A001 — 宏達貿易 2026-05 營業稅</p>
          <p className="text-slate-600">送審人：陳會計　送審時間：2026-05-17 09:30</p>
        </div>
        <div className="rounded border p-3 hover:bg-slate-50">
          <p className="font-semibold">案件 A005 — 新光物流 2026-05 扣繳</p>
          <p className="text-slate-600">送審人：王會計　送審時間：2026-05-17 10:15</p>
        </div>
      </section>
    </main>
  );
}
