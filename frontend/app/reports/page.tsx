'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const COLORS = ['#6c63ff', '#48cfad', '#ff6b6b', '#ffd93d', '#4fc3f7', '#f78fb3'];

const MONTHS = Array.from({ length: 6 }, (_, i) => {
  const d = new Date(); d.setMonth(d.getMonth() - i);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
});

interface Summary { month: string; totalIncome: number; totalExpense: number; netFlow: number; txCount: number; }
interface Category { categoryName: string; totalAmount: number; txCount: number; percentage: number; }

export default function ReportsPage() {
  const [month, setMonth] = useState(MONTHS[0]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [breakdown, setBreakdown] = useState<Category[]>([]);
  const [trend, setTrend] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/reports/monthly-summary?month=${month}`).then(r => r.json()).catch(() => ({ data: null })),
      fetch(`${API}/reports/category-breakdown?month=${month}`).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${API}/reports/monthly-trend?months=6`).then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([s, b, t]) => {
      setSummary(s.data);
      setBreakdown(b.data ?? []);
      setTrend((t.data ?? []).slice().reverse().map((x: any) => ({ ...x, label: x.month?.slice(5) + '月' })));
    });
  }, [month]);

  return (
    <div style={{ minHeight: '100dvh', background: '#f5f6fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #48cfad 0%, #6c63ff 100%)', padding: '52px 20px 28px' }}>
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: '-0.3px', marginBottom: 20 }}>報表</div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {MONTHS.map(m => (
            <button key={m} onClick={() => setMonth(m)} style={{
              flexShrink: 0, padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: m === month ? '#fff' : 'rgba(255,255,255,0.18)',
              color: m === month ? '#6c63ff' : '#fff',
              fontSize: 13, fontWeight: m === month ? 700 : 500,
            }}>{m.slice(5)}月</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 32px' }}>
        {/* Summary cards */}
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              { label: '支出', value: summary.totalExpense, color: '#ff6b6b' },
              { label: '收入', value: summary.totalIncome, color: '#26de81' },
              { label: '淨流', value: summary.netFlow, color: summary.netFlow >= 0 ? '#26de81' : '#ff6b6b' },
            ].map(c => (
              <div key={c.label} style={{
                background: '#fff', borderRadius: 18, padding: '16px 12px',
                boxShadow: '0 2px 16px rgba(108,99,255,0.07)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 11, color: '#8892a4', fontWeight: 600, marginBottom: 6, letterSpacing: '0.3px' }}>{c.label}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: c.color, letterSpacing: '-0.3px' }}>
                  NT$ {Math.abs(c.value ?? 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 6-month bar chart */}
        {trend.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 20px rgba(108,99,255,0.08)', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', marginBottom: 18 }}>📈 近6個月趨勢</div>
            <ResponsiveContainer width="100%" height={168}>
              <BarChart data={trend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8892a4' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8892a4' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: any) => `NT$ ${Number(v).toLocaleString()}`}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }}
                  cursor={{ fill: 'rgba(108,99,255,0.04)' }}
                />
                <Bar dataKey="totalExpense" name="支出" fill="#6c63ff" radius={[6, 6, 0, 0]} maxBarSize={24} />
                <Bar dataKey="totalIncome" name="收入" fill="#48cfad" radius={[6, 6, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12 }}>
              {[{ color: '#6c63ff', label: '支出' }, { color: '#48cfad', label: '收入' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                  <span style={{ fontSize: 12, color: '#8892a4' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category breakdown */}
        {breakdown.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 20px rgba(108,99,255,0.08)', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', marginBottom: 18 }}>🗂 支出類別</div>

            {/* Donut + legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ flexShrink: 0 }}>
                <ResponsiveContainer width={110} height={110}>
                  <PieChart>
                    <Pie data={breakdown} dataKey="totalAmount" cx="50%" cy="50%" innerRadius={32} outerRadius={52} paddingAngle={3} strokeWidth={0}>
                      {breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {breakdown.slice(0, 5).map((b, i) => (
                  <div key={b.categoryName} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 12, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{b.categoryName}</div>
                    <div style={{ fontSize: 11, color: '#8892a4', flexShrink: 0, fontWeight: 600 }}>{b.percentage?.toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bars */}
            {breakdown.map((b, i) => (
              <div key={b.categoryName} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                    <span style={{ fontSize: 13, color: '#1a1a2e', fontWeight: 500 }}>{b.categoryName}</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#8892a4' }}>NT$ {Number(b.totalAmount).toLocaleString()}</span>
                </div>
                <div style={{ height: 7, background: '#f0f2f8', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4,
                    background: COLORS[i % COLORS.length],
                    width: `${b.percentage}%`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!summary && breakdown.length === 0 && trend.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
            <div style={{ color: '#1a1a2e', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>尚無報表資料</div>
            <div style={{ color: '#8892a4', fontSize: 13 }}>本月尚無交易記錄</div>
          </div>
        )}
      </div>
    </div>
  );
}
