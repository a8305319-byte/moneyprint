import {
  Controller, Post, Get, Query, Body,
  UseGuards, Request, HttpCode,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InvoicesService } from './invoices.service';

class SyncCarrierDto {
  @IsString() @IsNotEmpty() cardNo!:       string;
  @IsString() @IsNotEmpty() cardEncrypt!:  string;
  @IsArray()  @ArrayNotEmpty() months!:    string[];
}

class SaveBindingDto {
  @IsString() @IsNotEmpty() cardNo!: string;
}

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly svc: InvoicesService) {}

  // ── 同步財政部手機條碼載具發票
  // POST /invoices/carrier/sync
  @Post('carrier/sync')
  @HttpCode(200)
  syncCarrier(
    @Request() req: any,
    @Body() body: SyncCarrierDto,
  ) {
    return this.svc.syncCarrier(
      req.user.userId,
      body.cardNo,
      body.cardEncrypt,
      body.months,
    );
  }

  // ── 儲存手機條碼綁定（不含 cardEncrypt）
  // POST /invoices/carrier/binding
  @Post('carrier/binding')
  @HttpCode(200)
  saveBinding(
    @Request() req: any,
    @Body() body: SaveBindingDto,
  ) {
    return this.svc.saveCarrierBinding(req.user.userId, body.cardNo);
  }

  // ── 取得目前已綁定的手機條碼
  // GET /invoices/carrier/binding
  @Get('carrier/binding')
  getBinding(@Request() req: any) {
    return this.svc.getCarrierBinding(req.user.userId);
  }

  // ── 發票清單（月份查詢）
  // GET /invoices?month=2026-04
  @Get()
  list(
    @Request() req: any,
    @Query('month') month: string,
  ) {
    return this.svc.list(req.user.userId, month);
  }
}
