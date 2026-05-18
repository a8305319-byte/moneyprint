'use client';
import Link from 'next/link';
import { useState } from 'react';

const client = {
  id: 'C001',
  name: '宏達貿易股份有限公司',
  taxId: '12345678',
  phone: '02-1234-5678',
  address: '台北市信義區信義路五段7號12樓',
  contactName: '陳小姐',
  contactPhone: '0912-345-678',
  contactEmail: 'chen@hd-trade.com.tw',
  owner: '陳美玲',
  status: '合作中',
  since: '2022-03-01',
  taxType: '一般稅籍',
  invoiceType: '電子發票',
  reportMonth: '單月申報（1、3、5、7、9、11月）',
  bankAccount: '台灣銀行 0123456789012',
  note: '老客戶，配合度高。每月5號前提供上月憑證。',
  lastModifiedBy: '陳美玲',
  lastModifiedAt: '2026-05-17 09:30',
};

const relatedCases = [
  { id: 'A001', type: '營業稅申報', month: '2026-05', status: '退回修改', owner: '陳美玲' },
  { id: 'A004', type: '綜所稅申報', month: '2026-04', status: '已申報', owner: '陳美玲' },
  { id: 'A011', type: '營業稅申報', month: '2026-03', status: '結案', owner: '陳美玲' },
];

const contracts = [
  { id: 'CT001', type: '年度記帳合約', startDate: '2026-01-01', endDate: '2026-12-31', amount: 96000, status: '有效' },
  { id: 'CT002', type: '年度記帳合約', startDate: '2025-01-01', endDate: '2025-12-31', amount: 90000, status: '已到期' },
];

const payments = [
  { id: 'P001', month: '2026-05', amount: 8000, paidAt: '2026-05-05', status: '已收款' },
  { id: 'P002', month: '2026-04', amount: 8000, paidAt: '2026-04-07', status: '已收款' },
  { id: 'P003', month: '2026-03', amount: 8000, paidAt: '2026-03-04', status: '已收款' },
  { id: 'P004', month: '2026-02', amount: 8000, paidAt: null, status: '未收款' },
];

const STATUS_COLORS: Record<string, string> = {
  退回修改: 'bg-red-100 text-red-800',
  已申報: 'bg-teal-100 text-teal-800',
  結案: 'bg-gray-200 text-gray-700',
  送主管覆核: 'bg-purple-100 text-purple-800',
  處理中: 'bg-blue-100 text-blue-800',
  有效: 'bg-green-100 text-green-800',
  已到期: 'bg-slate-100 text-slate-600',
  已收款: 'bg-green-100 text-green-800',
  未收款: 'bg-red-100 text-red-800',
};

export default function ClientDetailPage() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <main className="space-y-5 text-base">
      {/* 頂部導覽 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <Link href="/clients">
            <button className="rounded bg-slate-200 px-4 py-3 hover:bg-slate-300">← 返回客戶列表</button>
          </Link>
          <button className="rounded bg-slate-100 px-4 py-3 hover:bg-slate-200" onClick={() => window.print()}>列印</button>
        </div>
        <button
          className="rounded bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? '取消編輯' : '編輯資料'}
        </button>
      </div>

      {/* 基本資料 */}
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{client.name}</h1>
          <span className="rounded-full bg-green-100 px-4 py-1 text-base font-medium text-green-800">{client.status}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <div>
            <p className="text-sm text-slate-500">統一編號</p>
            <p className="font-mono font-semibold">{client.taxId}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">公司電話</p>
            <p className="font-semibold">{client.phone}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">公司地址</p>
            <p>{client.address}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">負責會計</p>
            <p className="font-semibold">{client.owner}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">稅籍類別</p>
            <p>{client.taxType}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">發票類型</p>
            <p>{client.invoiceType}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">申報週期</p>
            <p>{client.reportMonth}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">銀行帳號</p>
            <p className="font-mono">{client.bankAccount}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-slate-500">備注</p>
            <p>{client.note}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          最後修改：{client.lastModifiedBy} · {client.lastModifiedAt}
        </p>
      </div>

      {/* 聯絡人 */}
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">聯絡人資料</h2>
          <button className="rounded bg-slate-200 px-3 py-2 text-sm hover:bg-slate-300">編輯</button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-slate-500">聯絡人姓名</p>
            <p className="font-semibold">{client.contactName}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">聯絡電話</p>
            <p>{client.contactPhone}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">電子郵件</p>
            <p>{client.contactEmail}</p>
          </div>
        </div>
      </div>

      {/* 相關案件 */}
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">相關案件</h2>
          <Link href="/cases/new">
            <button className="rounded bg-blue-600 px-4 py-2 text-white text-sm hover:bg-blue-700">新增案件</button>
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-3 py-2 text-left text-sm font-semibold">案件編號</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">申報類型</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">月份</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">負責人</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">狀態</th>
            </tr>
          </thead>
          <tbody>
            {relatedCases.map((c) => (
              <tr key={c.id} className="border-t hover:bg-slate-50">
                <td className="px-3 py-2">
                  <Link href={`/cases/${c.id}`} className="font-mono font-semibold text-blue-600 hover:underline">{c.id}</Link>
                </td>
                <td className="px-3 py-2">{c.type}</td>
                <td className="px-3 py-2">{c.month}</td>
                <td className="px-3 py-2">{c.owner}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[c.status] ?? 'bg-slate-100'}`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 合約記錄 */}
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">合約記錄</h2>
          <Link href="/contracts">
            <button className="rounded bg-slate-200 px-4 py-2 text-sm hover:bg-slate-300">查看所有合約</button>
          </Link>
        </div>
        <div className="space-y-3">
          {contracts.map((ct) => (
            <div key={ct.id} className="flex items-center justify-between rounded border p-3">
              <div>
                <p className="font-medium">{ct.type}</p>
                <p className="text-sm text-slate-500">{ct.startDate} ～ {ct.endDate}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-semibold">NT$ {ct.amount.toLocaleString()}</p>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[ct.status]}`}>
                  {ct.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 收款記錄 */}
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">收款記錄</h2>
          <Link href="/payments">
            <button className="rounded bg-slate-200 px-4 py-2 text-sm hover:bg-slate-300">查看所有收款</button>
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-3 py-2 text-left text-sm font-semibold">月份</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">金額</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">收款日</th>
              <th className="px-3 py-2 text-left text-sm font-semibold">狀態</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className={`border-t hover:bg-slate-50 ${p.status === '未收款' ? 'bg-red-50' : ''}`}>
                <td className="px-3 py-2">{p.month}</td>
                <td className="px-3 py-2 font-semibold">NT$ {p.amount.toLocaleString()}</td>
                <td className="px-3 py-2 text-sm text-slate-500">{p.paidAt ?? '—'}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[p.status]}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 危險操作 */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-5">
        <h2 className="mb-3 text-xl font-semibold text-red-800">危險操作</h2>
        <button className="rounded border-2 border-red-400 px-5 py-3 text-red-700 font-semibold hover:bg-red-100">
          停止合作（軟刪除）
        </button>
      </div>
    </main>
  );
}
