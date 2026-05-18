import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  private clients = [
    { id: 'C001', name: '宏達貿易股份有限公司', taxId: '12345678', phone: '02-1234-5678', address: '台北市信義區信義路五段7號', contactName: '陳小姐', contactPhone: '0912-345-678', owner: '陳美玲', status: '合作中', since: '2022-03', isActive: true, deletedAt: null, lastModifiedBy: 'system' },
    { id: 'C002', name: '新光物流有限公司', taxId: '87654321', phone: '02-8765-4321', address: '新北市板橋區文化路一段188號', contactName: '王先生', contactPhone: '0922-333-444', owner: '王志明', status: '合作中', since: '2021-07', isActive: true, deletedAt: null, lastModifiedBy: 'system' },
    { id: 'C003', name: '全台科技股份有限公司', taxId: '11223344', phone: '03-111-2222', address: '桃園市中壢區中山路100號', contactName: '李經理', contactPhone: '0933-111-222', owner: '林佳慧', status: '合作中', since: '2023-01', isActive: true, deletedAt: null, lastModifiedBy: 'system' },
    { id: 'C004', name: '信義建設股份有限公司', taxId: '55667788', phone: '02-2700-8888', address: '台北市信義區松壽路12號', contactName: '張董事長', contactPhone: '0988-112-233', owner: '李建宏', status: '追蹤中', since: '2024-05', isActive: true, deletedAt: null, lastModifiedBy: 'system' },
    { id: 'C005', name: '松山食品有限公司', taxId: '99887766', phone: '02-2759-3300', address: '台北市松山區光復北路11號', contactName: '劉老板', contactPhone: '0900-123-456', owner: '林佳慧', status: '合作中', since: '2020-11', isActive: true, deletedAt: null, lastModifiedBy: 'system' },
    { id: 'C006', name: '大安診所', taxId: '33445566', phone: '02-2731-5000', address: '台北市大安區忠孝東路四段218號', contactName: '吳院長', contactPhone: '0911-223-344', owner: '張淑芬', status: '合作中', since: '2019-06', isActive: true, deletedAt: null, lastModifiedBy: 'system' },
    { id: 'C007', name: '北投溫泉飯店股份有限公司', taxId: '22334455', phone: '02-2891-1234', address: '台北市北投區光明路1號', contactName: '林副總', contactPhone: '0977-998-877', owner: '陳美玲', status: '停止合作', since: '2018-01', isActive: false, deletedAt: null, lastModifiedBy: 'system' },
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
