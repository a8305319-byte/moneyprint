import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly svc: CategoriesService) {}

  @Get()
  list() { return this.svc.list(); }

  @Post('classify')
  classify() { return this.svc.classifyPending(); }

  @Post(':ledgerId/category/:categoryId')
  manualSet(@Param('ledgerId') ledgerId: string, @Param('categoryId') categoryId: string) {
    return this.svc.manualSet(ledgerId, categoryId);
  }
}
