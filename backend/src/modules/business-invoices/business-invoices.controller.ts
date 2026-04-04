import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BusinessInvoicesService } from './business-invoices.service';
import { PdfService } from './pdf.service';

@Controller('business-invoices')
@UseGuards(JwtAuthGuard)
export class BusinessInvoicesController {
  constructor(
    private readonly svc: BusinessInvoicesService,
    private readonly pdf: PdfService,
  ) {}

  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.svc.create(req.user.userId, body);
  }

  @Get()
  list(@Request() req: any, @Query('direction') direction?: string, @Query('month') month?: string) {
    return this.svc.list(req.user.userId, direction, month);
  }

  @Get('summary')
  summary(@Request() req: any, @Query('month') month?: string) {
    return this.svc.monthlySummary(req.user.userId, month);
  }

  @Get('report/pdf')
  async downloadPdf(@Request() req: any, @Query('month') month: string, @Res() res: Response) {
    const data = await this.svc.monthlySummary(req.user.userId, month);
    const invoices = await this.svc.list(req.user.userId, undefined, month);
    const user = await this.svc.getUser(req.user.userId);
    const pdfBuffer = await this.pdf.generateMonthlyReport(user, invoices, data, month);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="moneyprint-${month}.pdf"`,
    });
    res.end(pdfBuffer);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.svc.remove(req.user.userId, id);
  }
}
