import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeesService {
  private employees = [
    { id: 'E001', name: '林國棟', email: 'boss@firm.com', phone: '0912-000-001', role: 'BOSS', status: '在職', joinDate: '2010-01-01', clients: 0, isActive: true, deletedAt: null, lastModifiedBy: 'system' },
    { id: 'E002', name: '張淑芬', email: 'manager@firm.com', phone: '0912-000-002', role: 'MANAGER', status: '在職', joinDate: '2015-03-01', clients: 2, isActive: true, deletedAt: null, lastModifiedBy: 'system' },
    { id: 'E003', name: '陳美玲', email: 'senior@firm.com', phone: '0912-000-003', role: 'SENIOR_ACCT', status: '在職', joinDate: '2018-06-01', clients: 3, isActive: true, deletedAt: null, lastModifiedBy: 'system' },
    { id: 'E004', name: '王志明', email: 'acct@firm.com', phone: '0912-000-004', role: 'ACCT', status: '在職', joinDate: '2020-09-01', clients: 2, isActive: true, deletedAt: null, lastModifiedBy: 'system' },
    { id: 'E005', name: '黃曉玲', email: 'assistant@firm.com', phone: '0912-000-007', role: 'ASSISTANT', status: '在職', joinDate: '2023-02-01', clients: 0, isActive: true, deletedAt: null, lastModifiedBy: 'system' },
    { id: 'E006', name: '林佳慧', email: 'lin@firm.com', phone: '0912-000-005', role: 'ACCT', status: '在職', joinDate: '2021-03-01', clients: 2, isActive: true, deletedAt: null, lastModifiedBy: 'system' },
    { id: 'E007', name: '李建宏', email: 'li@firm.com', phone: '0912-000-006', role: 'SENIOR_ACCT', status: '在職', joinDate: '2019-07-01', clients: 2, isActive: true, deletedAt: null, lastModifiedBy: 'system' },
    { id: 'E008', name: '吳俊宏', email: 'wu@firm.com', phone: '0912-000-008', role: 'INTERN', status: '在職', joinDate: '2026-02-01', clients: 0, isActive: true, deletedAt: null, lastModifiedBy: 'system' },
    { id: 'E009', name: '許雅婷', email: 'hsu@firm.com', phone: '0912-000-009', role: 'ACCT', status: '離職', joinDate: '2017-04-01', clients: 0, isActive: false, deletedAt: null, lastModifiedBy: 'system' },
  ];

  findAll() {
    return this.employees.filter((e) => !e.deletedAt);
  }

  findOne(id: string) {
    const e = this.employees.find((e) => e.id === id && !e.deletedAt);
    if (!e) throw new NotFoundException('找不到員工');
    return e;
  }

  create(dto: CreateEmployeeDto) {
    const item = { id: `E${String(this.employees.length + 1).padStart(3, '0')}`, isActive: true, deletedAt: null, ...dto };
    this.employees.push(item);
    return item;
  }

  update(id: string, dto: Partial<CreateEmployeeDto>) {
    const i = this.employees.findIndex((e) => e.id === id && !e.deletedAt);
    if (i === -1) throw new NotFoundException('找不到員工');
    this.employees[i] = { ...this.employees[i], ...dto };
    return this.employees[i];
  }

  softDelete(id: string) {
    const i = this.employees.findIndex((e) => e.id === id && !e.deletedAt);
    if (i === -1) throw new NotFoundException('找不到員工');
    this.employees[i].deletedAt = new Date().toISOString() as any;
    this.employees[i].isActive = false;
    return this.employees[i];
  }
}
