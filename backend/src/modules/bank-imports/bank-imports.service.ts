import { Injectable, BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BankImportsService {
  constructor(private readonly prisma: PrismaService) {}

  async enqueueImport(accountId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('需要上傳檔案');
    const imp = await this.prisma.bankImport.create({
      data: { accountId, filename: file.originalname, status: 'PROCESSING' },
    });

    try {
      const rows = this.parseBuffer(file.buffer.toString('base64'), file.originalname);
      let count = 0;

      for (const row of rows) {
        const hash = createHash('sha256')
          .update(`${accountId}|${row.txDate}|${row.amount}|${row.merchant}`)
          .digest('hex');

        const exists = await this.prisma.bankTransaction.findUnique({ where: { dedupeHash: hash } });
        if (exists) continue;

        const tx = await this.prisma.bankTransaction.create({
          data: {
            importId: imp.id,
            accountId,
            txDate: new Date(row.txDate),
            merchant: row.merchant,
            amount: row.amount,
            direction: row.direction,
            memo: row.memo,
            dedupeHash: hash,
          },
        });

        await this.prisma.ledgerTransaction.create({
          data: {
            source: 'BANK_IMPORT',
            status: 'PENDING',
            txDate: new Date(row.txDate),
            amount: row.amount,
            direction: row.direction,
            description: row.merchant,
            bankTxId: tx.id,
          },
        });
        count++;
      }

      await this.prisma.bankImport.update({
        where: { id: imp.id },
        data: { status: 'DONE', rowCount: count },
      });
      return { importId: imp.id, rowCount: count };
    } catch (e) {
      await this.prisma.bankImport.update({ where: { id: imp.id }, data: { status: 'FAILED' } });
      throw e;
    }
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

  private parseBuffer(base64: string, filename: string): any[] {
    const buf = Buffer.from(base64, 'base64');
    const text = buf.toString('utf-8');
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    return lines.slice(1).map(line => {
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = cols[i] ?? ''; });

      const dateKey = headers.find(h => h.includes('date') || h.includes('日期')) ?? headers[0];
      const amtKey = headers.find(h => h.includes('amount') || h.includes('金額')) ?? headers[1];
      const nameKey = headers.find(h => h.includes('merchant') || h.includes('摘要') || h.includes('說明')) ?? headers[2];
      const dirKey = headers.find(h => h.includes('debit') || h.includes('credit') || h.includes('支出') || h.includes('收入'));

      const rawAmt = parseFloat(obj[amtKey] ?? '0');
      let direction: 'DEBIT' | 'CREDIT' = 'DEBIT';
      if (dirKey) {
        direction = obj[dirKey]?.toLowerCase().includes('credit') || obj[dirKey]?.includes('收入') ? 'CREDIT' : 'DEBIT';
      } else {
        direction = rawAmt >= 0 ? 'DEBIT' : 'CREDIT';
      }

      return {
        txDate: obj[dateKey],
        amount: Math.abs(rawAmt).toString(),
        merchant: obj[nameKey] ?? '未知',
        direction,
        memo: obj['memo'] ?? obj['備註'] ?? '',
      };
    }).filter(r => r.txDate && !isNaN(Number(r.amount)));
  }
}
