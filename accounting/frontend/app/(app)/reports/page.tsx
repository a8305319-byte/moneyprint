const reportTypes = ['客件列表報表', '收款報表', '員工工作量', '稅務申報統計', '薪資計算報表'];

export default function ReportsPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">報表中心</h1>
      <div className="flex gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
        <button className="rounded bg-green-600 px-4 py-3 text-white">匯出 Excel</button>
      </div>
      <div className="flex flex-wrap gap-3">
        {reportTypes.map((r) => (
          <button key={r} className="rounded border bg-white px-5 py-3 hover:bg-blue-50 hover:border-blue-400">
            {r}
          </button>
        ))}
      </div>
      <section className="rounded border bg-white p-6">
        <h2 className="mb-3 text-xl font-semibold">客件列表報表</h2>
        <div className="flex gap-3 mb-4">
          <select className="rounded border px-4 py-3"><option>2026-05</option></select>
          <select className="rounded border px-4 py-3"><option>全部員工</option></select>
        </div>
        <table className="w-full border">
          <thead><tr className="bg-slate-100">
            <th className="p-3 text-left">客戶</th><th className="p-3 text-left">案件數</th>
            <th className="p-3 text-left">完成</th><th className="p-3 text-left">進行中</th><th className="p-3 text-left">逾期</th>
          </tr></thead>
          <tbody>
            <tr className="border-t"><td className="p-3">宏達貿易</td><td className="p-3">5</td><td className="p-3">4</td><td className="p-3">1</td><td className="p-3 text-red-600">0</td></tr>
            <tr className="border-t"><td className="p-3">新光物流</td><td className="p-3">3</td><td className="p-3">2</td><td className="p-3">0</td><td className="p-3 text-red-600">1</td></tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}
