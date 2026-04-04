import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  async list(month?: string) {
    const where: any = {};
    if (month) {
      const [y, m] = month.split('-').map(Number);
      where.txDate = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
    }
    const data = await this.prisma.ledgerTransaction.findMany({
      where,
      include: { category: true },
      orderBy: { txDate: 'desc' },
      take: 200,
    });
    return { data };
  }
}
