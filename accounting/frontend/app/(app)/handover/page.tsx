export default function HandoverPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">交接管理</h1>
      <div className="flex flex-wrap gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <input className="rounded border px-4 py-3" placeholder="搜尋交接" />
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
        <button className="rounded bg-blue-600 px-4 py-3 text-white">＋ 新增交接單</button>
      </div>
      <section className="space-y-3 rounded border bg-white p-4">
        <div className="rounded border p-3">
          <p className="font-semibold">陳會計 → 李會計</p>
          <p className="text-slate-600">案件 3 個、客戶 5 家　建立時間：2026-05-10　狀態：完成</p>
        </div>
        <div className="rounded border p-3">
          <p className="font-semibold">王小美 → 張助理</p>
          <p className="text-slate-600">案件 1 個　建立時間：2026-05-15　狀態：進行中</p>
        </div>
      </section>
      <section className="rounded border bg-white p-6 space-y-3">
        <h2 className="text-xl font-semibold">新增交接單</h2>
        <div>
          <label className="mb-1 block font-semibold">交接人（從）</label>
          <input className="w-full rounded border px-4 py-3" placeholder="員工姓名" />
        </div>
        <div>
          <label className="mb-1 block font-semibold">接收人（給）</label>
          <input className="w-full rounded border px-4 py-3" placeholder="員工姓名" />
        </div>
        <div>
          <label className="mb-1 block font-semibold">備註</label>
          <textarea className="w-full rounded border px-4 py-3" rows={3} placeholder="交接說明" />
        </div>
        <button className="rounded bg-blue-600 px-6 py-3 text-white">建立交接單</button>
        <p className="text-sm text-slate-500">最後修改人：王小美，時間：2026-05-17 11:30</p>
      </section>
    </main>
  );
}
