export default function SalaryPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">薪資列表</h1>
      <div className="flex flex-wrap gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <input className="rounded border px-4 py-3" placeholder="搜尋員工" />
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
        <select className="rounded border px-4 py-3">
          <option>2026-05</option><option>2026-04</option>
        </select>
        <button className="rounded bg-blue-600 px-4 py-3 text-white">＋ 建立本月薪資</button>
      </div>
      <table className="w-full border bg-white">
        <thead>
          <tr className="bg-slate-50">
            <th className="p-3 text-left">姓名</th>
            <th className="p-3 text-left">月份</th>
            <th className="p-3 text-left">應發</th>
            <th className="p-3 text-left">實發</th>
            <th className="p-3 text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-3">王小美</td><td className="p-3">2026-05</td>
            <td className="p-3">NT$ 52,000</td><td className="p-3">NT$ 49,300</td>
            <td className="p-3"><button className="rounded bg-slate-200 px-3 py-2">查看薪資單</button></td>
          </tr>
          <tr className="border-t">
            <td className="p-3">陳大文</td><td className="p-3">2026-05</td>
            <td className="p-3">NT$ 48,000</td><td className="p-3">NT$ 45,600</td>
            <td className="p-3"><button className="rounded bg-slate-200 px-3 py-2">查看薪資單</button></td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
