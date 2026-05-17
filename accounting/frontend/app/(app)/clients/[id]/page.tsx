export default function ClientDetailPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">客戶詳情</h1>
      <div className="flex gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <input className="rounded border px-4 py-3" placeholder="搜尋資料" />
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
        <button className="rounded bg-blue-600 px-4 py-3 text-white">編輯</button>
      </div>
      <section className="rounded border bg-white p-4">
        <h2 className="mb-2 text-xl font-semibold">基本資料</h2>
        <p>公司：宏達貿易股份有限公司</p>
        <p>統編：12345678</p>
        <p>電話：02-1234-5678</p>
        <p>地址：台北市信義區信義路五段7號</p>
        <p className="mt-2 text-sm text-slate-500">最後修改人：林會計，時間：2026-05-17 09:30</p>
      </section>
      <section className="rounded border bg-white p-4">
        <h2 className="mb-2 text-xl font-semibold">聯絡人</h2>
        <p>陳小姐 / 0912-345-678 / chen@hd.com</p>
      </section>
      <section className="rounded border bg-white p-4">
        <h2 className="mb-2 text-xl font-semibold">合約</h2>
        <p>年度記帳合約（有效中）到期：2026-12-31</p>
      </section>
      <section className="rounded border bg-white p-4">
        <h2 className="mb-2 text-xl font-semibold">收款記錄</h2>
        <p>2026-05 ✅ 已收款　NT$ 8,000</p>
        <p>2026-04 ✅ 已收款　NT$ 8,000</p>
      </section>
    </main>
  );
}
