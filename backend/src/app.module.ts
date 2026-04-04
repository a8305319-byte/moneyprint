import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BankImportsModule } from './modules/bank-imports/bank-imports.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { MatchingModule } from './modules/matching/matching.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ReportsModule } from './modules/reports/reports.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { BusinessInvoicesModule } from './modules/business-invoices/business-invoices.module';
import { EinvoiceModule } from './modules/einvoice/einvoice.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      redis: process.env.REDIS_URL ?? 'redis://localhost:6379',
    }),
    PrismaModule,
    AuthModule,
    BankImportsModule,
    InvoicesModule,
    MatchingModule,
    CategoriesModule,
    ReportsModule,
    LedgerModule,
    BusinessInvoicesModule,
    EinvoiceModule,
  ],
})
export class AppModule {}
