import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeesService } from './employees.service';

@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  findAll() {
    return { success: true, message: '取得員工列表成功', data: this.employeesService.findAll() };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { success: true, message: '取得員工資料成功', data: this.employeesService.findOne(id) };
  }

  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return { success: true, message: '新增員工成功', data: this.employeesService.create(dto) };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateEmployeeDto>) {
    return { success: true, message: '更新員工成功', data: this.employeesService.update(id, dto) };
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return { success: true, message: '已停用員工', data: this.employeesService.softDelete(id) };
  }
}
