const stats = [
  { label: '今日待辦', value: '23', color: 'bg-blue-500', unit: '件' },
  { label: '逾期案件', value: '8', color: 'bg-red-500', unit: '件' },
  { label: '待覆核', value: '14', color: 'bg-amber-500', unit: '件' },
  { label: '待申報', value: '6', color: 'bg-purple-500', unit: '件' },
  { label: '未收資料客戶', value: '12', color: 'bg-orange-500', unit: '家' },
  { label: '待收款客戶', value: '9', color: 'bg-pink-500', unit: '家' },
];

const todos = [
  { id: 'A001', client: '宏達貿易', task: '2026-05 營業稅申報', due: '05/17', status: '逾期', overdue: true },
  { id: 'A002', client: '新光物流', task: '2026-05 記帳作業', due: '05/20', status: '處理中', overdue: false },
  { id: 'A003', client: '全台科技', task: '2026-05 扣繳申報', due: '05/17', status: '待覆核', overdue: false },
];

const overdueCases = [
  { client: '宏達貿易', task: '2026-05 營業稅', days: 9 },
  { client: '新光物流', task: '2026-05 薪資申報', days: 7 },
  { client: '全台科技', task: '2026-04 海關代徵', days: 6 },
];

export default function DashboardPage() {
  return (
    <main className="space-y-6 text-base">
      <h1 className="text-2xl font-bold">首頁工作台</h1>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white border p-4 text-center shadow-sm">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className={`text-4xl font-bold mt-1 ${s.value !== '0' && s.label.includes('逾期') ? 'text-red-600' : 'text-slate-800'}`}>
              {s.value}
            </p>
            <p className="text-sm text-slate-400">{s.unit}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 今日待辦 */}
        <div className="rounded-xl bg-white border p-5 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">今日待辦清單（前5筆）</h2>
          <table className="w-full">
            <thead><tr className="bg-slate-50">
              <th className="p-2 text-left text-sm">編號</th>
              <th className="p-2 text-left text-sm">客戶</th>
              <th className="p-2 text-left text-sm">工作項目</th>
              <th className="p-2 text-left text-sm">截止</th>
              <th className="p-2 text-left text-sm">狀態</th>
            </tr></thead>
            <tbody>
              {todos.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-2 text-sm">{t.id}</td>
                  <td className="p-2 text-sm">{t.client}</td>
                  <td className="p-2 text-sm">{t.task}</td>
                  <td className="p-2 text-sm">{t.due}</td>
                  <td className={`p-2 text-sm font-semibold ${t.overdue ? 'text-red-600' : 'text-slate-600'}`}>
                    {t.overdue ? '⚠ 逾期' : t.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 逾期案件 */}
        <div className="rounded-xl bg-white border p-5 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">逾期案件（前5筆）</h2>
          <div className="space-y-2">
            {overdueCases.map((c) => (
              <div key={c.client} className="flex justify-between rounded border border-red-100 bg-red-50 px-4 py-3">
                <div>
                  <p className="font-semibold">{c.client}</p>
                  <p className="text-sm text-slate-600">{c.task}</p>
                </div>
                <span className="text-red-600 font-bold text-lg">{c.days}天</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="rounded-xl bg-white border p-5 shadow-sm">
        <h2 className="text-xl font-semibold mb-3">快速操作</h2>
        <div className="flex flex-wrap gap-3">
          {['＋ 新增客戶', '🔍 查詢客戶', '📁 新增案件', '📄 上傳文件', '✅ 查看待辦', '⚠ 查看逾期', '🖨 列印今日清單'].map((btn) => (
            <button key={btn} className="rounded-lg bg-slate-100 px-5 py-3 font-semibold hover:bg-blue-50 hover:text-blue-700 transition-colors">
              {btn}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
