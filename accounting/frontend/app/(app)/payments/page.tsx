export default function PaymentsPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">收款管理</h1>
      <div className="flex flex-wrap gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <input className="rounded border px-4 py-3" placeholder="搜尋客戶" />
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
        <select className="rounded border px-4 py-3"><option>2026-05</option><option>2026-04</option></select>
        <select className="rounded border px-4 py-3">
          <option>全部狀態</option><option>未收</option><option>已收</option><option>逾期</option>
        </select>
      </div>
      <table className="w-full border bg-white">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-3 text-left">客戶</th>
            <th className="p-3 text-left">月份</th>
            <th className="p-3 text-left">金額</th>
            <th className="p-3 text-left">狀態</th>
            <th className="p-3 text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-3">宏達貿易</td><td className="p-3">2026-05</td>
            <td className="p-3">NT$ 8,000</td>
            <td className="p-3 text-green-700 font-semibold">已收款</td>
            <td className="p-3"><button className="rounded bg-slate-200 px-3 py-2 text-sm">查看</button></td>
          </tr>
          <tr className="border-t">
            <td className="p-3">新光物流</td><td className="p-3">2026-05</td>
            <td className="p-3">NT$ 5,000</td>
            <td className="p-3 text-red-600 font-semibold">未收款</td>
            <td className="p-3"><button className="rounded bg-blue-600 px-3 py-2 text-sm text-white">標記已收</button></td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
