export default function ReviewDetailPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">覆核操作</h1>
      <div className="flex gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
      </div>
      <section className="rounded border bg-white p-6 space-y-4">
        <div>
          <p className="font-semibold text-lg">案件 A001 — 宏達貿易 2026-05 營業稅</p>
          <p className="text-slate-600">送審人：陳會計　送審時間：2026-05-17 09:30</p>
        </div>
        <div className="rounded bg-slate-50 p-3">
          <p>附件：發票.pdf、對帳單.xlsx</p>
          <p>備註：本月進項憑證已全數整理完畢。</p>
        </div>
        <div>
          <label className="mb-1 block font-semibold">覆核意見 / 退回原因</label>
          <textarea className="w-full rounded border px-4 py-3" rows={4} placeholder="退回時請填寫原因（必填）" />
        </div>
        <div className="flex gap-3">
          <button className="rounded bg-green-600 px-6 py-3 text-white font-semibold">✅ 核准</button>
          <button className="rounded bg-amber-600 px-6 py-3 text-white font-semibold">↩ 退回</button>
        </div>
      </section>
    </main>
  );
}
