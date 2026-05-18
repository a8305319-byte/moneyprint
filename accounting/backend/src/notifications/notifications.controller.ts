import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findMine(@Request() req: any) {
    return { success: true, message: '取得通知成功', data: this.notificationsService.findByRecipient(req.user.id) };
  }

  @Patch('read-all')
  markAllRead(@Request() req: any) {
    return { success: true, message: '全部標為已讀', data: this.notificationsService.markAllRead(req.user.id) };
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @Request() req: any) {
    return { success: true, message: '已標為已讀', data: this.notificationsService.markRead(id, req.user.id) };
  }

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return { success: true, message: '新增通知成功', data: this.notificationsService.create(dto) };
  }
}
