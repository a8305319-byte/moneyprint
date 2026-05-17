export default function NewClientPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">新增客戶</h1>
      <div className="flex gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
      </div>
      <form className="space-y-3 rounded border bg-white p-6">
        <div><label className="mb-1 block font-semibold">客戶名稱</label>
          <input className="w-full rounded border px-4 py-3" placeholder="公司全名" /></div>
        <div><label className="mb-1 block font-semibold">統一編號</label>
          <input className="w-full rounded border px-4 py-3" placeholder="8碼統編" /></div>
        <div><label className="mb-1 block font-semibold">聯絡電話</label>
          <input className="w-full rounded border px-4 py-3" placeholder="電話" /></div>
        <div><label className="mb-1 block font-semibold">聯絡人</label>
          <input className="w-full rounded border px-4 py-3" placeholder="聯絡人姓名" /></div>
        <div><label className="mb-1 block font-semibold">地址</label>
          <input className="w-full rounded border px-4 py-3" placeholder="公司地址" /></div>
        <div><label className="mb-1 block font-semibold">備註</label>
          <textarea className="w-full rounded border px-4 py-3" rows={3} placeholder="備註" /></div>
        <button className="rounded bg-blue-600 px-6 py-3 text-white">送出</button>
        <p className="text-sm text-slate-500">最後修改人：系統管理員，時間：2026-05-17 10:00</p>
      </form>
    </main>
  );
}
