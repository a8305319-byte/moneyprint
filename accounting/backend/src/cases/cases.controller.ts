import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseStatusDto } from './dto/update-case-status.dto';
import { AddCommentDto } from './dto/add-comment.dto';

@UseGuards(JwtAuthGuard)
@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
    @Query('owner') owner?: string,
    @Query('month') month?: string,
  ) {
    return { success: true, message: '取得案件列表成功', data: this.casesService.findAll(status, clientId, owner, month) };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { success: true, message: '取得案件成功', data: this.casesService.findOne(id) };
  }

  @Post()
  create(@Body() dto: CreateCaseDto) {
    return { success: true, message: '新增案件成功', data: this.casesService.create(dto) };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateCaseDto>) {
    return { success: true, message: '更新案件成功', data: this.casesService.update(id, dto) };
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateCaseStatusDto) {
    return { success: true, message: '更新案件狀態成功', data: this.casesService.updateStatus(id, dto) };
  }

  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() dto: AddCommentDto) {
    return { success: true, message: '新增留言成功', data: this.casesService.addComment(id, dto) };
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return { success: true, message: '案件已停用', data: this.casesService.softDelete(id) };
  }
}
