export default function TasksPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">任務列表</h1>
      <div className="flex flex-wrap gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <input className="rounded border px-4 py-3" placeholder="搜尋任務" />
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
        <select className="rounded border px-4 py-3"><option>負責人</option></select>
        <select className="rounded border px-4 py-3"><option>狀態</option></select>
        <button className="rounded bg-blue-600 px-4 py-3 text-white">＋ 新增任務</button>
      </div>
      <section className="rounded border bg-white p-4 space-y-3">
        <div className="rounded border p-3">
          <p className="font-semibold">申報營業稅</p>
          <p className="text-slate-600">負責人：陳會計　狀態：進行中　截止：2026-05-20</p>
        </div>
        <div className="rounded border p-3">
          <p className="font-semibold">整理薪資單</p>
          <p className="text-slate-600">負責人：王會計　狀態：待處理　截止：2026-05-25</p>
        </div>
      </section>
    </main>
  );
}
