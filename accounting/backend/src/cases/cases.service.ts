import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseStatusDto } from './dto/update-case-status.dto';
import { AddCommentDto } from './dto/add-comment.dto';

const VALID_STATUSES = [
  '建立', '指派', '等待資料', '收到資料', '處理中',
  '送主管覆核', '退回修改', '待申報', '已申報', '歸檔', '結案',
];

let idCounter = 12;

const cases: any[] = [
  {
    id: 'A001', clientId: 'C001', clientName: '宏達貿易', type: '營業稅申報',
    owner: '陳美玲', month: '2026-05', status: '退回修改',
    dueDate: '2026-05-20', createdAt: '2026-05-01', note: '5月份進銷項憑證整理',
    rejectReason: '附件缺少5月份進口報單影本，請補齊後重新送審。',
    isActive: true, deletedAt: null, lastModifiedBy: '林國棟',
    comments: [
      { id: 'CM001', author: '林國棟', text: '缺少進口報單，請補件', createdAt: '2026-05-16 11:20' },
      { id: 'CM002', author: '陳美玲', text: '已通知客戶補件', createdAt: '2026-05-16 14:05' },
    ],
    timeline: [
      { action: '建立案件', by: '林國棟', at: '2026-05-01 09:00' },
      { action: '指派負責人', by: '林國棟', at: '2026-05-01 09:05' },
      { action: '等待資料', by: '陳美玲', at: '2026-05-03 14:30' },
      { action: '收到資料', by: '陳美玲', at: '2026-05-08 10:15' },
      { action: '處理中', by: '陳美玲', at: '2026-05-10 09:00' },
      { action: '送主管覆核', by: '陳美玲', at: '2026-05-15 16:45' },
      { action: '退回修改', by: '林國棟', at: '2026-05-16 11:20' },
    ],
  },
  {
    id: 'A002', clientId: 'C002', clientName: '新光物流', type: '扣繳申報',
    owner: '王志明', month: '2026-05', status: '退回修改',
    dueDate: '2026-05-18', createdAt: '2026-05-03', note: '',
    rejectReason: '扣繳憑單格式錯誤，請重新製作。',
    isActive: true, deletedAt: null, lastModifiedBy: '張淑芬',
    comments: [], timeline: [],
  },
  {
    id: 'A003', clientId: 'C003', clientName: '全台科技', type: '營業稅申報',
    owner: '林佳慧', month: '2026-05', status: '處理中',
    dueDate: '2026-05-25', createdAt: '2026-05-05', note: '',
    rejectReason: '', isActive: true, deletedAt: null, lastModifiedBy: '林佳慧',
    comments: [], timeline: [],
  },
  {
    id: 'A004', clientId: 'C001', clientName: '宏達貿易', type: '綜所稅申報',
    owner: '陳美玲', month: '2026-04', status: '已申報',
    dueDate: '2026-04-30', createdAt: '2026-04-01', note: '',
    rejectReason: '', isActive: true, deletedAt: null, lastModifiedBy: '陳美玲',
    comments: [], timeline: [],
  },
  {
    id: 'A005', clientId: 'C004', clientName: '信義建設', type: '營利事業所得稅',
    owner: '李建宏', month: '2026-03', status: '歸檔',
    dueDate: '2026-03-31', createdAt: '2026-03-01', note: '',
    rejectReason: '', isActive: true, deletedAt: null, lastModifiedBy: '李建宏',
    comments: [], timeline: [],
  },
  {
    id: 'A006', clientId: 'C002', clientName: '新光物流', type: '營業稅申報',
    owner: '王志明', month: '2026-04', status: '結案',
    dueDate: '2026-04-25', createdAt: '2026-04-01', note: '',
    rejectReason: '', isActive: true, deletedAt: null, lastModifiedBy: '王志明',
    comments: [], timeline: [],
  },
  {
    id: 'A007', clientId: 'C005', clientName: '松山食品', type: '薪資扣繳',
    owner: '林佳慧', month: '2026-05', status: '等待資料',
    dueDate: '2026-05-22', createdAt: '2026-05-08', note: '已通知客戶',
    rejectReason: '', isActive: true, deletedAt: null, lastModifiedBy: '林佳慧',
    comments: [], timeline: [],
  },
  {
    id: 'A008', clientId: 'C006', clientName: '大安診所', type: '營業稅申報',
    owner: '張淑芬', month: '2026-05', status: '收到資料',
    dueDate: '2026-05-19', createdAt: '2026-05-10', note: '',
    rejectReason: '', isActive: true, deletedAt: null, lastModifiedBy: '張淑芬',
    comments: [], timeline: [],
  },
  {
    id: 'A009', clientId: 'C003', clientName: '全台科技', type: '扣繳申報',
    owner: '陳美玲', month: '2026-05', status: '待申報',
    dueDate: '2026-05-31', createdAt: '2026-05-12', note: '',
    rejectReason: '', isActive: true, deletedAt: null, lastModifiedBy: '陳美玲',
    comments: [], timeline: [],
  },
  {
    id: 'A010', clientId: 'C004', clientName: '信義建設', type: '營業稅申報',
    owner: '李建宏', month: '2026-05', status: '指派',
    dueDate: '2026-05-28', createdAt: '2026-05-16', note: '',
    rejectReason: '', isActive: true, deletedAt: null, lastModifiedBy: '林國棟',
    comments: [], timeline: [],
  },
];

@Injectable()
export class CasesService {
  findAll(status?: string, clientId?: string, owner?: string, month?: string) {
    return cases.filter((c) => {
      if (c.deletedAt) return false;
      if (status && c.status !== status) return false;
      if (clientId && c.clientId !== clientId) return false;
      if (owner && c.owner !== owner) return false;
      if (month && c.month !== month) return false;
      return true;
    });
  }

  findOne(id: string) {
    const c = cases.find((c) => c.id === id && !c.deletedAt);
    if (!c) throw new NotFoundException('找不到案件');
    return c;
  }

  create(dto: CreateCaseDto) {
    const id = `A${String(idCounter++).padStart(3, '0')}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const item = {
      id,
      ...dto,
      status: '建立',
      rejectReason: '',
      isActive: true,
      deletedAt: null,
      createdAt: now,
      comments: [],
      timeline: [{ action: '建立案件', by: dto.lastModifiedBy, at: now }],
    };
    cases.push(item);
    return item;
  }

  update(id: string, dto: Partial<CreateCaseDto>) {
    const i = cases.findIndex((c) => c.id === id && !c.deletedAt);
    if (i === -1) throw new NotFoundException('找不到案件');
    cases[i] = { ...cases[i], ...dto };
    return cases[i];
  }

  updateStatus(id: string, dto: UpdateCaseStatusDto) {
    if (!VALID_STATUSES.includes(dto.status)) {
      throw new BadRequestException(`無效的狀態：${dto.status}`);
    }
    const i = cases.findIndex((c) => c.id === id && !c.deletedAt);
    if (i === -1) throw new NotFoundException('找不到案件');
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    cases[i].status = dto.status;
    cases[i].lastModifiedBy = dto.lastModifiedBy;
    if (dto.status === '退回修改') {
      cases[i].rejectReason = dto.rejectReason ?? '';
    } else {
      cases[i].rejectReason = '';
    }
    cases[i].timeline.push({ action: dto.status, by: dto.lastModifiedBy, at: now });
    return cases[i];
  }

  addComment(id: string, dto: AddCommentDto) {
    const i = cases.findIndex((c) => c.id === id && !c.deletedAt);
    if (i === -1) throw new NotFoundException('找不到案件');
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const comment = {
      id: `CM${String(cases[i].comments.length + 1).padStart(3, '0')}`,
      author: dto.author,
      text: dto.text,
      createdAt: now,
    };
    cases[i].comments.push(comment);
    return comment;
  }

  softDelete(id: string) {
    const i = cases.findIndex((c) => c.id === id && !c.deletedAt);
    if (i === -1) throw new NotFoundException('找不到案件');
    cases[i].deletedAt = new Date().toISOString();
    cases[i].isActive = false;
    return cases[i];
  }
}
