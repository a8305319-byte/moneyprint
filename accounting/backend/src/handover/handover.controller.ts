import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HandoverService } from './handover.service';
import { CreateHandoverDto } from './dto/create-handover.dto';

@UseGuards(JwtAuthGuard)
@Controller('handover')
export class HandoverController {
  constructor(private readonly handoverService: HandoverService) {}

  @Get()
  findAll() {
    return { success: true, message: '取得交接列表成功', data: this.handoverService.findAll() };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { success: true, message: '取得交接記錄成功', data: this.handoverService.findOne(id) };
  }

  @Post()
  create(@Body() dto: CreateHandoverDto) {
    return { success: true, message: '建立交接單成功', data: this.handoverService.create(dto) };
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @Body('lastModifiedBy') lastModifiedBy: string) {
    return { success: true, message: '交接已完成', data: this.handoverService.complete(id, lastModifiedBy) };
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return { success: true, message: '交接記錄已刪除', data: this.handoverService.softDelete(id) };
  }
}
