import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { QUEUE_INVOICE_SYNC } from '../../jobs/queues.constant';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_INVOICE_SYNC) private readonly queue: Queue,
  ) {}

  async enqueueSync(carrier: string) {
    await this.queue.add('sync', { carrier });
    return { queued: true };
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
