import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { ClientsModule } from './clients/clients.module';
import { CasesModule } from './cases/cases.module';
import { TasksModule } from './tasks/tasks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SalaryModule } from './salary/salary.module';
import { FilingsModule } from './filings/filings.module';
import { ContractsModule } from './contracts/contracts.module';
import { PaymentsModule } from './payments/payments.module';
import { DocumentsModule } from './documents/documents.module';
import { HandoverModule } from './handover/handover.module';
import { OperationLogsModule } from './operation-logs/operation-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    EmployeesModule,
    ClientsModule,
    CasesModule,
    TasksModule,
    NotificationsModule,
    DashboardModule,
    SalaryModule,
    FilingsModule,
    ContractsModule,
    PaymentsModule,
    DocumentsModule,
    HandoverModule,
    OperationLogsModule,
  ],
})
export class AppModule {}
