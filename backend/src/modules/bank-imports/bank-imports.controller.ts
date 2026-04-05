import { Controller, Post, Get, Param, Body, UploadedFile, UseInterceptors, Query, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BankImportsService } from './bank-imports.service';

@Controller('bank-imports')
@UseGuards(JwtAuthGuard)
export class BankImportsController {
  constructor(private readonly svc: BankImportsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('accountId') accountId: string,
  ) {
    return this.svc.enqueueImport(req.user.userId, accountId, file);
  }

  @Get(':id/status')
  status(@Param('id') id: string) {
    return this.svc.getStatus(id);
  }

  @Get()
  list(@Request() req: any, @Query('accountId') accountId: string) {
    return this.svc.list(req.user.userId, accountId);
  }
}
