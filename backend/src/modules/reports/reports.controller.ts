import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Get('monthly-summary')
  monthlySummary(@Request() req: any, @Query('month') month: string) {
    return this.svc.getMonthlySummary(req.user.userId, month);
  }

  @Get('category-breakdown')
  categoryBreakdown(@Request() req: any, @Query('month') month: string) {
    return this.svc.getCategoryBreakdown(req.user.userId, month);
  }

  @Get('monthly-trend')
  monthlyTrend(@Request() req: any, @Query('months') months = '6') {
    return this.svc.getMonthlyTrend(req.user.userId, +months);
  }
}
