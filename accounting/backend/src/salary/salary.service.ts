import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSalaryDto } from './dto/create-salary.dto';

let idCounter = 9;

const salaryRecords: any[] = [
  { id: 'S001', employeeId: 'E001', employeeName: '林國棟', role: '老闆', month: '2026-05', baseSalary: 80000, bonus: 10000, laborIns: 3000, healthIns: 1200, incomeTax: 2000, net: 83800, status: '已發放', paidAt: '2026-05-05', note: '', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'S002', employeeId: 'E002', employeeName: '張淑芬', role: '主任', month: '2026-05', baseSalary: 65000, bonus: 5000, laborIns: 2800, healthIns: 1100, incomeTax: 1500, net: 64600, status: '已發放', paidAt: '2026-05-05', note: '', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'S003', employeeId: 'E003', employeeName: '陳美玲', role: '資深會計', month: '2026-05', baseSalary: 52000, bonus: 3000, laborIns: 2400, healthIns: 950, incomeTax: 800, net: 50850, status: '已發放', paidAt: '2026-05-05', note: '', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'S004', employeeId: 'E004', employeeName: '王志明', role: '一般會計', month: '2026-05', baseSalary: 45000, bonus: 0, laborIns: 2100, healthIns: 850, incomeTax: 500, net: 41550, status: '未發放', paidAt: null, note: '', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'S005', employeeId: 'E005', employeeName: '林佳慧', role: '一般會計', month: '2026-05', baseSalary: 45000, bonus: 2000, laborIns: 2100, healthIns: 850, incomeTax: 500, net: 43550, status: '未發放', paidAt: null, note: '', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'S006', employeeId: 'E006', employeeName: '李建宏', role: '資深會計', month: '2026-05', baseSalary: 52000, bonus: 0, laborIns: 2400, healthIns: 950, incomeTax: 800, net: 47850, status: '未發放', paidAt: null, note: '', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'S007', employeeId: 'E007', employeeName: '黃曉玲', role: '助理', month: '2026-05', baseSalary: 30000, bonus: 0, laborIns: 1500, healthIns: 620, incomeTax: 0, net: 27880, status: '未發放', paidAt: null, note: '', deletedAt: null, lastModifiedBy: 'system' },
  { id: 'S008', employeeId: 'E008', employeeName: '吳俊宏', role: '實習生', month: '2026-05', baseSalary: 20000, bonus: 0, laborIns: 1200, healthIns: 500, incomeTax: 0, net: 18300, status: '未發放', paidAt: null, note: '', deletedAt: null, lastModifiedBy: 'system' },
];

function calcNet(r: any): number {
  return (r.baseSalary ?? 0) + (r.bonus ?? 0) - (r.laborIns ?? 0) - (r.healthIns ?? 0) - (r.incomeTax ?? 0);
}

@Injectable()
export class SalaryService {
  findAll(month?: string, employeeId?: string) {
    return salaryRecords.filter((s) => {
      if (s.deletedAt) return false;
      if (month && s.month !== month) return false;
      if (employeeId && s.employeeId !== employeeId) return false;
      return true;
    });
  }

  findOne(id: string) {
    const s = salaryRecords.find((s) => s.id === id && !s.deletedAt);
    if (!s) throw new NotFoundException('找不到薪資記錄');
    return s;
  }

  create(dto: CreateSalaryDto) {
    const id = `S${String(idCounter++).padStart(3, '0')}`;
    const item = {
      id,
      ...dto,
      bonus: dto.bonus ?? 0,
      incomeTax: dto.incomeTax ?? 0,
      net: calcNet(dto),
      status: '未發放',
      paidAt: null,
      deletedAt: null,
    };
    salaryRecords.push(item);
    return item;
  }

  update(id: string, dto: Partial<CreateSalaryDto>) {
    const i = salaryRecords.findIndex((s) => s.id === id && !s.deletedAt);
    if (i === -1) throw new NotFoundException('找不到薪資記錄');
    salaryRecords[i] = { ...salaryRecords[i], ...dto };
    salaryRecords[i].net = calcNet(salaryRecords[i]);
    return salaryRecords[i];
  }

  markPaid(id: string, lastModifiedBy: string) {
    const i = salaryRecords.findIndex((s) => s.id === id && !s.deletedAt);
    if (i === -1) throw new NotFoundException('找不到薪資記錄');
    if (salaryRecords[i].status === '已發放') return salaryRecords[i];
    const now = new Date().toISOString().split('T')[0];
    salaryRecords[i].status = '已發放';
    salaryRecords[i].paidAt = now;
    salaryRecords[i].lastModifiedBy = lastModifiedBy;
    return salaryRecords[i];
  }

  softDelete(id: string) {
    const i = salaryRecords.findIndex((s) => s.id === id && !s.deletedAt);
    if (i === -1) throw new NotFoundException('找不到薪資記錄');
    salaryRecords[i].deletedAt = new Date().toISOString();
    return salaryRecords[i];
  }
}
