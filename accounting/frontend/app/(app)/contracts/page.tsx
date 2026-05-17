export default function ContractsPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">合約管理</h1>
      <div className="flex flex-wrap gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <input className="rounded border px-4 py-3" placeholder="搜尋合約" />
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
        <select className="rounded border px-4 py-3">
          <option>全部狀態</option><option>有效</option><option>到期</option><option>終止</option>
        </select>
        <button className="rounded bg-blue-600 px-4 py-3 text-white">＋ 新增合約</button>
      </div>
      <table className="w-full border bg-white">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-3 text-left">客戶</th>
            <th className="p-3 text-left">合約名稱</th>
            <th className="p-3 text-left">月費</th>
            <th className="p-3 text-left">到期日</th>
            <th className="p-3 text-left">狀態</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-3">宏達貿易</td><td className="p-3">年度記帳合約</td>
            <td className="p-3">NT$ 8,000</td><td className="p-3">2026-12-31</td>
            <td className="p-3 text-green-700 font-semibold">有效</td>
          </tr>
          <tr className="border-t">
            <td className="p-3">新光物流</td><td className="p-3">申報代理合約</td>
            <td className="p-3">NT$ 5,000</td><td className="p-3">2026-06-30</td>
            <td className="p-3 text-amber-600 font-semibold">即將到期</td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
