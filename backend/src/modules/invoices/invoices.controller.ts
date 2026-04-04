import { Controller, Post, Get, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly svc: InvoicesService) {}

  @Post('sync')
  sync(@Query('carrier') carrier: string) {
    return this.svc.enqueueSync(carrier);
  }

  @Get()
  list(@Query('month') month: string) {
    return this.svc.list(month);
  }
}
