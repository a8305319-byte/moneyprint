import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilingsService } from './filings.service';
import { CreateFilingDto } from './dto/create-filing.dto';

@UseGuards(JwtAuthGuard)
@Controller('filings')
export class FilingsController {
  constructor(private readonly filingsService: FilingsService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
    @Query('type') type?: string,
  ) {
    return { success: true, message: '取得申報列表成功', data: this.filingsService.findAll(status, clientId, type) };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { success: true, message: '取得申報記錄成功', data: this.filingsService.findOne(id) };
  }

  @Post()
  create(@Body() dto: CreateFilingDto) {
    return { success: true, message: '新增申報記錄成功', data: this.filingsService.create(dto) };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateFilingDto>) {
    return { success: true, message: '更新申報記錄成功', data: this.filingsService.update(id, dto) };
  }

  @Patch(':id/filed')
  markFiled(
    @Param('id') id: string,
    @Body('refNum') refNum: string,
    @Body('lastModifiedBy') lastModifiedBy: string,
  ) {
    return { success: true, message: '已標記為已申報', data: this.filingsService.markFiled(id, refNum, lastModifiedBy) };
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('lastModifiedBy') lastModifiedBy: string,
  ) {
    return { success: true, message: '更新申報狀態成功', data: this.filingsService.updateStatus(id, status, lastModifiedBy) };
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return { success: true, message: '申報記錄已刪除', data: this.filingsService.softDelete(id) };
  }
}
