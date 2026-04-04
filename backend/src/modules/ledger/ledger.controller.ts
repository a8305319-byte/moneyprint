import { Controller, Get, Query } from '@nestjs/common';
import { LedgerService } from './ledger.service';

@Controller('ledger')
export class LedgerController {
  constructor(private readonly svc: LedgerService) {}

  @Get()
  list(@Query('month') month?: string) {
    return this.svc.list(month);
  }
}
