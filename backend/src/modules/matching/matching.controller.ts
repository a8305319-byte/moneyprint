import { Controller, Get, Post, Param } from '@nestjs/common';
import { MatchingService } from './matching.service';

@Controller('matches')
export class MatchingController {
  constructor(private readonly svc: MatchingService) {}

  @Post('auto')
  autoMatch() { return this.svc.autoMatch(); }

  @Get('pending')
  pending() { return this.svc.listPending(); }

  @Post(':id/confirm')
  confirm(@Param('id') id: string) { return this.svc.confirmMatch(id); }

  @Post(':id/reject')
  reject(@Param('id') id: string) { return this.svc.rejectMatch(id); }
}
