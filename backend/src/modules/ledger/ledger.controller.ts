import { Controller, Get, Post, Delete, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
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

  @Post()
  create(@Request() req: any, @Body() body: {
    description: string;
    amount: number;
    direction: 'DEBIT' | 'CREDIT';
    categoryName?: string;
    txDate?: string;
  }) {
    return this.svc.create(req.user.userId, body);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.svc.delete(req.user.userId, id);
  }
}
