import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';

let idCounter = 8;

const notifications: any[] = [
  {
    id: 'N001', recipientId: 'E003', type: '逾期',
    title: '案件 A002 已逾期',
    body: '新光物流 2026-05 扣繳申報已超過截止日，請盡快處理。',
    caseId: 'A002', read: false, createdAt: '2026-05-18 08:00', deletedAt: null,
  },
  {
    id: 'N002', recipientId: 'E003', type: '退回',
    title: '案件 A001 被主管退回',
    body: '林主任退回宏達貿易案件，退回原因：缺少進口報單。',
    caseId: 'A001', read: false, createdAt: '2026-05-16 11:20', deletedAt: null,
  },
  {
    id: 'N003', recipientId: 'E002', type: '送審',
    title: '陳美玲送來案件 A009 待覆核',
    body: '全台科技 2026-05 扣繳申報已送審，請確認。',
    caseId: 'A009', read: false, createdAt: '2026-05-17 14:00', deletedAt: null,
  },
  {
    id: 'N004', recipientId: 'E006', type: '指派',
    title: '新案件指派給您',
    body: '您被指派負責大安診所 2026-05 營業稅申報（案件 A008）。',
    caseId: 'A008', read: false, createdAt: '2026-05-16 09:00', deletedAt: null,
  },
  {
    id: 'N005', recipientId: 'E003', type: '完成',
    title: '任務 T006 已完成',
    body: '陳美玲完成宏達貿易年度所得稅試算任務。',
    caseId: null, read: true, createdAt: '2026-05-10 17:30', deletedAt: null,
  },
  {
    id: 'N006', recipientId: 'E002', type: '收款',
    title: '收款提醒：宏達貿易 2026-02',
    body: '宏達貿易 2026-02 月份帳款 NT$ 8,000 尚未收款，請聯絡客戶。',
    caseId: null, read: true, createdAt: '2026-05-15 10:00', deletedAt: null,
  },
  {
    id: 'N007', recipientId: null, type: '系統',
    title: '系統維護通知',
    body: '系統將於 2026-05-20 00:00–02:00 進行維護，期間無法使用。',
    caseId: null, read: false, createdAt: '2026-05-14 09:00', deletedAt: null,
  },
];

@Injectable()
export class NotificationsService {
  findByRecipient(recipientId: string) {
    return notifications.filter(
      (n) => !n.deletedAt && (n.recipientId === recipientId || n.recipientId === null),
    ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  markRead(id: string) {
    const i = notifications.findIndex((n) => n.id === id && !n.deletedAt);
    if (i === -1) throw new NotFoundException('找不到通知');
    notifications[i].read = true;
    return notifications[i];
  }

  markAllRead(recipientId: string) {
    notifications.forEach((n) => {
      if (!n.deletedAt && (n.recipientId === recipientId || n.recipientId === null)) {
        n.read = true;
      }
    });
    return { updated: true };
  }

  create(dto: CreateNotificationDto) {
    const id = `N${String(idCounter++).padStart(3, '0')}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const item = { id, ...dto, read: false, createdAt: now, deletedAt: null };
    notifications.push(item);
    return item;
  }
}
