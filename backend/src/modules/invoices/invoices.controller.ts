import { Controller, Post, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly svc: InvoicesService) {}

  @Post('sync')
  sync(@Request() req: any, @Query('carrier') carrier: string) {
    return this.svc.enqueueSync(req.user.userId, carrier);
  }

  @Get()
  list(@Request() req: any, @Query('month') month: string) {
    return this.svc.list(req.user.userId, month);
  }
}
