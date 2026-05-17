export default function FilingsPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">稅務申報列表</h1>
      <div className="flex flex-wrap gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <input className="rounded border px-4 py-3" placeholder="搜尋申報" />
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
        <select className="rounded border px-4 py-3">
          <option>稅別</option><option>營業稅</option><option>所得稅</option><option>扣繳</option>
        </select>
        <select className="rounded border px-4 py-3"><option>月份</option></select>
        <select className="rounded border px-4 py-3">
          <option>狀態</option><option>待申報</option><option>已申報</option><option>退件</option>
        </select>
      </div>
      <table className="w-full border bg-white">
        <thead>
          <tr className="bg-slate-50">
            <th className="p-3 text-left">客戶</th>
            <th className="p-3 text-left">稅別</th>
            <th className="p-3 text-left">月份</th>
            <th className="p-3 text-left">狀態</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-3">宏達貿易</td><td className="p-3">營業稅</td>
            <td className="p-3">2026-05</td><td className="p-3 text-amber-600">待申報</td>
          </tr>
          <tr className="border-t">
            <td className="p-3">新光物流</td><td className="p-3">所得稅</td>
            <td className="p-3">2026-Q2</td><td className="p-3 text-blue-600">申報中</td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
