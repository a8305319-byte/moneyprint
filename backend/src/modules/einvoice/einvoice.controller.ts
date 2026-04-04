import { Controller, Get, Post, Query, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EinvoiceService } from './einvoice.service';

@Controller('einvoice')
@UseGuards(JwtAuthGuard)
export class EinvoiceController {
  constructor(private readonly svc: EinvoiceService) {}

  @Post('sync')
  sync(@Request() req: any, @Body() body: { carrier: string; cardNo?: string; cardEncrypt?: string }) {
    return this.svc.syncFromMOF(body.carrier, body.cardNo, body.cardEncrypt);
  }

  @Get('query')
  query(@Query('carrier') carrier: string, @Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.svc.queryInvoices(carrier, startDate, endDate);
  }
}
