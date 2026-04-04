import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QUEUE_INVOICE_SYNC } from '../../jobs/queues.constant';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { SyncInvoicesProcessor } from './processors/sync-invoices.processor';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_INVOICE_SYNC })],
  controllers: [InvoicesController],
  providers: [InvoicesService, SyncInvoicesProcessor],
  exports: [InvoicesService],
})
export class InvoicesModule {}
