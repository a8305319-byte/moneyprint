import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateClientDto } from './dto/create-client.dto';
import { ClientsService } from './clients.service';

@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  findAll() {
    return { success: true, message: '取得客戶列表成功', data: this.clientsService.findAll() };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { success: true, message: '取得客戶資料成功', data: this.clientsService.findOne(id) };
  }

  @Post()
  create(@Body() dto: CreateClientDto) {
    return { success: true, message: '新增客戶成功', data: this.clientsService.create(dto) };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateClientDto>) {
    return { success: true, message: '更新客戶成功', data: this.clientsService.update(id, dto) };
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return { success: true, message: '已停用客戶', data: this.clientsService.softDelete(id) };
  }
}
