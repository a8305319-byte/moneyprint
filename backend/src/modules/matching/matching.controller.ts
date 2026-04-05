import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MatchingService } from './matching.service';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(private readonly svc: MatchingService) {}

  @Post('auto')
  autoMatch(@Request() req: any) { return this.svc.autoMatch(req.user.userId); }

  @Get('pending')
  pending(@Request() req: any) { return this.svc.listPending(req.user.userId); }

  @Post(':id/confirm')
  confirm(@Param('id') id: string) { return this.svc.confirmMatch(id); }

  @Post(':id/reject')
  reject(@Param('id') id: string) { return this.svc.rejectMatch(id); }
}
