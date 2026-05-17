export default function EmployeeDetailPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">員工詳情</h1>
      <div className="flex gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
        <button className="rounded bg-blue-600 px-4 py-3 text-white">編輯</button>
        <button className="rounded bg-amber-500 px-4 py-3 text-white">停用（軟刪除）</button>
      </div>
      <section className="rounded border bg-white p-4">
        <h2 className="mb-2 text-xl font-semibold">基本資料</h2>
        <p>姓名：王小美</p>
        <p>角色：資深會計</p>
        <p>Email：wang@firm.com</p>
        <p>電話：0912-345-678</p>
        <p className="mt-2 text-sm text-slate-500">最後修改人：林會計，時間：2026-05-17 10:30</p>
      </section>
      <section className="rounded border bg-white p-4">
        <h2 className="mb-2 text-xl font-semibold">負責客戶</h2>
        <p>宏達貿易、新光物流、全台科技</p>
      </section>
      <section className="rounded border bg-white p-4">
        <h2 className="mb-2 text-xl font-semibold">重設密碼</h2>
        <button className="rounded bg-slate-200 px-4 py-3">寄送重設密碼信</button>
      </section>
    </main>
  );
}
