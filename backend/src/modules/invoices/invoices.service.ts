import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async enqueueSync(userId: string, carrier: string) {
    const mockInvoices = [
      {
        invoiceNo: `AB${Date.now()}`,
        invoiceDate: new Date(),
        sellerName: '全家便利商店',
        sellerTaxId: '22099131',
        amount: 85,
        taxAmount: 4,
        carrier,
      },
    ];

    let count = 0;
    for (const inv of mockInvoices) {
      const exists = await this.prisma.invoiceRecord.findUnique({ where: { invoiceNo: inv.invoiceNo } });
      if (exists) continue;
      const record = await this.prisma.invoiceRecord.create({ data: { ...inv, userId } });
      await this.prisma.ledgerTransaction.create({
        data: {
          userId,
          source: 'INVOICE',
          status: 'PENDING',
          txDate: inv.invoiceDate,
          amount: inv.amount,
          direction: 'DEBIT',
          description: inv.sellerName,
          invoiceId: record.id,
        },
      });
      count++;
    }
    return { synced: count };
  }

  async list(userId: string, month?: string) {
    const where: any = { userId };
    if (month) {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return [];
      }
      const [y, m] = month.split('-').map(Number);
      where.invoiceDate = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
    }
    return this.prisma.invoiceRecord.findMany({
      where,
      orderBy: { invoiceDate: 'desc' },
      take: 100,
    });
  }
}
