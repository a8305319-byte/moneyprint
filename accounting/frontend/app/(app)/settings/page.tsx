export default function SettingsPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">系統設定</h1>
      <div className="flex gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <button className="rounded bg-blue-600 px-4 py-3 text-white">儲存設定</button>
      </div>
      <section className="rounded border bg-white p-6 space-y-4 max-w-xl">
        <div><label className="mb-1 block font-semibold">公司名稱</label>
          <input className="w-full rounded border px-4 py-3" defaultValue="宏遠會計事務所" /></div>
        <div><label className="mb-1 block font-semibold">案件「卡住」定義天數</label>
          <input className="w-full rounded border px-4 py-3" type="number" defaultValue={7} />
          <p className="text-sm text-slate-500 mt-1">超過幾天未更新視為卡住並發出提醒</p></div>
        <div><label className="mb-1 block font-semibold">逾期提醒提前天數</label>
          <input className="w-full rounded border px-4 py-3" type="number" defaultValue={3} /></div>
        <div><label className="mb-1 block font-semibold">垃圾桶自動永久刪除天數</label>
          <input className="w-full rounded border px-4 py-3" type="number" defaultValue={30} /></div>
        <div><label className="mb-1 block font-semibold">系統版本</label>
          <input className="w-full rounded border px-4 py-3 bg-slate-50" defaultValue="v0.1.0" readOnly /></div>
        <p className="text-sm text-slate-500">最後修改人：系統管理員，時間：2026-05-17 10:30</p>
      </section>
    </main>
  );
}
