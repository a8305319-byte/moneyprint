export default function SalaryDetailPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">個人薪資單</h1>
      <div className="flex gap-3 no-print">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <button className="rounded bg-slate-200 px-4 py-3">🖨 列印薪資單</button>
      </div>
      <section className="rounded border bg-white p-6 max-w-xl space-y-3">
        <h2 className="text-xl font-bold text-center">薪資明細</h2>
        <p className="text-center text-slate-500">2026 年 05 月</p>
        <hr />
        <div className="flex justify-between"><span>姓名</span><span className="font-semibold">王小美</span></div>
        <div className="flex justify-between"><span>底薪</span><span>NT$ 50,000</span></div>
        <div className="flex justify-between"><span>加班費</span><span>NT$ 3,000</span></div>
        <div className="flex justify-between"><span>獎金</span><span>NT$ 0</span></div>
        <div className="flex justify-between text-red-600"><span>請假扣薪</span><span>- NT$ 0</span></div>
        <div className="flex justify-between text-red-600"><span>勞保費</span><span>- NT$ 1,200</span></div>
        <div className="flex justify-between text-red-600"><span>健保費</span><span>- NT$ 800</span></div>
        <div className="flex justify-between text-red-600"><span>勞退提撥</span><span>- NT$ 1,700</span></div>
        <hr />
        <div className="flex justify-between text-xl font-bold">
          <span>實發金額</span><span>NT$ 49,300</span>
        </div>
        <p className="text-sm text-slate-400 text-right">最後修改人：王主管　2026-05-10</p>
      </section>
    </main>
  );
}
