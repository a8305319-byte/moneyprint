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
}
