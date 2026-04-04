import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { QUEUE_BANK_IMPORT } from '../../jobs/queues.constant';

@Injectable()
export class BankImportsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_BANK_IMPORT) private readonly queue: Queue,
  ) {}

  async enqueueImport(accountId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('需要上傳檔案');
    const imp = await this.prisma.bankImport.create({
      data: { accountId, filename: file.originalname, status: 'QUEUED' },
    });
    await this.queue.add('process', {
      importId: imp.id,
      accountId,
      buffer: file.buffer.toString('base64'),
      filename: file.originalname,
    });
    return { importId: imp.id };
  }

  async getStatus(importId: string) {
    return this.prisma.bankImport.findUnique({
      where: { id: importId },
      select: { id: true, status: true, rowCount: true, filename: true, importedAt: true },
    });
  }

  async list(accountId: string) {
    return this.prisma.bankImport.findMany({
      where: { accountId },
      orderBy: { importedAt: 'desc' },
      take: 20,
    });
  }

  computeDedupeHash(accountId: string, txDate: string, amount: string, merchant: string): string {
    return createHash('sha256').update(`${accountId}|${txDate}|${amount}|${merchant}`).digest('hex');
  }
}
