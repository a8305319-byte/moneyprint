import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  findAll(
    @Query('month') month?: string,
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
  ) {
    return { success: true, message: '取得收款列表成功', data: this.paymentsService.findAll(month, clientId, status) };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { success: true, message: '取得收款記錄成功', data: this.paymentsService.findOne(id) };
  }

  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return { success: true, message: '新增收款記錄成功', data: this.paymentsService.create(dto) };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreatePaymentDto>) {
    return { success: true, message: '更新收款記錄成功', data: this.paymentsService.update(id, dto) };
  }

  @Patch(':id/paid')
  markPaid(
    @Param('id') id: string,
    @Body('method') method: string,
    @Body('lastModifiedBy') lastModifiedBy: string,
  ) {
    return { success: true, message: '已標記為已收款', data: this.paymentsService.markPaid(id, method, lastModifiedBy) };
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return { success: true, message: '收款記錄已刪除', data: this.paymentsService.softDelete(id) };
  }
}
