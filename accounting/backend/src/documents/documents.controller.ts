import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('clientId') clientId?: string,
    @Query('caseId') caseId?: string,
  ) {
    return { success: true, message: '取得文件列表成功', data: this.documentsService.findAll(category, clientId, caseId) };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { success: true, message: '取得文件成功', data: this.documentsService.findOne(id) };
  }

  @Post()
  create(@Body() dto: CreateDocumentDto) {
    return { success: true, message: '上傳文件成功', data: this.documentsService.create(dto) };
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return { success: true, message: '文件已刪除', data: this.documentsService.softDelete(id) };
  }
}
