import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
type Decimal = Prisma.Decimal;

@Injectable()
export class BusinessInvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, body: {
    direction: 'RECEIVED' | 'ISSUED';
    format?: string;
    invoiceNo: string;
    invoiceDate: string;
    counterpartyName: string;
    counterpartyTaxId?: string;
    amount: number;
    taxType?: 'TAXABLE' | 'ZERO_RATE' | 'EXEMPT';
    description?: string;
    imageUrl?: string;
  }) {
    const amount = Number(body.amount);
    const taxType = body.taxType ?? 'TAXABLE';
    let taxAmount = 0;
    let untaxedAmount = amount;

    if (taxType === 'TAXABLE') {
      // amount is tax-inclusive: tax = amount * 5/105
      taxAmount = Math.round((amount * 5 / 105) * 100) / 100;
      untaxedAmount = Math.round((amount - taxAmount) * 100) / 100;
    }

    return this.prisma.businessInvoice.create({
      data: {
        userId,
        direction: body.direction,
        format: (body.format as any) ?? 'ELECTRONIC',
        invoiceNo: body.invoiceNo,
        invoiceDate: new Date(body.invoiceDate),
        counterpartyName: body.counterpartyName,
        counterpartyTaxId: body.counterpartyTaxId,
        amount,
        taxAmount,
        untaxedAmount,
        taxType: taxType as any,
        description: body.description,
        imageUrl: body.imageUrl,
      },
    });
  }

  async list(userId: string, direction?: string, month?: string) {
    const where: any = { userId };
    if (direction) where.direction = direction;
    if (month) {
      const [y, m] = month.split('-').map(Number);
      where.invoiceDate = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
    }
    return this.prisma.businessInvoice.findMany({
      where,
      orderBy: { invoiceDate: 'desc' },
    });
  }

  async monthlySummary(userId: string, month?: string) {
    const m = month ?? new Date().toISOString().slice(0, 7);
    const [y, mo] = m.split('-').map(Number);
    const where = {
      userId,
      invoiceDate: { gte: new Date(y, mo - 1, 1), lt: new Date(y, mo, 1) },
    };

    const received = await this.prisma.businessInvoice.findMany({ where: { ...where, direction: 'RECEIVED' } });
    const issued = await this.prisma.businessInvoice.findMany({ where: { ...where, direction: 'ISSUED' } });

    const sum = (arr: any[]) => ({
      count: arr.length,
      amount: arr.reduce((s, i) => s + Number(i.amount), 0),
      taxAmount: arr.reduce((s, i) => s + Number(i.taxAmount), 0),
      untaxedAmount: arr.reduce((s, i) => s + Number(i.untaxedAmount), 0),
    });

    const user = await this.prisma.appUser.findUnique({ where: { id: userId }, select: { invoiceQuota: true } });

    return {
      month: m,
      received: sum(received),
      issued: sum(issued),
      netTax: sum(issued).taxAmount - sum(received).taxAmount,
      remainingQuota: (user?.invoiceQuota ?? 0) - issued.length,
    };
  }

  async getUser(userId: string) {
    return this.prisma.appUser.findUnique({
      where: { id: userId },
      select: { name: true, companyName: true, taxId: true, email: true, invoiceQuota: true },
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.businessInvoice.deleteMany({ where: { id, userId } });
  }
}
