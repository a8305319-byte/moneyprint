/**
 * EinvoiceService — 財政部電子發票整合服務平台
 *
 * 此模組已移除所有 mock 邏輯。
 * 真實同步入口：InvoicesService.syncCarrier()
 *
 * 取得 appID 申請：https://www.einvoice.nat.gov.tw/APCONSUMER/BTC605W/
 * 官方規格書 v1.9：https://www.einvoice.nat.gov.tw/static/ptl/ein_upload/attachments/1693297176294_0.pdf
 */
import { Injectable, Logger, ServiceUnavailableException, BadRequestException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

const MOF_API_BASE     = 'https://api.einvoice.nat.gov.tw';
const CARD_TYPE_MOBILE = '3J0002';
const EXP_TIMESTAMP    = '2147483647';

@Injectable()
export class EinvoiceService {
  private readonly logger = new Logger(EinvoiceService.name);

  // ── 驗證手機條碼是否有效（可選用，不呼叫同步 API）
  async validateCardNo(cardNo: string): Promise<{ valid: boolean; msg: string }> {
    const appId = process.env.MOF_APP_ID;
    if (!appId) {
      return { valid: false, msg: '財政部 API 憑證未設定（MOF_APP_ID 未設定）' };
    }

    const params = new URLSearchParams({
      version:      '1.0',
      action:       'qryCarrierAgg',
      cardType:     CARD_TYPE_MOBILE,
      cardNo,
      timeStamp:    Math.floor(Date.now() / 1000).toString(),
      expTimeStamp: EXP_TIMESTAMP,
      appID:        appId,
    });

    try {
      const res = await axios.post(
        `${MOF_API_BASE}/PB2CAPIVAN/Carrier/Aggregate`,
        params.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10000 },
      );
      const code = res.data?.code ?? res.data?.resCode;
      return {
        valid: code === '200',
        msg:   res.data?.msg ?? res.data?.resMsg ?? '',
      };
    } catch (err: any) {
      this.logger.warn(`載具驗證 API 失敗: ${err.message}`);
      throw new ServiceUnavailableException('財政部 API 無法連線');
    }
  }
}
