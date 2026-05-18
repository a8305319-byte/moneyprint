import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('assignee') assignee?: string,
    @Query('caseId') caseId?: string,
    @Query('priority') priority?: string,
  ) {
    return { success: true, message: '取得任務列表成功', data: this.tasksService.findAll(status, assignee, caseId, priority) };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { success: true, message: '取得任務成功', data: this.tasksService.findOne(id) };
  }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return { success: true, message: '新增任務成功', data: this.tasksService.create(dto) };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateTaskDto>) {
    return { success: true, message: '更新任務成功', data: this.tasksService.update(id, dto) };
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('lastModifiedBy') lastModifiedBy: string,
  ) {
    return { success: true, message: '更新任務狀態成功', data: this.tasksService.updateStatus(id, status, lastModifiedBy) };
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return { success: true, message: '任務已刪除', data: this.tasksService.softDelete(id) };
  }
}
