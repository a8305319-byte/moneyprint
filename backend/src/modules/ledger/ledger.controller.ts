import { Controller, Get, Post, Delete, Body, Query, Param, UseGuards, Request, UploadedFile, UseInterceptors, HttpCode, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LedgerService } from './ledger.service';

@Controller('ledger')
@UseGuards(JwtAuthGuard)
export class LedgerController {
  constructor(private readonly svc: LedgerService) {}

  @Get()
  list(@Request() req: any, @Query('month') month?: string) {
    return this.svc.list(req.user.userId, month);
  }

  @Post()
  create(@Request() req: any, @Body() body: {
    description: string;
    amount: number;
    direction: 'DEBIT' | 'CREDIT';
    categoryName?: string;
    txDate?: string;
  }) {
    return this.svc.create(req.user.userId, body);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.svc.delete(req.user.userId, id);
  }

  // ── POST /ledger/import-bank-csv ──────────────────────────────────────────
  @Post('import-bank-csv')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
      if (!file.originalname.match(/\.(csv|txt)$/i)) {
        return cb(new BadRequestException('只接受 .csv 或 .txt 格式'), false);
      }
      cb(null, true);
    },
  }))
  importBankCsv(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('請上傳 CSV 檔案');
    return this.svc.importBankCsv(req.user.userId, file.buffer);
  }
}
