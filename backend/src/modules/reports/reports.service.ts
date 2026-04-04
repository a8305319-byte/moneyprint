import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private monthRange(month: string) {
    const [y, m] = month.split('-').map(Number);
    return { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
  }

  async getMonthlySummary(month: string) {
    const range = this.monthRange(month);
    const txs = await this.prisma.ledgerTransaction.findMany({
      where: { txDate: range },
    });
    const totalExpense = txs.filter(t => t.direction === 'DEBIT').reduce((s, t) => s + Number(t.amount), 0);
    const totalIncome = txs.filter(t => t.direction === 'CREDIT').reduce((s, t) => s + Number(t.amount), 0);
    return { month, totalExpense, totalIncome, netFlow: totalIncome - totalExpense, txCount: txs.length };
  }

  async getCategoryBreakdown(month: string) {
    const range = this.monthRange(month);
    const txs = await this.prisma.ledgerTransaction.findMany({
      where: { txDate: range, direction: 'DEBIT', categoryId: { not: null } },
      include: { category: true },
    });
    const total = txs.reduce((s, t) => s + Number(t.amount), 0);
    const map = new Map<string, { name: string; amount: number; count: number }>();
    for (const tx of txs) {
      const key = tx.categoryId!;
      const cur = map.get(key) ?? { name: tx.category?.name ?? '未分類', amount: 0, count: 0 };
      cur.amount += Number(tx.amount);
      cur.count++;
      map.set(key, cur);
    }
    return Array.from(map.values())
      .map(c => ({ ...c, percentage: total > 0 ? (c.amount / total) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);
  }

  async getMonthlyTrend(months: number) {
    const results = [];
    for (let i = 0; i < months; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      results.push(await this.getMonthlySummary(month));
    }
    return results;
  }
}
