import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly svc: AuthService) {}

  @Post('register')
  register(@Body() body: { email: string; password: string; name: string; companyName?: string; taxId?: string }) {
    return this.svc.register(body);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.svc.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Request() req: any) {
    return this.svc.me(req.user.userId);
  }

  @Post('switch-mode')
  @UseGuards(JwtAuthGuard)
  switchMode(@Request() req: any, @Body() body: { mode: 'PERSONAL' | 'BUSINESS' }) {
    return this.svc.switchMode(req.user.userId, body.mode);
  }

  @Post('update-profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Request() req: any, @Body() body: { name?: string; companyName?: string; taxId?: string; phone?: string; invoiceQuota?: number }) {
    return this.svc.updateProfile(req.user.userId, body);
  }
}
