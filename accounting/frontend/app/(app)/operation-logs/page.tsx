'use client';
import { useState } from 'react';

const ACTION_COLORS: Record<string, string> = {
  登入: 'bg-slate-100 text-slate-600',
  新增: 'bg-green-100 text-green-700',
  修改: 'bg-blue-100 text-blue-700',
  刪除: 'bg-red-100 text-red-700',
  上傳: 'bg-purple-100 text-purple-700',
  下載: 'bg-teal-100 text-teal-700',
  登出: 'bg-slate-100 text-slate-500',
  送審: 'bg-yellow-100 text-yellow-700',
};

const logs = [
  { id: 1, user: '陳美玲', role: '資深會計', action: '送審', target: '案件 A001（宏達貿易）', time: '2026-05-15 16:45', ip: '192.168.1.3' },
  { id: 2, user: '林國棟', role: '老闆', action: '修改', target: '案件 A001 → 退回修改', time: '2026-05-16 11:20', ip: '192.168.1.1' },
  { id: 3, user: '陳美玲', role: '資深會計', action: '上傳', target: '宏達貿易5月進項憑證彙整.xlsx', time: '2026-05-08 10:15', ip: '192.168.1.3' },
  { id: 4, user: '王志明', role: '一般會計', action: '修改', target: '客戶 C002（新光物流）聯絡人資料', time: '2026-05-17 09:30', ip: '192.168.1.4' },
  { id: 5, user: '林佳慧', role: '一般會計', action: '新增', target: '任務 T007（松山食品勞健保）', time: '2026-05-17 09:45', ip: '192.168.1.5' },
  { id: 6, user: '張淑芬', role: '主任', action: '修改', target: '案件 A008 負責人 → 張淑芬', time: '2026-05-16 09:00', ip: '192.168.1.2' },
  { id: 7, user: '陳美玲', role: '資深會計', action: '下載', target: '客戶對帳單5月.pdf', time: '2026-05-17 10:00', ip: '192.168.1.3' },
  { id: 8, user: '吳俊宏', role: '實習生', action: '登入', target: '系統', time: '2026-05-17 08:30', ip: '192.168.1.8' },
  { id: 9, user: '黃曉玲', role: '助理', action: '新增', target: '客戶 C004（信義建設）備注', time: '2026-05-16 14:30', ip: '192.168.1.7' },
  { id: 10, user: '李建宏', role: '資深會計', action: '修改', target: '合約 CT004 金額 → NT$ 12,000', time: '2026-05-15 11:00', ip: '192.168.1.6' },
  { id: 11, user: '林國棟', role: '老闆', action: '登出', target: '系統', time: '2026-05-16 18:30', ip: '192.168.1.1' },
  { id: 12, user: '王志明', role: '一般會計', action: '刪除', target: '草稿案件 A011（草稿）', time: '2026-05-14 15:00', ip: '192.168.1.4' },
];

const USERS = ['全部', '陳美玲', '王志明', '林佳慧', '李建宏', '張淑芬', '林國棟', '黃曉玲', '吳俊宏'];
const ACTIONS = ['全部', '登入', '新增', '修改', '刪除', '上傳', '下載', '送審', '登出'];

export default function OperationLogsPage() {
  const [filterUser, setFilterUser] = useState('全部');
  const [filterAction, setFilterAction] = useState('全部');
  const [search, setSearch] = useState('');

  const filtered = logs.filter((l) => {
    const matchUser = filterUser === '全部' || l.user === filterUser;
    const matchAction = filterAction === '全部' || l.action === filterAction;
    const matchSearch = l.user.includes(search) || l.target.includes(search);
    return matchUser && matchAction && matchSearch;
  });

  return (
    <main className="space-y-5 text-base">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">操作紀錄</h1>
          <p className="mt-1 text-sm text-slate-500">操作紀錄不可修改或刪除，僅限唯讀查閱</p>
        </div>
        <button className="rounded bg-green-600 px-5 py-3 text-white font-semibold hover:bg-green-700">匯出 Excel</button>
      </div>

      {/* 篩選 */}
      <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4">
        <input
          className="rounded border px-4 py-3 text-base w-52"
          placeholder="搜尋操作人、對象…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="rounded border px-4 py-3 text-base" value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
          {USERS.map((u) => <option key={u}>{u}</option>)}
        </select>
        <select className="rounded border px-4 py-3 text-base" value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
          {ACTIONS.map((a) => <option key={a}>{a}</option>)}
        </select>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
        <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => { setSearch(''); setFilterUser('全部'); setFilterAction('全部'); }}>清除篩選</button>
      </div>

      {/* 紀錄表格 */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-4 py-3 text-left font-semibold">操作人</th>
              <th className="px-4 py-3 text-left font-semibold">職稱</th>
              <th className="px-4 py-3 text-left font-semibold">動作</th>
              <th className="px-4 py-3 text-left font-semibold">操作對象</th>
              <th className="px-4 py-3 text-left font-semibold">操作時間</th>
              <th className="px-4 py-3 text-left font-semibold">IP 位址</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400">無符合條件的操作紀錄</td></tr>
            )}
            {filtered.map((l) => (
              <tr key={l.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{l.user}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{l.role}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${ACTION_COLORS[l.action] ?? 'bg-slate-100'}`}>
                    {l.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{l.target}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{l.time}</td>
                <td className="px-4 py-3 font-mono text-sm text-slate-400">{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t bg-slate-50 px-4 py-3 text-sm text-slate-500">
          顯示 {filtered.length} / {logs.length} 筆紀錄
        </div>
      </div>
    </main>
  );
}
