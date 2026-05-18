import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeesService {
  private employees = [
    { id: 'E001', name: '王老闆', email: 'boss@firm.com', role: 'BOSS', isActive: true, deletedAt: null, lastModifiedBy: 'system' },
    { id: 'E002', name: '林主管', email: 'manager@firm.com', role: 'MANAGER', isActive: true, deletedAt: null, lastModifiedBy: 'system' },
    { id: 'E003', name: '王小美', email: 'senior@firm.com', role: 'SENIOR_ACCT', isActive: true, deletedAt: null, lastModifiedBy: 'system' },
    { id: 'E004', name: '陳大文', email: 'acct@firm.com', role: 'ACCT', isActive: true, deletedAt: null, lastModifiedBy: 'system' },
    { id: 'E005', name: '李助理', email: 'assistant@firm.com', role: 'ASSISTANT', isActive: true, deletedAt: null, lastModifiedBy: 'system' },
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
