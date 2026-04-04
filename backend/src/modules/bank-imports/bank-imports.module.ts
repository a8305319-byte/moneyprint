import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { QUEUE_BANK_IMPORT } from '../../jobs/queues.constant';
import { BankImportsController } from './bank-imports.controller';
import { BankImportsService } from './bank-imports.service';
import { ImportBankFileProcessor } from './processors/import-bank-file.processor';

@Module({
  imports: [
    MulterModule.register({ storage: memoryStorage() }),
    BullModule.registerQueue({ name: QUEUE_BANK_IMPORT }),
  ],
  controllers: [BankImportsController],
  providers: [BankImportsService, ImportBankFileProcessor],
})
export class BankImportsModule {}
