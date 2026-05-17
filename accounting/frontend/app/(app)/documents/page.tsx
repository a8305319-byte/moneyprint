export default function DocumentsPage() {
  return (
    <main className="space-y-4 text-base">
      <h1 className="text-2xl font-bold">文件與憑證管理</h1>
      <div className="flex flex-wrap gap-3">
        <button className="rounded bg-slate-200 px-4 py-3">返回</button>
        <input className="rounded border px-4 py-3" placeholder="搜尋文件" />
        <button className="rounded bg-slate-200 px-4 py-3">列印</button>
        <select className="rounded border px-4 py-3">
          <option>全部分類</option><option>收據憑證</option><option>發票</option>
          <option>合約</option><option>報表</option><option>申報書</option>
        </select>
      </div>
      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-2xl">📁</p>
        <p className="mt-2 text-lg font-semibold">拖曳檔案到這裡上傳</p>
        <p className="text-slate-500">支援 PDF、JPG、PNG、Excel、Word，單檔最大 50MB</p>
        <button className="mt-4 rounded bg-blue-600 px-6 py-3 text-white">選擇檔案</button>
      </div>
      <table className="w-full border bg-white">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-3 text-left">檔名</th>
            <th className="p-3 text-left">分類</th>
            <th className="p-3 text-left">上傳人</th>
            <th className="p-3 text-left">日期</th>
            <th className="p-3 text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-3">發票明細.pdf</td><td className="p-3">發票</td>
            <td className="p-3">陳會計</td><td className="p-3">2026-05-17</td>
            <td className="p-3 flex gap-2">
              <button className="rounded bg-slate-200 px-3 py-2 text-sm">預覽</button>
              <button className="rounded bg-slate-200 px-3 py-2 text-sm">下載</button>
              <button className="rounded bg-red-100 px-3 py-2 text-sm text-red-600">刪除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
