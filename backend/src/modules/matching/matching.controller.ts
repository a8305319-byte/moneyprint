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
  confirm(@Request() req: any, @Param('id') id: string) {
    return this.svc.confirmMatch(req.user.userId, id);
  }

  @Post(':id/reject')
  reject(@Request() req: any, @Param('id') id: string) {
    return this.svc.rejectMatch(req.user.userId, id);
  }
}
