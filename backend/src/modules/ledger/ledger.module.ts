import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { LedgerController } from './ledger.controller';
import { LedgerService } from './ledger.service';

@Module({
  imports: [MulterModule.register({})],
  controllers: [LedgerController],
  providers: [LedgerService],
})
export class LedgerModule {}
