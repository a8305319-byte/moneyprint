import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EinvoiceService } from './einvoice.service';

@Controller('einvoice')
@UseGuards(JwtAuthGuard)
export class EinvoiceController {
  constructor(private readonly svc: EinvoiceService) {}

  // ── 驗證手機條碼格式是否在財政部已登記
  // POST /einvoice/validate
  @Post('validate')
  validateCardNo(@Body() body: { cardNo: string }) {
    return this.svc.validateCardNo(body.cardNo);
  }
}
