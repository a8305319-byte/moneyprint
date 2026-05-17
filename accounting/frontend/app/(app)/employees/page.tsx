const employees = [
  { id: 'E001', name: '王小美', role: '資深會計', email: 'wang@firm.com', status: '在職' },
  { id: 'E002', name: '陳大文', role: '一般會計', email: 'chen@firm.com', status: '在職' },
  { id: 'E003', name: '李助理', role: '助理', email: 'lee@firm.com', status: '在職' },
];

export default function EmployeesPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">員工管理</h1>
      <div className="flex flex-wrap gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <input className="rounded border px-4 py-3" placeholder="搜尋員工" />
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
        <button className="rounded bg-blue-600 px-4 py-3 text-white">＋ 新增員工</button>
      </div>
      <table className="w-full border bg-white">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-3 text-left">姓名</th>
            <th className="p-3 text-left">角色</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">狀態</th>
            <th className="p-3 text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((e) => (
            <tr key={e.id} className="border-t hover:bg-slate-50">
              <td className="p-3 font-semibold">{e.name}</td>
              <td className="p-3">{e.role}</td>
              <td className="p-3">{e.email}</td>
              <td className="p-3 text-green-700">{e.status}</td>
              <td className="p-3">
                <button className="rounded bg-slate-200 px-3 py-2 text-sm">查看</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
