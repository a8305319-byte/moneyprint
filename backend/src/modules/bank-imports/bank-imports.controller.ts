import { Controller, Post, Get, Param, Body, UploadedFile, UseInterceptors, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BankImportsService } from './bank-imports.service';

@Controller('bank-imports')
export class BankImportsController {
  constructor(private readonly svc: BankImportsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('accountId') accountId: string,
  ) {
    return this.svc.enqueueImport(accountId, file);
  }

  @Get(':id/status')
  status(@Param('id') id: string) {
    return this.svc.getStatus(id);
  }

  @Get()
  list(@Query('accountId') accountId: string) {
    return this.svc.list(accountId);
  }
}
