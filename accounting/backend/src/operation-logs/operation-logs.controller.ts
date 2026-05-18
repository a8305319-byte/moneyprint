import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OperationLogsService } from './operation-logs.service';

@UseGuards(JwtAuthGuard)
@Controller('operation-logs')
export class OperationLogsController {
  constructor(private readonly logsService: OperationLogsService) {}

  @Get()
  findAll(@Query('user') user?: string, @Query('action') action?: string) {
    return { success: true, message: '取得操作紀錄成功', data: this.logsService.findAll(user, action) };
  }
}
