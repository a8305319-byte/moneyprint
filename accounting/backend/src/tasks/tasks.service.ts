import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';

const VALID_STATUSES = ['待處理', '進行中', '完成', '逾期'];
const VALID_PRIORITIES = ['高', '中', '低'];

let idCounter = 9;

const tasks: any[] = [
  {
    id: 'T001', title: '整理宏達貿易5月進項憑證', caseId: 'A001', clientName: '宏達貿易',
    assignee: '陳美玲', priority: '高', status: '進行中',
    dueDate: '2026-05-17', note: '', isActive: true, deletedAt: null,
    createdAt: '2026-05-10', lastModifiedBy: '陳美玲',
  },
  {
    id: 'T002', title: '補件：新光物流扣繳憑單', caseId: 'A002', clientName: '新光物流',
    assignee: '王志明', priority: '高', status: '進行中',
    dueDate: '2026-05-17', note: '', isActive: true, deletedAt: null,
    createdAt: '2026-05-16', lastModifiedBy: '王志明',
  },
  {
    id: 'T003', title: '全台科技5月薪資計算', caseId: 'A003', clientName: '全台科技',
    assignee: '林佳慧', priority: '中', status: '待處理',
    dueDate: '2026-05-22', note: '', isActive: true, deletedAt: null,
    createdAt: '2026-05-15', lastModifiedBy: '林佳慧',
  },
  {
    id: 'T004', title: '整理信義建設固定資產折舊', caseId: 'A010', clientName: '信義建設',
    assignee: '李建宏', priority: '低', status: '待處理',
    dueDate: '2026-05-28', note: '', isActive: true, deletedAt: null,
    createdAt: '2026-05-16', lastModifiedBy: '李建宏',
  },
  {
    id: 'T005', title: '大安診所5月銷項對帳', caseId: 'A008', clientName: '大安診所',
    assignee: '張淑芬', priority: '高', status: '逾期',
    dueDate: '2026-05-15', note: '已逾期', isActive: true, deletedAt: null,
    createdAt: '2026-05-10', lastModifiedBy: '張淑芬',
  },
  {
    id: 'T006', title: '宏達貿易年度所得稅試算', caseId: 'A004', clientName: '宏達貿易',
    assignee: '陳美玲', priority: '中', status: '完成',
    dueDate: '2026-05-10', note: '', isActive: true, deletedAt: null,
    createdAt: '2026-05-05', lastModifiedBy: '陳美玲',
  },
  {
    id: 'T007', title: '松山食品員工勞健保加退保', caseId: 'A007', clientName: '松山食品',
    assignee: '林佳慧', priority: '中', status: '待處理',
    dueDate: '2026-05-20', note: '', isActive: true, deletedAt: null,
    createdAt: '2026-05-17', lastModifiedBy: '林佳慧',
  },
  {
    id: 'T008', title: '更新客戶資料（新光物流）', caseId: '', clientName: '新光物流',
    assignee: '王志明', priority: '低', status: '完成',
    dueDate: '2026-05-12', note: '', isActive: true, deletedAt: null,
    createdAt: '2026-05-08', lastModifiedBy: '王志明',
  },
];

@Injectable()
export class TasksService {
  findAll(status?: string, assignee?: string, caseId?: string, priority?: string) {
    return tasks.filter((t) => {
      if (t.deletedAt) return false;
      if (status && t.status !== status) return false;
      if (assignee && t.assignee !== assignee) return false;
      if (caseId && t.caseId !== caseId) return false;
      if (priority && t.priority !== priority) return false;
      return true;
    });
  }

  findOne(id: string) {
    const t = tasks.find((t) => t.id === id && !t.deletedAt);
    if (!t) throw new NotFoundException('找不到任務');
    return t;
  }

  create(dto: CreateTaskDto) {
    if (dto.priority && !VALID_PRIORITIES.includes(dto.priority)) {
      throw new BadRequestException(`無效的優先度：${dto.priority}`);
    }
    const id = `T${String(idCounter++).padStart(3, '0')}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const item = {
      id,
      ...dto,
      priority: dto.priority ?? '中',
      status: '待處理',
      isActive: true,
      deletedAt: null,
      createdAt: now,
    };
    tasks.push(item);
    return item;
  }

  update(id: string, dto: Partial<CreateTaskDto>) {
    const i = tasks.findIndex((t) => t.id === id && !t.deletedAt);
    if (i === -1) throw new NotFoundException('找不到任務');
    tasks[i] = { ...tasks[i], ...dto };
    return tasks[i];
  }

  updateStatus(id: string, status: string, lastModifiedBy: string) {
    if (!VALID_STATUSES.includes(status)) {
      throw new BadRequestException(`無效的狀態：${status}`);
    }
    const i = tasks.findIndex((t) => t.id === id && !t.deletedAt);
    if (i === -1) throw new NotFoundException('找不到任務');
    tasks[i].status = status;
    tasks[i].lastModifiedBy = lastModifiedBy;
    return tasks[i];
  }

  softDelete(id: string) {
    const i = tasks.findIndex((t) => t.id === id && !t.deletedAt);
    if (i === -1) throw new NotFoundException('找不到任務');
    tasks[i].deletedAt = new Date().toISOString();
    tasks[i].isActive = false;
    return tasks[i];
  }
}
