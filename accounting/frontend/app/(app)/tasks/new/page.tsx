export default function NewTaskPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">新增任務</h1>
      <div className="flex gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
      </div>
      <form className="space-y-3 rounded border bg-white p-6">
        <div>
          <label className="mb-1 block font-semibold">任務名稱</label>
          <input className="w-full rounded border px-4 py-3" placeholder="任務名稱" />
        </div>
        <div>
          <label className="mb-1 block font-semibold">說明</label>
          <textarea className="w-full rounded border px-4 py-3" rows={3} placeholder="任務說明" />
        </div>
        <div>
          <label className="mb-1 block font-semibold">指派給</label>
          <input className="w-full rounded border px-4 py-3" placeholder="員工姓名" />
        </div>
        <div>
          <label className="mb-1 block font-semibold">截止日</label>
          <input className="w-full rounded border px-4 py-3" type="date" />
        </div>
        <button className="rounded bg-blue-600 px-6 py-3 text-white">送出</button>
        <p className="text-sm text-slate-500">最後修改人：王小美，時間：2026-05-17 11:20</p>
      </form>
    </main>
  );
}
