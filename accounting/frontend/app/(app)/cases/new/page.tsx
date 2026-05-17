export default function NewCasePage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">新增案件</h1>
      <div className="flex gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
      </div>
      <form className="space-y-3 rounded border bg-white p-6">
        <div>
          <label className="mb-1 block font-semibold">客戶</label>
          <input className="w-full rounded border px-4 py-3" placeholder="選擇客戶" />
        </div>
        <div>
          <label className="mb-1 block font-semibold">案件類型</label>
          <select className="w-full rounded border px-4 py-3">
            <option>每月稅務</option>
            <option>年度申報</option>
            <option>海關代徵</option>
            <option>薪資處理</option>
            <option>記帳</option>
            <option>其他</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block font-semibold">標題</label>
          <input className="w-full rounded border px-4 py-3" placeholder="案件標題" />
        </div>
        <div>
          <label className="mb-1 block font-semibold">負責人</label>
          <input className="w-full rounded border px-4 py-3" placeholder="指派員工" />
        </div>
        <div>
          <label className="mb-1 block font-semibold">截止日</label>
          <input className="w-full rounded border px-4 py-3" type="date" />
        </div>
        <button className="rounded bg-blue-600 px-6 py-3 text-white">送出</button>
        <p className="text-sm text-slate-500">最後修改人：王小美，時間：2026-05-17 11:10</p>
      </form>
    </main>
  );
}
