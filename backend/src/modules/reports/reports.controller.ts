import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Get('monthly-summary')
  monthlySummary(@Query('month') month: string) { return this.svc.getMonthlySummary(month); }

  @Get('category-breakdown')
  categoryBreakdown(@Query('month') month: string) { return this.svc.getCategoryBreakdown(month); }

  @Get('monthly-trend')
  monthlyTrend(@Query('months') months = '6') { return this.svc.getMonthlyTrend(+months); }
}
