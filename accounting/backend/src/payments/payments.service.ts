import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';

let idCounter = 10;

const payments: any[] = [
  { id: 'P001', clientId: 'C001', clientName: '宏達貿易', month: '2026-05', amount: 8000, status: '已收款', dueDate: '2026-05-10', paidAt: '2026-05-05', method: '匯款', note: '', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'P002', clientId: 'C002', clientName: '新光物流', month: '2026-05', amount: 5000, status: '未收款', dueDate: '2026-05-10', paidAt: null, method: '', note: '已電話催款一次', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'P003', clientId: 'C003', clientName: '全台科技', month: '2026-05', amount: 7500, status: '已收款', dueDate: '2026-05-10', paidAt: '2026-05-08', method: '匯款', note: '', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'P004', clientId: 'C004', clientName: '信義建設', month: '2026-05', amount: 12000, status: '未收款', dueDate: '2026-05-10', paidAt: null, method: '', note: '', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'P005', clientId: 'C005', clientName: '松山食品', month: '2026-05', amount: 6000, status: '已收款', dueDate: '2026-05-10', paidAt: '2026-05-03', method: '現金', note: '', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'P006', clientId: 'C006', clientName: '大安診所', month: '2026-05', amount: 9000, status: '已收款', dueDate: '2026-05-10', paidAt: '2026-05-07', method: '匯款', note: '', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'P007', clientId: 'C001', clientName: '宏達貿易', month: '2026-04', amount: 8000, status: '已收款', dueDate: '2026-04-10', paidAt: '2026-04-07', method: '匯款', note: '', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'P008', clientId: 'C002', clientName: '新光物流', month: '2026-04', amount: 5000, status: '已收款', dueDate: '2026-04-10', paidAt: '2026-04-12', method: '匯款', note: '遲繳2天', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'P009', clientId: 'C001', clientName: '宏達貿易', month: '2026-02', amount: 8000, status: '逾期未收', dueDate: '2026-02-10', paidAt: null, method: '', note: '已多次催款', deletedAt: null, lastModifiedBy: 'system' },
];

@Injectable()
export class PaymentsService {
  findAll(month?: string, clientId?: string, status?: string) {
    return payments.filter((p) => {
      if (p.deletedAt) return false;
      if (month && p.month !== month) return false;
      if (clientId && p.clientId !== clientId) return false;
      if (status && p.status !== status) return false;
      return true;
    });
  }

  findOne(id: string) {
    const p = payments.find((p) => p.id === id && !p.deletedAt);
    if (!p) throw new NotFoundException('找不到收款記錄');
    return p;
  }

  create(dto: CreatePaymentDto) {
    const id = `P${String(idCounter++).padStart(3, '0')}`;
    const item = { id, ...dto, status: '未收款', paidAt: null, method: '', deletedAt: null };
    payments.push(item);
    return item;
  }

  update(id: string, dto: Partial<CreatePaymentDto>) {
    const i = payments.findIndex((p) => p.id === id && !p.deletedAt);
    if (i === -1) throw new NotFoundException('找不到收款記錄');
    payments[i] = { ...payments[i], ...dto };
    return payments[i];
  }

  markPaid(id: string, method: string, lastModifiedBy: string) {
    const i = payments.findIndex((p) => p.id === id && !p.deletedAt);
    if (i === -1) throw new NotFoundException('找不到收款記錄');
    if (payments[i].status === '已收款') return payments[i];
    const now = new Date().toISOString().split('T')[0];
    payments[i].status = '已收款';
    payments[i].paidAt = now;
    payments[i].method = method ?? '匯款';
    payments[i].lastModifiedBy = lastModifiedBy;
    return payments[i];
  }

  softDelete(id: string) {
    const i = payments.findIndex((p) => p.id === id && !p.deletedAt);
    if (i === -1) throw new NotFoundException('找不到收款記錄');
    payments[i].deletedAt = new Date().toISOString();
    return payments[i];
  }
}
