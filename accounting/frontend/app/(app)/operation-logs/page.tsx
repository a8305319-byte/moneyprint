const logs = [
  { id: 1, user: '王小美', action: '修改', target: '案件 A001', time: '2026-05-17 09:45', ip: '192.168.1.1' },
  { id: 2, user: '陳大文', action: '上傳', target: '發票.pdf', time: '2026-05-17 09:30', ip: '192.168.1.2' },
  { id: 3, user: '李助理', action: '登入', target: '系統', time: '2026-05-17 09:00', ip: '192.168.1.3' },
];

export default function OperationLogsPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">操作紀錄</h1>
      <div className="flex flex-wrap gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <input className="rounded border px-4 py-3" placeholder="搜尋操作" />
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
        <select className="rounded border px-4 py-3"><option>全部人員</option></select>
        <select className="rounded border px-4 py-3"><option>全部動作</option><option>新增</option><option>修改</option><option>刪除</option><option>上傳</option></select>
        <button className="rounded bg-green-600 px-4 py-3 text-white">匯出 Excel</button>
      </div>
      <table className="w-full border bg-white">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-3 text-left">操作人</th>
            <th className="p-3 text-left">動作</th>
            <th className="p-3 text-left">對象</th>
            <th className="p-3 text-left">時間</th>
            <th className="p-3 text-left">IP</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id} className="border-t hover:bg-slate-50">
              <td className="p-3">{l.user}</td>
              <td className="p-3">{l.action}</td>
              <td className="p-3">{l.target}</td>
              <td className="p-3">{l.time}</td>
              <td className="p-3 text-slate-400">{l.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-sm text-slate-400">操作紀錄不可修改或刪除</p>
    </main>
  );
}
