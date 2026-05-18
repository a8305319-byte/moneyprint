'use client';
import { useState } from 'react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [companyName, setCompanyName] = useState('宏遠會計事務所');
  const [stuckDays, setStuckDays] = useState(7);
  const [reminderDays, setReminderDays] = useState(3);
  const [trashDays, setTrashDays] = useState(30);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyOverdue, setNotifyOverdue] = useState(true);
  const [notifyReview, setNotifyReview] = useState(true);
  const [notifyAssign, setNotifyAssign] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <main className="space-y-5 text-base max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">系統設定</h1>
        <button
          className="rounded bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700"
          onClick={handleSave}
        >
          儲存設定
        </button>
      </div>

      {saved && (
        <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-green-800 font-medium">
          ✓ 設定已儲存
        </div>
      )}

      {/* 公司資訊 */}
      <div className="rounded-lg border bg-white p-5">
        <h2 className="mb-4 text-xl font-semibold">公司資訊</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block font-semibold">公司名稱</label>
            <input
              className="w-full rounded border px-4 py-3 text-base"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block font-semibold">系統版本</label>
            <input className="w-full rounded border bg-slate-50 px-4 py-3 text-base text-slate-500" value="v0.1.0" readOnly />
          </div>
        </div>
      </div>

      {/* 案件規則 */}
      <div className="rounded-lg border bg-white p-5">
        <h2 className="mb-4 text-xl font-semibold">案件提醒規則</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block font-semibold">案件「卡住」判定天數</label>
            <div className="flex items-center gap-3">
              <input
                className="w-32 rounded border px-4 py-3 text-base"
                type="number"
                min={1}
                max={30}
                value={stuckDays}
                onChange={(e) => setStuckDays(Number(e.target.value))}
              />
              <span className="text-slate-600">天</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">案件超過 {stuckDays} 天未更新，系統自動發出提醒通知</p>
          </div>
          <div>
            <label className="mb-1 block font-semibold">逾期提前提醒天數</label>
            <div className="flex items-center gap-3">
              <input
                className="w-32 rounded border px-4 py-3 text-base"
                type="number"
                min={1}
                max={14}
                value={reminderDays}
                onChange={(e) => setReminderDays(Number(e.target.value))}
              />
              <span className="text-slate-600">天前提醒</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">案件截止前 {reminderDays} 天發送提醒通知</p>
          </div>
          <div>
            <label className="mb-1 block font-semibold">垃圾桶自動永久刪除</label>
            <div className="flex items-center gap-3">
              <input
                className="w-32 rounded border px-4 py-3 text-base"
                type="number"
                min={7}
                max={180}
                value={trashDays}
                onChange={(e) => setTrashDays(Number(e.target.value))}
              />
              <span className="text-slate-600">天後永久刪除</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">進入垃圾桶的資料超過 {trashDays} 天後將永久刪除，無法還原</p>
          </div>
        </div>
      </div>

      {/* 通知設定 */}
      <div className="rounded-lg border bg-white p-5">
        <h2 className="mb-4 text-xl font-semibold">通知設定</h2>
        <div className="space-y-4">
          {[
            { label: 'Email 通知', desc: '系統通知同步發送至帳號信箱', value: notifyEmail, set: setNotifyEmail },
            { label: '逾期提醒', desc: '案件逾期或即將逾期時通知', value: notifyOverdue, set: setNotifyOverdue },
            { label: '覆核通知', desc: '案件送審或退回時通知', value: notifyReview, set: setNotifyReview },
            { label: '指派通知', desc: '被指派負責新案件或任務時通知', value: notifyAssign, set: setNotifyAssign },
          ].map((item) => (
            <label key={item.label} className="flex items-start justify-between gap-4 cursor-pointer">
              <div>
                <p className="font-semibold">{item.label}</p>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
              <div
                className={`relative flex-shrink-0 h-7 w-12 rounded-full cursor-pointer transition-colors ${item.value ? 'bg-blue-600' : 'bg-slate-300'}`}
                onClick={() => item.set(!item.value)}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${item.value ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 帳號 */}
      <div className="rounded-lg border bg-white p-5">
        <h2 className="mb-4 text-xl font-semibold">我的帳號</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">姓名</p>
            <p className="font-semibold">王小美</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">角色</p>
            <p className="font-semibold">資深會計</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p>wang@firm.com</p>
          </div>
        </div>
        <div className="mt-4">
          <button className="rounded bg-amber-500 px-5 py-3 text-white font-semibold hover:bg-amber-600">修改密碼</button>
        </div>
      </div>

      <p className="text-sm text-slate-400">最後修改：系統管理員 · 2026-05-17 10:30</p>
    </main>
  );
}
