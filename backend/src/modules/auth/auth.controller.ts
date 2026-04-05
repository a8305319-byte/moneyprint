import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SwitchModeDto } from './dto/switch-mode.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly svc: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.svc.register(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginDto) {
    return this.svc.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Request() req: any) {
    return this.svc.me(req.user.userId);
  }

  @Post('switch-mode')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  switchMode(@Request() req: any, @Body() body: SwitchModeDto) {
    return this.svc.switchMode(req.user.userId, body.mode);
  }

  @Post('update-profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Request() req: any,
    @Body() body: { name?: string; companyName?: string; taxId?: string; phone?: string; invoiceQuota?: number },
  ) {
    return this.svc.updateProfile(req.user.userId, body);
  }
}
