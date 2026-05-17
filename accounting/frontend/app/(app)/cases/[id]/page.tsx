export default function CaseDetailPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">案件詳情</h1>
      <div className="flex gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <input className="rounded border px-4 py-3" placeholder="搜尋內容" />
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
      </div>
      <section className="rounded border bg-white p-4">
        <h2 className="mb-2 text-xl font-semibold">狀態時間軸</h2>
        <ul className="space-y-1 pl-4">
          <li>✅ 05/01 建立案件</li>
          <li>✅ 05/03 上傳資料</li>
          <li>🔴 05/05 主管退回</li>
        </ul>
        <p className="mt-2 rounded bg-red-50 p-2 text-red-700">退回原因：附件缺少發票明細。</p>
      </section>
      <section className="rounded border bg-white p-4">
        <h2 className="mb-2 text-xl font-semibold">留言區</h2>
        <p className="mb-3">王會計：已補件，請再次覆核。</p>
        <textarea className="w-full rounded border px-4 py-3" placeholder="新增留言…" rows={3} />
        <button className="mt-2 rounded bg-blue-600 px-4 py-3 text-white">送出留言</button>
      </section>
      <section className="rounded border bg-white p-4">
        <h2 className="mb-2 text-xl font-semibold">文件清單</h2>
        <p>📄 發票.pdf　📊 對帳單.xlsx</p>
      </section>
      <section className="rounded border bg-white p-4">
        <h2 className="mb-2 text-xl font-semibold">任務清單</h2>
        <p>任務 1：整理進項憑證（進行中）</p>
      </section>
    </main>
  );
}
