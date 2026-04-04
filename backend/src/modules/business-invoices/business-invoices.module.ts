import { Module } from '@nestjs/common';
import { BusinessInvoicesController } from './business-invoices.controller';
import { BusinessInvoicesService } from './business-invoices.service';
import { PdfService } from './pdf.service';

@Module({
  controllers: [BusinessInvoicesController],
  providers: [BusinessInvoicesService, PdfService],
})
export class BusinessInvoicesModule {}
