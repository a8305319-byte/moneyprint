import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findMine(@Query('recipientId') recipientId: string) {
    return { success: true, message: '取得通知成功', data: this.notificationsService.findByRecipient(recipientId) };
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return { success: true, message: '已標為已讀', data: this.notificationsService.markRead(id) };
  }

  @Patch('read-all')
  markAllRead(@Body('recipientId') recipientId: string) {
    return { success: true, message: '全部標為已讀', data: this.notificationsService.markAllRead(recipientId) };
  }

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return { success: true, message: '新增通知成功', data: this.notificationsService.create(dto) };
  }
}
