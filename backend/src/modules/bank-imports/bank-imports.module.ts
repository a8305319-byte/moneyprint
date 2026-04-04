import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BankImportsController } from './bank-imports.controller';
import { BankImportsService } from './bank-imports.service';

@Module({
  imports: [MulterModule.register({ storage: memoryStorage() })],
  controllers: [BankImportsController],
  providers: [BankImportsService],
})
export class BankImportsModule {}
