import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LedgerService } from './ledger.service';

@Controller('ledger')
@UseGuards(JwtAuthGuard)
export class LedgerController {
  constructor(private readonly svc: LedgerService) {}

  @Get()
  list(@Request() req: any, @Query('month') month?: string) {
    return this.svc.list(req.user.userId, month);
  }
}
