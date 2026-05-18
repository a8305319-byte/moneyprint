import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SalaryService } from './salary.service';
import { CreateSalaryDto } from './dto/create-salary.dto';

@UseGuards(JwtAuthGuard)
@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Get()
  findAll(@Query('month') month?: string, @Query('employeeId') employeeId?: string) {
    return { success: true, message: '取得薪資列表成功', data: this.salaryService.findAll(month, employeeId) };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { success: true, message: '取得薪資記錄成功', data: this.salaryService.findOne(id) };
  }

  @Post()
  create(@Body() dto: CreateSalaryDto) {
    return { success: true, message: '建立薪資記錄成功', data: this.salaryService.create(dto) };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateSalaryDto>) {
    return { success: true, message: '更新薪資記錄成功', data: this.salaryService.update(id, dto) };
  }

  @Patch(':id/pay')
  markPaid(@Param('id') id: string, @Body('lastModifiedBy') lastModifiedBy: string) {
    return { success: true, message: '薪資已發放', data: this.salaryService.markPaid(id, lastModifiedBy) };
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return { success: true, message: '薪資記錄已刪除', data: this.salaryService.softDelete(id) };
  }
}
