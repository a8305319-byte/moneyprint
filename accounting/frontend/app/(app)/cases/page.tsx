const cases = [
  { id: 'A001', client: '宏達貿易', owner: '陳會計', month: '2026-05', status: '進行中', overdue: true },
  { id: 'A002', client: '新光物流', owner: '王會計', month: '2026-05', status: '待覆核', overdue: false },
];

export default function CasesPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">案件列表</h1>
      <div className="flex flex-wrap gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <input className="rounded border px-4 py-3" placeholder="搜尋案件" />
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
        <select className="rounded border px-4 py-3"><option>狀態</option></select>
        <select className="rounded border px-4 py-3"><option>客戶</option></select>
        <select className="rounded border px-4 py-3"><option>月份</option></select>
        <select className="rounded border px-4 py-3"><option>負責人</option></select>
        <button className="rounded bg-blue-600 px-4 py-3 text-white">＋ 新增案件</button>
      </div>
      <table className="w-full border bg-white">
        <thead>
          <tr className="bg-slate-50">
            <th className="p-3 text-left">編號</th>
            <th className="p-3 text-left">客戶</th>
            <th className="p-3 text-left">負責人</th>
            <th className="p-3 text-left">月份</th>
            <th className="p-3 text-left">狀態</th>
          </tr>
        </thead>
        <tbody>
          {cases.map(c => (
            <tr key={c.id} className="border-t hover:bg-slate-50">
              <td className="p-3">{c.id}</td>
              <td className="p-3">{c.client}</td>
              <td className="p-3">{c.owner}</td>
              <td className="p-3">{c.month}</td>
              <td className={`p-3 font-semibold ${c.overdue ? 'text-red-600' : 'text-green-700'}`}>
                {c.overdue ? '⚠ 逾期' : c.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
