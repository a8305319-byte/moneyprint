import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

function parseMonth(month?: string): { gte: Date; lt: Date } | undefined {
  if (!month) return undefined;
  if (!/^\d{4}-\d{2}$/.test(month)) throw new BadRequestException('月份格式必須為 YYYY-MM');
  const [y, m] = month.split('-').map(Number);
  if (m < 1 || m > 12) throw new BadRequestException('月份必須介於 01-12');
  return { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
}

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, month?: string) {
    const txDate = parseMonth(month);
    const where: any = { userId };
    if (txDate) where.txDate = txDate;
    const data = await this.prisma.ledgerTransaction.findMany({
      where,
      include: { category: true },
      orderBy: { txDate: 'desc' },
      take: 200,
    });
    return { data };
  }

  async create(userId: string, body: {
    description: string;
    amount: number;
    direction: 'DEBIT' | 'CREDIT';
    categoryName?: string;
    txDate?: string;
  }) {
    const { description, amount, direction, categoryName, txDate } = body;

    if (!description || !description.trim()) throw new BadRequestException('請填寫說明');
    if (!amount || amount <= 0) throw new BadRequestException('金額必須大於 0');

    // Find or create category
    let categoryId: string | undefined;
    if (categoryName && categoryName.trim()) {
      const name = categoryName.trim();
      const existing = await this.prisma.category.findFirst({ where: { userId, name } });
      if (existing) {
        categoryId = existing.id;
      } else {
        const ICONS: Record<string, string> = {
          餐飲: '🍱', 交通: '🚇', 購物: '🛍', 娛樂: '🎬',
          通訊: '📱', 薪資: '💰', 其他: '📋',
        };
        const created = await this.prisma.category.create({
          data: { userId, name, icon: ICONS[name] ?? '📋' },
        });
        categoryId = created.id;
      }
    }

    const date = txDate ? new Date(txDate) : new Date();

    const tx = await this.prisma.ledgerTransaction.create({
      data: {
        userId,
        source: 'MANUAL',
        status: 'CATEGORIZED',
        txDate: date,
        amount,
        direction,
        description: description.trim(),
        categoryId,
      },
      include: { category: true },
    });

    // Month summary
    const monthRange = parseMonth(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    )!;
    const monthTxs = await this.prisma.ledgerTransaction.findMany({
      where: { userId, txDate: monthRange },
    });
    const monthExpense = monthTxs.filter(t => t.direction === 'DEBIT').reduce((s, t) => s + Number(t.amount), 0);

    // Today summary
    const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayEnd   = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const todayTxs = await this.prisma.ledgerTransaction.findMany({
      where: { userId, txDate: { gte: todayStart, lt: todayEnd } },
    });
    const todayExpense = todayTxs.filter(t => t.direction === 'DEBIT').reduce((s, t) => s + Number(t.amount), 0);

    return {
      data: {
        transaction: tx,
        todaySummary:  { totalExpense: todayExpense, txCount: todayTxs.length },
        monthSummary:  { totalExpense: monthExpense, txCount: monthTxs.length },
      },
    };
  }
}
