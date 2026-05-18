import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';

let idCounter = 10;

const documents: any[] = [
  { id: 'D001', name: '宏達貿易5月進項憑證彙整.xlsx', category: '發票憑證', clientId: 'C001', clientName: '宏達貿易', caseId: 'A001', uploader: '陳美玲', size: '285KB', ext: 'xlsx', uploadedAt: '2026-05-08', note: '', deletedAt: null, lastModifiedBy: '陳美玲' },
  { id: 'D002', name: '宏達貿易5月銷項憑證彙整.xlsx', category: '發票憑證', clientId: 'C001', clientName: '宏達貿易', caseId: 'A001', uploader: '陳美玲', size: '194KB', ext: 'xlsx', uploadedAt: '2026-05-08', note: '', deletedAt: null, lastModifiedBy: '陳美玲' },
  { id: 'D003', name: '客戶對帳單5月.pdf', category: '報表', clientId: 'C001', clientName: '宏達貿易', caseId: 'A001', uploader: '陳美玲', size: '512KB', ext: 'pdf', uploadedAt: '2026-05-08', note: '', deletedAt: null, lastModifiedBy: '陳美玲' },
  { id: 'D004', name: '信義建設年度合約2026.pdf', category: '合約', clientId: 'C004', clientName: '信義建設', caseId: '', uploader: '李建宏', size: '1.2MB', ext: 'pdf', uploadedAt: '2026-05-01', note: '', deletedAt: null, lastModifiedBy: '李建宏' },
  { id: 'D005', name: '新光物流扣繳申報書.pdf', category: '申報書', clientId: 'C002', clientName: '新光物流', caseId: 'A002', uploader: '王志明', size: '340KB', ext: 'pdf', uploadedAt: '2026-05-16', note: '', deletedAt: null, lastModifiedBy: '王志明' },
  { id: 'D006', name: '全台科技薪資明細5月.xlsx', category: '薪資資料', clientId: 'C003', clientName: '全台科技', caseId: 'A003', uploader: '林佳慧', size: '156KB', ext: 'xlsx', uploadedAt: '2026-05-15', note: '', deletedAt: null, lastModifiedBy: '林佳慧' },
  { id: 'D007', name: '大安診所發票20260501.jpg', category: '發票憑證', clientId: 'C006', clientName: '大安診所', caseId: 'A008', uploader: '張淑芬', size: '2.1MB', ext: 'jpg', uploadedAt: '2026-05-10', note: '', deletedAt: null, lastModifiedBy: '張淑芬' },
  { id: 'D008', name: '松山食品固定資產清單.xlsx', category: '報表', clientId: 'C005', clientName: '松山食品', caseId: '', uploader: '林佳慧', size: '98KB', ext: 'xlsx', uploadedAt: '2026-05-12', note: '', deletedAt: null, lastModifiedBy: '林佳慧' },
  { id: 'D009', name: '宏達貿易年度記帳合約2026.docx', category: '合約', clientId: 'C001', clientName: '宏達貿易', caseId: '', uploader: '陳美玲', size: '88KB', ext: 'docx', uploadedAt: '2025-12-15', note: '', deletedAt: null, lastModifiedBy: '陳美玲' },
];

@Injectable()
export class DocumentsService {
  findAll(category?: string, clientId?: string, caseId?: string) {
    return documents.filter((d) => {
      if (d.deletedAt) return false;
      if (category && d.category !== category) return false;
      if (clientId && d.clientId !== clientId) return false;
      if (caseId && d.caseId !== caseId) return false;
      return true;
    });
  }

  findOne(id: string) {
    const d = documents.find((d) => d.id === id && !d.deletedAt);
    if (!d) throw new NotFoundException('找不到文件');
    return d;
  }

  create(dto: CreateDocumentDto) {
    const id = `D${String(idCounter++).padStart(3, '0')}`;
    const now = new Date().toISOString().split('T')[0];
    const ext = dto.name.includes('.') ? dto.name.split('.').pop() ?? '' : '';
    const item = { id, ...dto, ext, uploadedAt: now, deletedAt: null };
    documents.push(item);
    return item;
  }

  softDelete(id: string) {
    const i = documents.findIndex((d) => d.id === id && !d.deletedAt);
    if (i === -1) throw new NotFoundException('找不到文件');
    documents[i].deletedAt = new Date().toISOString();
    return documents[i];
  }
}
