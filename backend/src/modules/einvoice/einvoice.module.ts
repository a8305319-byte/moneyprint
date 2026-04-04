import { Module } from '@nestjs/common';
import { EinvoiceController } from './einvoice.controller';
import { EinvoiceService } from './einvoice.service';

@Module({
  controllers: [EinvoiceController],
  providers: [EinvoiceService],
})
export class EinvoiceModule {}
