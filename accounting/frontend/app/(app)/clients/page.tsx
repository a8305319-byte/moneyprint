const clients = [
  { id: 'C001', name: '宏達貿易', owner: '陳小姐', status: '合作中' },
  { id: 'C002', name: '新光物流', owner: '王先生', status: '追蹤中' },
];

export default function ClientsPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">客戶列表</h1>
      <div className="flex flex-wrap gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <input className="rounded border px-4 py-3" placeholder="搜尋客戶" />
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
        <button className="rounded bg-blue-600 px-4 py-3 text-white">＋ 新增客戶</button>
      </div>
      <table className="w-full border bg-white">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-3 text-left">編號</th>
            <th className="p-3 text-left">名稱</th>
            <th className="p-3 text-left">負責人</th>
            <th className="p-3 text-left">狀態</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id} className="border-t hover:bg-slate-50">
              <td className="p-3">{c.id}</td>
              <td className="p-3">{c.name}</td>
              <td className="p-3">{c.owner}</td>
              <td className="p-3">{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
