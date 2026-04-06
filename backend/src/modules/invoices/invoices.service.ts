import {
  Injectable, Logger, BadRequestException,
  ServiceUnavailableException, UnprocessableEntityException,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

// ── 財政部電子發票整合服務平台 (官方規格 v1.9, 民國 112 年)
// 申請 appID: https://www.einvoice.nat.gov.tw/APCONSUMER/BTC605W/
// 規格書:     https://www.einvoice.nat.gov.tw/static/ptl/ein_upload/attachments/1693297176294_0.pdf
// ─────────────────────────────────────────────────────────────────
const MOF_API_BASE = 'https://api.einvoice.nat.gov.tw';
const CARD_TYPE_MOBILE = '3J0002';          // 手機條碼
const EXP_TIMESTAMP    = '2147483647';      // 官方規格固定值
const RATE_LIMIT_MS    = 5 * 60 * 1000;    // 5 分鐘一次

// 手機條碼格式：/ 開頭 + 7 碼大寫英數字
const CARD_NO_REGEX = /^\/[A-Z0-9+\-.]{7}$/;

// ── MOF API 回傳格式
interface MofInvoice {
  rowNum:       string;
  invNum:       string;   // 發票號碼 (AB12345678)
  cardType:     string;
  cardNo:       string;
  sellerName:   string;
  invStatus:    string;   // 已確認 | 待確認
  invDonatable: string;   // true | false
  amount:       string;   // 含稅總額
  invPeriod:    string;   // ROC calendar YYMM e.g. "11504"
}

interface MofResponse {
  v:              string;
  code:           string;
  msg:            string;
  onlyWinningInv: string;
  details?:       MofInvoice[];
}

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── 取得或建立使用者的載具綁定
  async getCarrierBinding(userId: string) {
    return this.prisma.carrierBinding.findUnique({ where: { userId } });
  }

  // ── 儲存手機條碼（不儲存 cardEncrypt）
  async saveCarrierBinding(userId: string, cardNo: string) {
    if (!CARD_NO_REGEX.test(cardNo)) {
      throw new BadRequestException('手機條碼格式錯誤，應為 /XXXXXXX（/ 開頭 + 7 碼大寫英數）');
    }
    return this.prisma.carrierBinding.upsert({
      where: { userId },
      create: { userId, cardNo },
      update: { cardNo },
    });
  }

  // ── 主要同步入口：cardEncrypt 僅在本次請求使用，不落地
  async syncCarrier(
    userId: string,
    cardNo: string,
    cardEncrypt: string,
    months: string[],   // ['2026-04', '2026-03']
  ): Promise<{ synced: number; already: number; total: number; monthsProcessed: number }> {

    // 1. 參數驗證
    if (!CARD_NO_REGEX.test(cardNo)) {
      throw new BadRequestException('手機條碼格式錯誤（/XXXXXXX）');
    }
    if (!cardEncrypt || cardEncrypt.trim().length === 0) {
      throw new BadRequestException('請填入手機條碼驗證碼');
    }
    if (!months || months.length === 0) {
      throw new BadRequestException('請選擇查詢月份');
    }

    // 2. Rate limit（同一 user 5 分鐘內不重複同步）
    const binding = await this.prisma.carrierBinding.findUnique({ where: { userId } });
    if (binding?.lastSyncedAt) {
      const elapsed = Date.now() - binding.lastSyncedAt.getTime();
      if (elapsed < RATE_LIMIT_MS) {
        const remainSec = Math.ceil((RATE_LIMIT_MS - elapsed) / 1000);
        throw new UnprocessableEntityException(`請稍後再同步（${remainSec} 秒後可再試）`);
      }
    }

    // 3. 確認 appID 已設定
    const appId = process.env.MOF_APP_ID;
    if (!appId) {
      this.logger.error('MOF_APP_ID 未設定，無法呼叫財政部 API');
      throw new ServiceUnavailableException(
        '財政部 API 憑證未設定（MOF_APP_ID）。' +
        '請向財政部財政資訊中心申請 appID 後設定環境變數。' +
        '申請網址: https://www.einvoice.nat.gov.tw/APCONSUMER/BTC605W/',
      );
    }

    // 4. 儲存或更新 cardNo 綁定（不含 cardEncrypt）
    await this.prisma.carrierBinding.upsert({
      where:  { userId },
      create: { userId, cardNo },
      update: { cardNo },
    });

    // 5. 逐月查詢（每次只能同月，官方規格限制）
    let totalSynced = 0;
    let totalAlready = 0;
    let totalRaw = 0;

    for (const monthStr of months) {
      if (!/^\d{4}-\d{2}$/.test(monthStr)) continue;

      const { startDate, endDate } = this.buildDateRange(monthStr);
      try {
        const result = await this.callMofApi(userId, cardNo, cardEncrypt, appId, startDate, endDate);
        totalSynced  += result.synced;
        totalAlready += result.already;
        totalRaw     += result.total;
      } catch (err: any) {
        // 單月失敗不中斷其他月，記錄 log
        this.logger.warn(`月份 ${monthStr} 同步失敗: ${err.message}`);
        if (months.length === 1) throw err; // 只查一月時才向上拋
      }
    }

    // 6. 更新同步時間
    await this.prisma.carrierBinding.update({
      where:  { userId },
      data:   { lastSyncedAt: new Date(), lastSyncMonth: months[0] },
    });

    this.logger.log(`user=${userId} 同步完成: synced=${totalSynced} already=${totalAlready} raw=${totalRaw}`);
    return { synced: totalSynced, already: totalAlready, total: totalRaw, monthsProcessed: months.length };
  }

  // ── 呼叫財政部 API 並寫入 DB
  private async callMofApi(
    userId: string,
    cardNo: string,
    cardEncrypt: string,
    appId: string,
    startDate: string,
    endDate: string,
  ) {
    const timeStamp = Math.floor(Date.now() / 1000).toString();
    const params = new URLSearchParams({
      version:      '0.3',
      action:       'carrierInvChk',
      cardType:     CARD_TYPE_MOBILE,
      cardNo,
      cardEncrypt,
      startDate,
      endDate,
      onlyWinningInv: 'N',
      timeStamp,
      expTimeStamp:   EXP_TIMESTAMP,
      appID:          appId,
    });

    let mofRes: MofResponse;
    try {
      const res = await axios.post<MofResponse>(
        `${MOF_API_BASE}/PB2CAPIVAN/invServ/InvServ`,
        params.toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 15000,
        },
      );
      mofRes = res.data;
    } catch (err: any) {
      const axErr = err as AxiosError;
      if (axErr.code === 'ECONNABORTED') {
        throw new ServiceUnavailableException('財政部 API 請求逾時，請稍後再試');
      }
      this.logger.error(`財政部 API HTTP 錯誤: ${axErr.message}`);
      throw new ServiceUnavailableException(`財政部 API 無法連線: ${axErr.message}`);
    }

    // 解析財政部回傳碼
    if (mofRes.code !== '200') {
      this.logger.warn(`財政部 API 回傳錯誤 code=${mofRes.code} msg=${mofRes.msg}`);
      switch (mofRes.code) {
        case '401': throw new BadRequestException('手機條碼或驗證碼錯誤，請確認後再試');
        case '403': throw new BadRequestException('載具無查詢權限');
        case '404': // 查無資料（正常情況）
          return { synced: 0, already: 0, total: 0 };
        default:
          throw new ServiceUnavailableException(`財政部 API 回傳: ${mofRes.msg} (${mofRes.code})`);
      }
    }

    const invoices: MofInvoice[] = mofRes.details ?? [];
    let synced = 0;
    let already = 0;

    for (const inv of invoices) {
      if (!inv.invNum) continue;

      // 去重：invoiceNo 全局唯一（財政部發票號碼不重複）
      const existing = await this.prisma.invoiceRecord.findUnique({
        where: { invoiceNo: inv.invNum },
      });
      if (existing) {
        // 若屬於不同 user 的舊記錄 → 也計入 already，不覆蓋
        already++;
        continue;
      }

      const amount = Number(inv.amount ?? 0);
      const invDate = this.parseMofDate(inv.invPeriod, inv.invNum);

      const record = await this.prisma.invoiceRecord.create({
        data: {
          userId,
          invoiceNo:   inv.invNum,
          invoiceDate: invDate,
          sellerName:  inv.sellerName ?? '未知商家',
          sellerTaxId: null,
          amount,
          taxAmount:   Math.round(amount * 5 / 105 * 100) / 100,
          carrier:     cardNo,
          source:      'MOF_CARRIER',
          rawData:     inv as any,
        },
      });

      // 同步至 Ledger（PENDING 待對帳）
      await this.prisma.ledgerTransaction.create({
        data: {
          userId,
          source:      'INVOICE',
          status:      'PENDING',
          txDate:      invDate,
          amount,
          direction:   'DEBIT',
          description: inv.sellerName ?? '電子發票',
          invoiceId:   record.id,
        },
      });

      synced++;
    }

    return { synced, already, total: invoices.length };
  }

  // ── 建立同月份起迄日期 (yyyy/MM/dd)，符合官方規格限制
  private buildDateRange(monthStr: string): { startDate: string; endDate: string } {
    const [y, m] = monthStr.split('-').map(Number);
    const start  = new Date(y, m - 1, 1);
    const end    = new Date(y, m, 0);       // 月末
    const now    = new Date();

    const fmt = (d: Date) =>
      `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;

    return {
      startDate: fmt(start),
      endDate:   fmt(end < now ? end : now), // 未來日期用今日
    };
  }

  // ── 解析財政部 invPeriod (民國 YYMM) 為 Date
  private parseMofDate(invPeriod: string, invNum: string): Date {
    try {
      if (invPeriod && /^\d{5}$/.test(invPeriod)) {
        const year  = 1911 + parseInt(invPeriod.slice(0, 3), 10);
        const month = parseInt(invPeriod.slice(3), 10) - 1;
        return new Date(year, month, 15); // 用月中作為近似日期
      }
    } catch { /* fall through */ }
    return new Date();
  }

  // ── 查詢發票清單（前端分頁）
  async list(userId: string, month?: string) {
    const where: any = { userId };
    if (month) {
      if (!/^\d{4}-\d{2}$/.test(month)) return [];
      const [y, m] = month.split('-').map(Number);
      where.invoiceDate = {
        gte: new Date(y, m - 1, 1),
        lt:  new Date(y, m, 1),
      };
    }
    return this.prisma.invoiceRecord.findMany({
      where,
      orderBy: { invoiceDate: 'desc' },
      select: {
        id: true, invoiceNo: true, invoiceDate: true,
        sellerName: true, amount: true, source: true,
      },
      take: 200,
    });
  }
}
