import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async autoMatch(userId: string) {
    const bankTxs = await this.prisma.bankTransaction.findMany({
      where: {
        account: { userId },
        matchItems: { none: {} },
      },
      include: { ledger: true },
      take: 200,
    });
    const invoices = await this.prisma.invoiceRecord.findMany({
      where: {
        userId,
        matchItems: { none: {} },
      },
      take: 200,
    });

    let matched = 0;
    for (const tx of bankTxs) {
      const candidates = invoices.filter(inv => {
        const daysDiff = Math.abs(new Date(tx.txDate).getTime() - new Date(inv.invoiceDate).getTime()) / 86400000;
        const amtDiff = Math.abs(Number(tx.amount) - Number(inv.amount));
        return daysDiff <= 3 && amtDiff < 1;
      });

      if (candidates.length === 0) continue;
      const best = candidates[0];
      const confidence = this.calcConfidence(tx, best);
      if (confidence < 0.4) continue;

      await this.prisma.transactionMatch.create({
        data: {
          confidence,
          status: confidence >= 0.8 ? 'CONFIRMED' : 'PENDING',
          items: {
            create: [
              { bankTxId: tx.id },
              { invoiceId: best.id },
            ],
          },
        },
      });
      matched++;
    }
    return { matched };
  }

  private calcConfidence(tx: any, inv: any): number {
    let score = 0;
    const amtDiff = Math.abs(Number(tx.amount) - Number(inv.amount));
    if (amtDiff === 0) score += 0.5;
    else if (amtDiff < 1) score += 0.3;

    const daysDiff = Math.abs(new Date(tx.txDate).getTime() - new Date(inv.invoiceDate).getTime()) / 86400000;
    if (daysDiff === 0) score += 0.3;
    else if (daysDiff <= 1) score += 0.2;
    else if (daysDiff <= 3) score += 0.1;

    const txName = (tx.merchant ?? '').toLowerCase();
    const invName = (inv.sellerName ?? '').toLowerCase();
    if (txName && invName && (txName.includes(invName.slice(0, 3)) || invName.includes(txName.slice(0, 3)))) score += 0.2;

    return Math.min(score, 1);
  }

  async listPending(userId: string) {
    return this.prisma.transactionMatch.findMany({
      where: {
        status: 'PENDING',
        items: {
          some: {
            OR: [
              { bankTx: { account: { userId } } },
              { invoice: { userId } },
            ],
          },
        },
      },
      include: {
        items: {
          include: {
            bankTx: true,
            invoice: true,
          },
        },
      },
      orderBy: { confidence: 'desc' },
    });
  }

  /** confirm 前先驗 owner：match 的任一 item 必須屬於 userId */
  async confirmMatch(userId: string, id: string) {
    await this.assertOwner(userId, id);
    return this.prisma.transactionMatch.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    });
  }

  /** reject 前先驗 owner */
  async rejectMatch(userId: string, id: string) {
    await this.assertOwner(userId, id);
    return this.prisma.transactionMatch.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }

  private async assertOwner(userId: string, matchId: string) {
    const match = await this.prisma.transactionMatch.findFirst({
      where: {
        id: matchId,
        items: {
          some: {
            OR: [
              { bankTx: { account: { userId } } },
              { invoice: { userId } },
            ],
          },
        },
      },
    });
    if (!match) throw new ForbiddenException('無權操作此配對記錄');
  }
}
