import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';

@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  findAll(@Query('status') status?: string, @Query('clientId') clientId?: string) {
    return { success: true, message: '取得合約列表成功', data: this.contractsService.findAll(status, clientId) };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { success: true, message: '取得合約成功', data: this.contractsService.findOne(id) };
  }

  @Post()
  create(@Body() dto: CreateContractDto) {
    return { success: true, message: '新增合約成功', data: this.contractsService.create(dto) };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateContractDto>) {
    return { success: true, message: '更新合約成功', data: this.contractsService.update(id, dto) };
  }

  @Patch(':id/terminate')
  terminate(@Param('id') id: string, @Body('lastModifiedBy') lastModifiedBy: string) {
    return { success: true, message: '合約已終止', data: this.contractsService.terminate(id, lastModifiedBy) };
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return { success: true, message: '合約已刪除', data: this.contractsService.softDelete(id) };
  }
}
