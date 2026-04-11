import {
  Controller, Get, Post, Delete,
  Query, Res, Request, UseGuards, HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GmailService } from './gmail.service';

@Controller('gmail')
export class GmailController {
  constructor(private readonly svc: GmailService) {}

  // ── GET /gmail/connect/start ──────────────────────────────────────────────
  // Returns the Google OAuth URL. Frontend will window.location.href to it.
  @Get('connect/start')
  @UseGuards(JwtAuthGuard)
  connectStart(@Request() req: any) {
    const url = this.svc.getAuthUrl(req.user.userId);
    return { url };
  }

  // ── GET /gmail/connect/callback ───────────────────────────────────────────
  // Google redirects here after user consents. NOT behind JwtAuthGuard.
  // We redirect the browser to the frontend with a result query param.
  @Get('connect/callback')
  async connectCallback(
    @Query('code')  code:  string,
    @Query('state') state: string,
    @Query('error') error: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Res() res: any,
  ) {
    const frontendUrl = this.svc.frontendUrl;
    if (error || !code || !state) {
      return res.redirect(`${frontendUrl}/invoices?gmail=cancelled`);
    }
    try {
      const redirectUrl = await this.svc.handleCallback(code, state);
      return res.redirect(redirectUrl);
    } catch {
      return res.redirect(`${frontendUrl}/invoices?gmail=error`);
    }
  }

  // ── GET /gmail/status ─────────────────────────────────────────────────────
  @Get('status')
  @UseGuards(JwtAuthGuard)
  getStatus(@Request() req: any) {
    return this.svc.getStatus(req.user.userId);
  }

  // ── POST /gmail/sync-invoices ─────────────────────────────────────────────
  @Post('sync-invoices')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  syncInvoices(@Request() req: any) {
    return this.svc.syncInvoices(req.user.userId);
  }

  // ── DELETE /gmail/disconnect ──────────────────────────────────────────────
  @Delete('disconnect')
  @UseGuards(JwtAuthGuard)
  disconnect(@Request() req: any) {
    return this.svc.disconnect(req.user.userId);
  }
}
