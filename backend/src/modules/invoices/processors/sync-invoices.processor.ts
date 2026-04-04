import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../../../prisma/prisma.service';
import { QUEUE_INVOICE_SYNC } from '../../../jobs/queues.constant';

@Processor(QUEUE_INVOICE_SYNC)
export class SyncInvoicesProcessor {
  constructor(private readonly prisma: PrismaService) {}

  @Process('sync')
  async handle(job: Job<{ carrier: string }>) {
    // TODO: Replace with real 財政部電子發票 API
    const mockInvoices = [
      {
        invoiceNo: `AB${Date.now()}`,
        invoiceDate: new Date(),
        sellerName: '全家便利商店',
        sellerTaxId: '22099131',
        amount: 85,
        taxAmount: 4,
        carrier: job.data.carrier,
      },
    ];

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
    }
  }
}
