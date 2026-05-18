import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFilingDto } from './dto/create-filing.dto';

const VALID_STATUSES = ['待申報', '處理中', '已申報', '逾期待申報', '退件'];

let idCounter = 9;

const filings: any[] = [
  { id: 'F001', clientId: 'C003', clientName: '全台科技', caseId: 'A009', type: '營業稅', period: '2026-05', deadline: '2026-05-31', status: '待申報', filedAt: null, refNum: '', handler: '陳美玲', note: '', deletedAt: null, lastModifiedBy: '陳美玲' },
  { id: 'F002', clientId: 'C002', clientName: '新光物流', caseId: 'A002', type: '扣繳申報', period: '2026-05', deadline: '2026-05-31', status: '待申報', filedAt: null, refNum: '', handler: '王志明', note: '', deletedAt: null, lastModifiedBy: '王志明' },
  { id: 'F003', clientId: 'C006', clientName: '大安診所', caseId: 'A008', type: '營業稅', period: '2026-05', deadline: '2026-05-19', status: '逾期待申報', filedAt: null, refNum: '', handler: '張淑芬', note: '', deletedAt: null, lastModifiedBy: '張淑芬' },
  { id: 'F004', clientId: 'C001', clientName: '宏達貿易', caseId: 'A001', type: '營業稅', period: '2026-05', deadline: '2026-05-20', status: '處理中', filedAt: null, refNum: '', handler: '陳美玲', note: '', deletedAt: null, lastModifiedBy: '陳美玲' },
  { id: 'F005', clientId: 'C001', clientName: '宏達貿易', caseId: 'A004', type: '綜所稅', period: '2026', deadline: '2026-04-30', status: '已申報', filedAt: '2026-04-28', refNum: 'TW2026-HTA-0042', handler: '陳美玲', note: '', deletedAt: null, lastModifiedBy: '陳美玲' },
  { id: 'F006', clientId: 'C004', clientName: '信義建設', caseId: 'A005', type: '營利事業所得稅', period: '2025', deadline: '2026-03-31', status: '已申報', filedAt: '2026-03-25', refNum: 'TW2026-XYZ-0088', handler: '李建宏', note: '', deletedAt: null, lastModifiedBy: '李建宏' },
  { id: 'F007', clientId: 'C002', clientName: '新光物流', caseId: 'A006', type: '營業稅', period: '2026-04', deadline: '2026-04-25', status: '已申報', filedAt: '2026-04-22', refNum: 'TW2026-XGL-0055', handler: '王志明', note: '', deletedAt: null, lastModifiedBy: '王志明' },
  { id: 'F008', clientId: 'C005', clientName: '松山食品', caseId: '', type: '薪資扣繳', period: '2026-Q1', deadline: '2026-04-10', status: '已申報', filedAt: '2026-04-08', refNum: 'TW2026-SSF-0021', handler: '林佳慧', note: '', deletedAt: null, lastModifiedBy: '林佳慧' },
];

@Injectable()
export class FilingsService {
  findAll(status?: string, clientId?: string, type?: string) {
    return filings.filter((f) => {
      if (f.deletedAt) return false;
      if (status && f.status !== status) return false;
      if (clientId && f.clientId !== clientId) return false;
      if (type && f.type !== type) return false;
      return true;
    });
  }

  findOne(id: string) {
    const f = filings.find((f) => f.id === id && !f.deletedAt);
    if (!f) throw new NotFoundException('找不到申報記錄');
    return f;
  }

  create(dto: CreateFilingDto) {
    const id = `F${String(idCounter++).padStart(3, '0')}`;
    const item = { id, ...dto, status: '待申報', filedAt: null, refNum: '', deletedAt: null };
    filings.push(item);
    return item;
  }

  update(id: string, dto: Partial<CreateFilingDto>) {
    const i = filings.findIndex((f) => f.id === id && !f.deletedAt);
    if (i === -1) throw new NotFoundException('找不到申報記錄');
    filings[i] = { ...filings[i], ...dto };
    return filings[i];
  }

  markFiled(id: string, refNum: string, lastModifiedBy: string) {
    const i = filings.findIndex((f) => f.id === id && !f.deletedAt);
    if (i === -1) throw new NotFoundException('找不到申報記錄');
    const now = new Date().toISOString().split('T')[0];
    filings[i].status = '已申報';
    filings[i].filedAt = now;
    filings[i].refNum = refNum ?? '';
    filings[i].lastModifiedBy = lastModifiedBy;
    return filings[i];
  }

  updateStatus(id: string, status: string, lastModifiedBy: string) {
    if (!VALID_STATUSES.includes(status)) {
      throw new BadRequestException(`無效的狀態：${status}`);
    }
    const i = filings.findIndex((f) => f.id === id && !f.deletedAt);
    if (i === -1) throw new NotFoundException('找不到申報記錄');
    filings[i].status = status;
    filings[i].lastModifiedBy = lastModifiedBy;
    return filings[i];
  }

  softDelete(id: string) {
    const i = filings.findIndex((f) => f.id === id && !f.deletedAt);
    if (i === -1) throw new NotFoundException('找不到申報記錄');
    filings[i].deletedAt = new Date().toISOString();
    return filings[i];
  }
}
