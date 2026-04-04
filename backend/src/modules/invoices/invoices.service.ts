import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async enqueueSync(carrier: string) {
    // Process synchronously (mock data until real API key configured)
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
      const record = await this.prisma.invoiceRecord.create({ data: inv });
      await this.prisma.ledgerTransaction.create({
        data: {
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

  async list(month?: string) {
    const where: any = {};
    if (month) {
      const [y, m] = month.split('-').map(Number);
      where.invoiceDate = {
        gte: new Date(y, m - 1, 1),
        lt: new Date(y, m, 1),
      };
    }
    return this.prisma.invoiceRecord.findMany({
      where,
      orderBy: { invoiceDate: 'desc' },
      take: 100,
    });
  }
}
