const trashItems = [
  { id: 1, type: '案件', name: '宏達貿易 2026-04 補正案', deletedBy: '王小美', deletedAt: '2026-05-10', expiresAt: '2026-06-09' },
  { id: 2, type: '文件', name: '舊版對帳單.xlsx', deletedBy: '陳大文', deletedAt: '2026-05-12', expiresAt: '2026-06-11' },
];

export default function TrashPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">垃圾桶與復原</h1>
      <div className="flex flex-wrap gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <input className="rounded border px-4 py-3" placeholder="搜尋已刪除項目" />
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
        <select className="rounded border px-4 py-3">
          <option>全部類型</option><option>案件</option><option>客戶</option><option>文件</option><option>任務</option>
        </select>
      </div>
      <p className="rounded bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800">
        ⚠ 項目將在刪除後 30 天自動永久刪除，請及時復原需要的資料。
      </p>
      <table className="w-full border bg-white">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-3 text-left">類型</th>
            <th className="p-3 text-left">名稱</th>
            <th className="p-3 text-left">刪除人</th>
            <th className="p-3 text-left">刪除時間</th>
            <th className="p-3 text-left">到期時間</th>
            <th className="p-3 text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          {trashItems.map((item) => (
            <tr key={item.id} className="border-t hover:bg-slate-50">
              <td className="p-3">{item.type}</td>
              <td className="p-3">{item.name}</td>
              <td className="p-3">{item.deletedBy}</td>
              <td className="p-3">{item.deletedAt}</td>
              <td className="p-3 text-red-500">{item.expiresAt}</td>
              <td className="p-3 flex gap-2">
                <button className="rounded bg-green-600 px-3 py-2 text-sm text-white">復原</button>
                <button className="rounded bg-red-600 px-3 py-2 text-sm text-white">永久刪除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
