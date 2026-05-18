import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHandoverDto } from './dto/create-handover.dto';

let idCounter = 3;

const handovers: any[] = [
  {
    id: 'H001', fromEmployee: '陳美玲', toEmployee: '李建宏',
    caseIds: ['A004', 'A005', 'A006'], clientCount: 3,
    status: '已完成', note: '陳美玲請假期間暫由李建宏代理',
    createdAt: '2026-05-10', completedAt: '2026-05-10',
    deletedAt: null, lastModifiedBy: '林國棟',
  },
  {
    id: 'H002', fromEmployee: '王志明', toEmployee: '黃曉玲',
    caseIds: ['A002'], clientCount: 1,
    status: '進行中', note: '王志明外出開會，暫由黃曉玲跟進',
    createdAt: '2026-05-15', completedAt: null,
    deletedAt: null, lastModifiedBy: '張淑芬',
  },
];

@Injectable()
export class HandoverService {
  findAll() {
    return handovers.filter((h) => !h.deletedAt);
  }

  findOne(id: string) {
    const h = handovers.find((h) => h.id === id && !h.deletedAt);
    if (!h) throw new NotFoundException('找不到交接記錄');
    return h;
  }

  create(dto: CreateHandoverDto) {
    const id = `H${String(idCounter++).padStart(3, '0')}`;
    const now = new Date().toISOString().split('T')[0];
    const item = {
      id,
      ...dto,
      caseIds: dto.caseIds ?? [],
      clientCount: 0,
      status: '進行中',
      createdAt: now,
      completedAt: null,
      deletedAt: null,
    };
    handovers.push(item);
    return item;
  }

  complete(id: string, lastModifiedBy: string) {
    const i = handovers.findIndex((h) => h.id === id && !h.deletedAt);
    if (i === -1) throw new NotFoundException('找不到交接記錄');
    const now = new Date().toISOString().split('T')[0];
    handovers[i].status = '已完成';
    handovers[i].completedAt = now;
    handovers[i].lastModifiedBy = lastModifiedBy;
    return handovers[i];
  }

  softDelete(id: string) {
    const i = handovers.findIndex((h) => h.id === id && !h.deletedAt);
    if (i === -1) throw new NotFoundException('找不到交接記錄');
    handovers[i].deletedAt = new Date().toISOString();
    return handovers[i];
  }
}
