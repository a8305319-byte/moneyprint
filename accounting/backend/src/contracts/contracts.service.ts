import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';

const VALID_STATUSES = ['有效', '即將到期', '已到期', '已終止'];

let idCounter = 9;

const today = '2026-05-18';

function deriveStatus(endDate: string): string {
  if (endDate < today) return '已到期';
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
  const end = thirtyDaysLater.toISOString().split('T')[0];
  if (endDate <= end) return '即將到期';
  return '有效';
}

const contracts: any[] = [
  { id: 'CT001', clientId: 'C001', clientName: '宏達貿易', type: '年度記帳合約', startDate: '2026-01-01', endDate: '2026-12-31', monthlyFee: 8000, status: '有效', signedAt: '2025-12-15', note: '', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'CT002', clientId: 'C002', clientName: '新光物流', type: '申報代理合約', startDate: '2026-01-01', endDate: '2026-06-30', monthlyFee: 5000, status: '即將到期', signedAt: '2025-12-20', note: '', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'CT003', clientId: 'C003', clientName: '全台科技', type: '年度記帳合約', startDate: '2026-01-01', endDate: '2026-12-31', monthlyFee: 7500, status: '有效', signedAt: '2025-12-10', note: '', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'CT004', clientId: 'C004', clientName: '信義建設', type: '年度顧問合約', startDate: '2026-05-01', endDate: '2027-04-30', monthlyFee: 12000, status: '有效', signedAt: '2026-04-28', note: '', deletedAt: null, lastModifiedBy: '李建宏' },
  { id: 'CT005', clientId: 'C005', clientName: '松山食品', type: '年度記帳合約', startDate: '2026-01-01', endDate: '2026-12-31', monthlyFee: 6000, status: '有效', signedAt: '2025-12-18', note: '', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'CT006', clientId: 'C006', clientName: '大安診所', type: '年度記帳合約', startDate: '2026-01-01', endDate: '2026-12-31', monthlyFee: 9000, status: '有效', signedAt: '2025-12-05', note: '', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'CT007', clientId: 'C001', clientName: '宏達貿易', type: '年度記帳合約', startDate: '2025-01-01', endDate: '2025-12-31', monthlyFee: 7500, status: '已到期', signedAt: '2024-12-20', note: '', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'CT008', clientId: 'C007', clientName: '北投溫泉飯店', type: '申報代理合約', startDate: '2023-01-01', endDate: '2024-12-31', monthlyFee: 10000, status: '已終止', signedAt: '2022-12-15', note: '客戶主動終止', deletedAt: null, lastModifiedBy: 'system' },
];

@Injectable()
export class ContractsService {
  findAll(status?: string, clientId?: string) {
    return contracts.filter((c) => {
      if (c.deletedAt) return false;
      if (status && c.status !== status) return false;
      if (clientId && c.clientId !== clientId) return false;
      return true;
    });
  }

  findOne(id: string) {
    const c = contracts.find((c) => c.id === id && !c.deletedAt);
    if (!c) throw new NotFoundException('找不到合約');
    return c;
  }

  create(dto: CreateContractDto) {
    const id = `CT${String(idCounter++).padStart(3, '0')}`;
    const now = new Date().toISOString().split('T')[0];
    const item = {
      id,
      ...dto,
      status: deriveStatus(dto.endDate),
      signedAt: now,
      deletedAt: null,
    };
    contracts.push(item);
    return item;
  }

  update(id: string, dto: Partial<CreateContractDto>) {
    const i = contracts.findIndex((c) => c.id === id && !c.deletedAt);
    if (i === -1) throw new NotFoundException('找不到合約');
    contracts[i] = { ...contracts[i], ...dto };
    if (dto.endDate) {
      contracts[i].status = deriveStatus(dto.endDate);
    }
    return contracts[i];
  }

  terminate(id: string, lastModifiedBy: string) {
    const i = contracts.findIndex((c) => c.id === id && !c.deletedAt);
    if (i === -1) throw new NotFoundException('找不到合約');
    contracts[i].status = '已終止';
    contracts[i].lastModifiedBy = lastModifiedBy;
    return contracts[i];
  }

  softDelete(id: string) {
    const i = contracts.findIndex((c) => c.id === id && !c.deletedAt);
    if (i === -1) throw new NotFoundException('找不到合約');
    contracts[i].deletedAt = new Date().toISOString();
    return contracts[i];
  }
}
