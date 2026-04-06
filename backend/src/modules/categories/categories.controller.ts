import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriesService } from './categories.service';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly svc: CategoriesService) {}

  @Get()
  list() { return this.svc.list(); }

  @Post('classify')
  classify(@Request() req: any) {
    return this.svc.classifyPending(req.user.userId);
  }

  @Post(':ledgerId/category/:categoryId')
  manualSet(
    @Request() req: any,
    @Param('ledgerId') ledgerId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.svc.manualSet(req.user.userId, ledgerId, categoryId);
  }
}
