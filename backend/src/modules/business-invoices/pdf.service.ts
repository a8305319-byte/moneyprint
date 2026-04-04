import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  async generateMonthlyReport(user: any, invoices: any[], summary: any, month: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Register a font that supports Chinese - fallback to Helvetica if no CJK font
      // Title
      doc.fontSize(20).text('錢跡 — 月度發票報表', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#666').text(`公司：${user?.companyName ?? user?.name ?? '-'}`, { align: 'center' });
      doc.text(`統一編號：${user?.taxId ?? '-'}`, { align: 'center' });
      doc.text(`報表期間：${month}`, { align: 'center' });
      doc.text(`產製日期：${new Date().toLocaleDateString('zh-TW')}`, { align: 'center' });
      doc.moveDown();

      // Summary boxes
      doc.fillColor('#000').fontSize(14).text('─── 月度摘要 ───');
      doc.moveDown(0.5);
      doc.fontSize(11);
      const s = summary;
      doc.text(`進項發票（收到）：${s.received.count} 張，含稅金額 NT$ ${s.received.amount.toLocaleString()}，稅額 NT$ ${s.received.taxAmount.toLocaleString()}`);
      doc.text(`銷項發票（開出）：${s.issued.count} 張，含稅金額 NT$ ${s.issued.amount.toLocaleString()}，稅額 NT$ ${s.issued.taxAmount.toLocaleString()}`);
      doc.text(`應納營業稅（銷項-進項）：NT$ ${s.netTax.toLocaleString()}`);
      doc.text(`剩餘可開發票：${s.remainingQuota} 張`);
      doc.moveDown();

      // Received invoices table
      const drawTable = (title: string, rows: any[]) => {
        doc.fontSize(13).text(`─── ${title} ───`);
        doc.moveDown(0.3);
        doc.fontSize(9);
        // Header
        const cols = [55, 95, 155, 65, 75, 75];
        const headers = ['日期', '發票號碼', '交易對象', '類型', '含稅金額', '稅額'];
        let x = doc.page.margins.left;
        headers.forEach((h, i) => {
          doc.text(h, x, doc.y, { width: cols[i], align: 'center' });
          x += cols[i];
        });
        doc.moveDown(0.3);
        doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
        doc.moveDown(0.2);

        rows.forEach(inv => {
          const y = doc.y;
          const vals = [
            new Date(inv.invoiceDate).toLocaleDateString('zh-TW'),
            inv.invoiceNo,
            inv.counterpartyName,
            inv.format,
            `NT$ ${Number(inv.amount).toLocaleString()}`,
            `NT$ ${Number(inv.taxAmount).toLocaleString()}`,
          ];
          let x2 = doc.page.margins.left;
          vals.forEach((v, i) => {
            doc.text(v, x2, y, { width: cols[i], align: 'center' });
            x2 += cols[i];
          });
          doc.moveDown(0.5);
          if (doc.y > doc.page.height - 100) doc.addPage();
        });
        doc.moveDown();
      };

      const received = invoices.filter((i: any) => i.direction === 'RECEIVED');
      const issued = invoices.filter((i: any) => i.direction === 'ISSUED');

      drawTable('進項發票（收到的發票）', received);
      drawTable('銷項發票（開出的發票）', issued);

      doc.moveDown();
      doc.fontSize(9).fillColor('#999').text('— 本報表由 錢跡 系統自動產製 —', { align: 'center' });

      doc.end();
    });
  }
}
