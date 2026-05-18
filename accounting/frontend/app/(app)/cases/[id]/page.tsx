'use client';
import Link from 'next/link';
import { useState } from 'react';

const STATUS_STEPS = [
  '建立', '指派', '等待資料', '收到資料', '處理中',
  '送主管覆核', '退回修改', '待申報', '已申報', '歸檔', '結案',
];

const caseData = {
  id: 'A001',
  client: '宏達貿易股份有限公司',
  clientId: 'C001',
  type: '營業稅申報',
  owner: '陳美玲',
  month: '2026-05',
  status: '退回修改',
  dueDate: '2026-05-20',
  createdAt: '2026-05-01',
  taxId: '12345678',
  note: '5月份進銷項憑證整理，含進口報單',
  rejectReason: '附件缺少5月份進口報單影本，請補齊後重新送審。',
};

const timeline = [
  { date: '2026-05-01 09:00', action: '建立案件', by: '林主任', note: '' },
  { date: '2026-05-01 09:05', action: '指派負責人', by: '林主任', note: '指派給 陳美玲' },
  { date: '2026-05-03 14:30', action: '等待資料', by: '陳美玲', note: '通知客戶提供資料' },
  { date: '2026-05-08 10:15', action: '收到資料', by: '陳美玲', note: '客戶上傳進銷項資料' },
  { date: '2026-05-10 09:00', action: '處理中', by: '陳美玲', note: '開始整理申報資料' },
  { date: '2026-05-15 16:45', action: '送主管覆核', by: '陳美玲', note: '' },
  { date: '2026-05-16 11:20', action: '退回修改', by: '林主任', note: '缺少進口報單，請補件' },
];

const comments = [
  { id: 1, author: '林主任', date: '2026-05-16 11:20', text: '附件缺少5月份進口報單影本，請補齊後重新送審。' },
  { id: 2, author: '陳美玲', date: '2026-05-16 14:05', text: '了解，已通知客戶補件，預計明天可重新送審。' },
];

const documents = [
  { name: '5月進項憑證彙整.xlsx', size: '285KB', uploadedAt: '2026-05-08' },
  { name: '5月銷項憑證彙整.xlsx', size: '194KB', uploadedAt: '2026-05-08' },
  { name: '客戶對帳單.pdf', size: '512KB', uploadedAt: '2026-05-08' },
];

const tasks = [
  { id: 'T001', title: '整理進項憑證', assignee: '陳美玲', status: '完成', dueDate: '2026-05-12' },
  { id: 'T002', title: '整理銷項憑證', assignee: '陳美玲', status: '完成', dueDate: '2026-05-12' },
  { id: 'T003', title: '補件：進口報單', assignee: '陳美玲', status: '進行中', dueDate: '2026-05-17' },
];

const currentStep = STATUS_STEPS.indexOf(caseData.status);

export default function CaseDetailPage() {
  const [newComment, setNewComment] = useState('');
  const [commentList, setCommentList] = useState(comments);

  const addComment = () => {
    if (!newComment.trim()) return;
    setCommentList([...commentList, {
      id: commentList.length + 1,
      author: '王小美',
      date: new Date().toLocaleString('zh-TW', { hour12: false }).replace(/\//g, '-'),
      text: newComment,
    }]);
    setNewComment('');
  };

  return (
    <main className="space-y-5 text-base">
      {/* 頂部導覽 */}
      <div className="flex items-center gap-3">
        <Link href="/cases">
          <button className="rounded bg-slate-200 px-4 py-3 hover:bg-slate-300">← 返回案件列表</button>
        </Link>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
      </div>

      {/* 案件標題 */}
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              案件 {caseData.id}
              <span className="ml-3 rounded-full bg-red-100 px-3 py-1 text-base font-medium text-red-800">{caseData.status}</span>
            </h1>
            <p className="mt-1 text-slate-600">{caseData.client} · {caseData.type} · {caseData.month}</p>
          </div>
          <div className="text-right text-slate-500">
            <p>負責人：<span className="font-semibold text-slate-800">{caseData.owner}</span></p>
            <p>截止日：<span className="font-semibold text-red-600">{caseData.dueDate}</span></p>
          </div>
        </div>

        {/* 退回原因 */}
        {caseData.rejectReason && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-700">⚠ 退回原因</p>
            <p className="mt-1 text-red-700">{caseData.rejectReason}</p>
          </div>
        )}

        {/* 備注 */}
        <div className="mt-4">
          <p className="text-slate-500">備注：{caseData.note}</p>
        </div>
      </div>

      {/* 狀態時間軸 */}
      <div className="rounded-lg border bg-white p-5">
        <h2 className="mb-4 text-xl font-semibold">案件進度</h2>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {STATUS_STEPS.map((step, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            const future = i > currentStep;
            return (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center min-w-[80px]">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${done ? 'bg-green-500 text-white' : active ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <p className={`mt-1 text-center text-xs leading-tight
                    ${done ? 'text-green-700' : active ? 'text-red-700 font-semibold' : 'text-slate-400'}`}>
                    {step}
                  </p>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`h-0.5 w-8 flex-shrink-0 ${i < currentStep ? 'bg-green-400' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 操作時間軸 */}
      <div className="rounded-lg border bg-white p-5">
        <h2 className="mb-4 text-xl font-semibold">操作記錄</h2>
        <div className="space-y-3">
          {timeline.map((t, i) => (
            <div key={i} className="flex gap-4 border-l-2 border-slate-200 pl-4">
              <div className="min-w-[140px] text-sm text-slate-500">{t.date}</div>
              <div>
                <span className="font-semibold">{t.action}</span>
                <span className="ml-2 text-slate-500">by {t.by}</span>
                {t.note && <p className="mt-0.5 text-sm text-slate-600">{t.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 文件清單 */}
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">文件清單</h2>
          <button className="rounded bg-blue-600 px-4 py-2 text-white text-sm hover:bg-blue-700">上傳文件</button>
        </div>
        <div className="space-y-2">
          {documents.map((d, i) => (
            <div key={i} className="flex items-center justify-between rounded border p-3 hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="font-medium">{d.name}</p>
                  <p className="text-sm text-slate-500">{d.size} · 上傳日期：{d.uploadedAt}</p>
                </div>
              </div>
              <button className="rounded bg-slate-200 px-3 py-2 text-sm hover:bg-slate-300">下載</button>
            </div>
          ))}
        </div>
      </div>

      {/* 任務清單 */}
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">相關任務</h2>
          <Link href="/tasks/new"><button className="rounded bg-blue-600 px-4 py-2 text-white text-sm hover:bg-blue-700">新增任務</button></Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-3 py-2 text-left text-sm font-semibold">任務編號</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">任務名稱</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">負責人</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">截止日</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">狀態</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-t hover:bg-slate-50">
                <td className="px-3 py-2 font-mono text-sm">{t.id}</td>
                <td className="px-3 py-2">{t.title}</td>
                <td className="px-3 py-2">{t.assignee}</td>
                <td className="px-3 py-2">{t.dueDate}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-3 py-1 text-sm
                    ${t.status === '完成' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 留言區 */}
      <div className="rounded-lg border bg-white p-5">
        <h2 className="mb-4 text-xl font-semibold">討論留言</h2>
        <div className="space-y-4 mb-5">
          {commentList.map((c) => (
            <div key={c.id} className="rounded-lg border bg-slate-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{c.author}</span>
                <span className="text-sm text-slate-500">{c.date}</span>
              </div>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <textarea
            className="flex-1 rounded border px-4 py-3 text-base"
            placeholder="輸入留言…"
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button className="self-end rounded bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700" onClick={addComment}>
            送出
          </button>
        </div>
      </div>

      {/* 動作按鈕 */}
      <div className="rounded-lg border bg-white p-5">
        <h2 className="mb-4 text-xl font-semibold">案件操作</h2>
        <div className="flex flex-wrap gap-3">
          <button className="rounded bg-purple-600 px-5 py-3 text-white font-semibold hover:bg-purple-700">重新送審</button>
          <button className="rounded bg-orange-500 px-5 py-3 text-white font-semibold hover:bg-orange-600">標記為待申報</button>
          <button className="rounded border-2 border-red-300 px-5 py-3 text-red-700 font-semibold hover:bg-red-50">停用案件</button>
        </div>
      </div>
    </main>
  );
}
