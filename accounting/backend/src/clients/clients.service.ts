import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  private clients = [
    { id: 'C001', name: '宏達貿易', taxId: '12345678', phone: '02-1234-5678', address: '台北市信義區', contactName: '陳小姐', contactPhone: '0912-345-678', isActive: true, deletedAt: null, lastModifiedBy: 'system' },
    { id: 'C002', name: '新光物流', taxId: '87654321', phone: '02-8765-4321', address: '新北市板橋區', contactName: '王先生', contactPhone: '0922-333-444', isActive: true, deletedAt: null, lastModifiedBy: 'system' },
    { id: 'C003', name: '全台科技', taxId: '11223344', phone: '03-111-2222', address: '桃園市中壢區', contactName: '李經理', contactPhone: '0933-111-222', isActive: true, deletedAt: null, lastModifiedBy: 'system' },
  ];

  findAll() {
    return this.clients.filter((c) => !c.deletedAt);
  }

  findOne(id: string) {
    const c = this.clients.find((c) => c.id === id && !c.deletedAt);
    if (!c) throw new NotFoundException('找不到客戶');
    return c;
  }

  create(dto: CreateClientDto) {
    const item = { id: `C${String(this.clients.length + 1).padStart(3, '0')}`, isActive: true, deletedAt: null, ...dto };
    this.clients.push(item);
    return item;
  }

  update(id: string, dto: Partial<CreateClientDto>) {
    const i = this.clients.findIndex((c) => c.id === id && !c.deletedAt);
    if (i === -1) throw new NotFoundException('找不到客戶');
    this.clients[i] = { ...this.clients[i], ...dto };
    return this.clients[i];
  }

  softDelete(id: string) {
    const i = this.clients.findIndex((c) => c.id === id && !c.deletedAt);
    if (i === -1) throw new NotFoundException('找不到客戶');
    this.clients[i].deletedAt = new Date().toISOString() as any;
    this.clients[i].isActive = false;
    return this.clients[i];
  }
}
