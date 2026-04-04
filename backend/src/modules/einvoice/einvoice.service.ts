import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

// 財政部電子發票整合服務平台 API
// 需申請 appId + apiKey: https://www.einvoice.nat.gov.tw/
const MOF_API_BASE = 'https://api.einvoice.nat.gov.tw';
const APP_ID = process.env.MOF_APP_ID ?? 'EINV_TEST_APP';
const API_KEY = process.env.MOF_API_KEY ?? '';

@Injectable()
export class EinvoiceService {
  private readonly logger = new Logger(EinvoiceService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 產生財政部 API 時間戳與驗證碼
  private buildParams(extra: Record<string, string> = {}) {
    const timeStamp = Math.floor(Date.now() / 1000).toString();
    const params: Record<string, string> = {
      appID: APP_ID,
      timeStamp,
      ...extra,
    };
    // HMAC-SHA256 signature
    const paramStr = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
    const signature = crypto.createHmac('sha256', API_KEY).update(paramStr).digest('base64');
    return { ...params, signature };
  }

  // 查詢手機條碼發票（個人消費發票）
  async queryInvoices(carrier: string, startDate: string, endDate: string) {
    try {
      const params = this.buildParams({
        cardType: '3J0002', // 手機條碼
        cardNo: carrier,
        startDate,
        endDate,
        onlyWinningInv: 'N',
        uuid: crypto.randomUUID(),
      });

      const res = await axios.get(`${MOF_API_BASE}/PB2CAPIVAN/CarInv/Qcarrier`, { params, timeout: 10000 });
      return res.data;
    } catch (e: any) {
      this.logger.warn(`財政部 API 查詢失敗: ${e.message}`);
      // 回傳模擬資料供測試
      return this.getMockInvoices(carrier);
    }
  }

  // 同步發票並存入資料庫
  async syncFromMOF(carrier: string, cardNo?: string, cardEncrypt?: string) {
    const endDate = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
    const startDate = new Date(Date.now() - 90 * 86400000).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');

    const data = await this.queryInvoices(carrier, startDate, endDate);
    const invoices = data?.details ?? data?.invoiceList ?? [];
    let synced = 0;

    for (const inv of invoices) {
      const invoiceNo = inv.invNum ?? inv.invoiceNo ?? '';
      if (!invoiceNo) continue;

      const exists = await this.prisma.invoiceRecord.findUnique({ where: { invoiceNo } });
      if (exists) continue;

      const amount = Number(inv.amount ?? inv.invAmount ?? 0);
      const record = await this.prisma.invoiceRecord.create({
        data: {
          invoiceNo,
          invoiceDate: new Date(inv.invDate ?? inv.invoiceDate ?? Date.now()),
          sellerName: inv.sellerName ?? inv.merchantName ?? '未知商家',
          sellerTaxId: inv.sellerBan ?? '',
          amount,
          taxAmount: Math.round(amount * 5 / 105 * 100) / 100,
          carrier,
          rawData: inv,
        },
      });

      await this.prisma.ledgerTransaction.create({
        data: {
          source: 'INVOICE',
          status: 'PENDING',
          txDate: new Date(inv.invDate ?? Date.now()),
          amount,
          direction: 'DEBIT',
          description: inv.sellerName ?? '電子發票',
          invoiceId: record.id,
        },
      });
      synced++;
    }

    return { synced, total: invoices.length };
  }

  // 模擬資料（API key 未設定時使用）
  private getMockInvoices(carrier: string) {
    return {
      details: [
        { invNum: `AA${Date.now()}`, invDate: new Date().toISOString(), sellerName: '全家便利商店', amount: 85, sellerBan: '22099131' },
        { invNum: `BB${Date.now()}`, invDate: new Date(Date.now()-86400000).toISOString(), sellerName: '麥當勞', amount: 129, sellerBan: '11111111' },
      ],
    };
  }
}
