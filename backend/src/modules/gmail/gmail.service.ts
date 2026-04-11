import {
  Injectable, BadRequestException, NotFoundException, ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'crypto';
import { google } from 'googleapis';

// ── Token encryption (AES-256-CBC) ───────────────────────────────────────────
function encrypt(text: string, key: Buffer): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + enc.toString('hex');
}
function decrypt(ciphertext: string, key: Buffer): string {
  const [ivHex, encHex] = ciphertext.split(':');
  const decipher = createDecipheriv('aes-256-cbc', key, Buffer.from(ivHex, 'hex'));
  return Buffer.concat([
    decipher.update(Buffer.from(encHex, 'hex')),
    decipher.final(),
  ]).toString('utf8');
}

// ── Taiwan e-invoice number: 2 uppercase letters + 8 digits ──────────────────
const INVOICE_NO_RE = /([A-Z]{2}[-\s]?\d{8})/;

// ── Amount patterns ───────────────────────────────────────────────────────────
const AMOUNT_PATTERNS = [
  /(?:消費金額|合計|總金額|實付金額|付款金額|訂單金額)[：:\s]*(?:NT\$?|NTD|TWD|＄|\$)?\s*([\d,]+)/i,
  /(?:NT\$?|＄|\$)\s*([\d,]+)/,
  /(?:^|[^a-z])金額[：:\s]*([\d,]+)/im,
  /([\d,]+)\s*元/,
];

// ── Date patterns ─────────────────────────────────────────────────────────────
const DATE_PATTERNS = [
  /(?:發票日期|開立日期|交易日期|消費日期)[：:\s]*(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/i,
  /(\d{4})[\/\-](\d{2})[\/\-](\d{2})/,
];

// ── Seller patterns ───────────────────────────────────────────────────────────
const SELLER_PATTERNS = [
  /(?:賣方|賣家|廠商|店家|商店名稱|收款人|賣方名稱)[：:\s]+([^\n\r,，<>]{2,40})/i,
  /(?:開立單位|發票抬頭|賣方統編)[：:\s]+([^\n\r,，<>]{2,40})/i,
];

// ── Gmail query (subject filter only; no full inbox pull) ─────────────────────
const GMAIL_QUERY_TERMS = [
  'subject:電子發票',
  'subject:發票通知',
  'subject:發票開立',
  'subject:電子收據',
  'subject:發票字軌',
  'subject:"e-invoice"',
  'subject:invoice',
].join(' OR ');

@Injectable()
export class GmailService {
  readonly frontendUrl: string;
  private readonly callbackUrl: string;
  private readonly encryptKey: Buffer;
  private readonly stateSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.frontendUrl  = config.get('FRONTEND_URL', 'https://frontend-three-phi-36.vercel.app');
    const backendUrl  = config.get('BACKEND_URL',  'https://backend-production-3a7a.up.railway.app');
    this.callbackUrl  = backendUrl + '/gmail/connect/callback';

    // GMAIL_ENCRYPT_KEY must be 64 hex chars (32 bytes)
    const keyHex = config.get<string>('GMAIL_ENCRYPT_KEY', '');
    if (keyHex && keyHex.length === 64) {
      this.encryptKey = Buffer.from(keyHex, 'hex');
    } else {
      // Fallback for dev (logged as warning): derive 32 bytes from a default string
      this.encryptKey = Buffer.from('gmail-encrypt-key-default-dev-!@'.padEnd(32).slice(0, 32));
    }
    this.stateSecret = config.get('GMAIL_STATE_SECRET', 'gmail-state-secret-default');
  }

  // ── Build OAuth2 client ───────────────────────────────────────────────────
  private makeOAuth2(accessToken?: string, refreshToken?: string, expiry?: number | null) {
    const clientId     = this.config.get<string>('GOOGLE_CLIENT_ID',     '');
    const clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET', '');
    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException('Gmail 功能尚未設定，請聯繫管理員（需設定 GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET）');
    }
    const client = new google.auth.OAuth2(clientId, clientSecret, this.callbackUrl);
    if (accessToken) {
      client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry_date: expiry ?? undefined,
      });
    }
    return client;
  }

  // ── State param: userId signed with HMAC ──────────────────────────────────
  makeState(userId: string): string {
    const sig = createHmac('sha256', this.stateSecret)
      .update(userId)
      .digest('hex')
      .slice(0, 16);
    return Buffer.from(`${userId}:${sig}`).toString('base64url');
  }

  private verifyState(state: string): string {
    let decoded: string;
    try { decoded = Buffer.from(state, 'base64url').toString('utf8'); }
    catch { throw new ForbiddenException('Invalid OAuth state'); }
    const colonIdx = decoded.lastIndexOf(':');
    if (colonIdx < 0) throw new ForbiddenException('Invalid OAuth state');
    const userId = decoded.slice(0, colonIdx);
    const sig    = decoded.slice(colonIdx + 1);
    const expected = createHmac('sha256', this.stateSecret)
      .update(userId)
      .digest('hex')
      .slice(0, 16);
    if (sig !== expected) throw new ForbiddenException('Invalid OAuth state');
    return userId;
  }

  // ── Step 1: Generate Google OAuth URL ────────────────────────────────────
  getAuthUrl(userId: string): string {
    const oauth2 = this.makeOAuth2();
    return oauth2.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',  // always show consent to ensure refresh_token is issued
      scope: ['https://www.googleapis.com/auth/gmail.readonly'],
      state: this.makeState(userId),
    });
  }

  // ── Step 2: Handle Google OAuth callback ─────────────────────────────────
  async handleCallback(code: string, state: string): Promise<string> {
    const userId = this.verifyState(state);
    const oauth2 = this.makeOAuth2();

    let tokens: any;
    try {
      const res = await oauth2.getToken(code);
      tokens = res.tokens;
    } catch (e: any) {
      return `${this.frontendUrl}/invoices?gmail=error&reason=token_exchange`;
    }

    if (!tokens.access_token) {
      return `${this.frontendUrl}/invoices?gmail=error&reason=no_access_token`;
    }

    // If no refresh_token, try to keep existing one
    let encryptedRefreshToken = '';
    if (tokens.refresh_token) {
      encryptedRefreshToken = encrypt(tokens.refresh_token, this.encryptKey);
    } else {
      const existing = await this.prisma.gmailBinding.findUnique({ where: { userId } });
      if (!existing?.encryptedRefreshToken) {
        return `${this.frontendUrl}/invoices?gmail=error&reason=no_refresh_token`;
      }
      encryptedRefreshToken = existing.encryptedRefreshToken;
    }

    // Fetch Google account email
    oauth2.setCredentials(tokens);
    let googleEmail = '';
    try {
      const gmail = google.gmail({ version: 'v1', auth: oauth2 });
      const profile = await gmail.users.getProfile({ userId: 'me' });
      googleEmail = profile.data.emailAddress ?? '';
    } catch {
      googleEmail = 'unknown@gmail.com';
    }

    const upsertData = {
      userId,
      googleEmail,
      encryptedAccessToken: encrypt(tokens.access_token, this.encryptKey),
      encryptedRefreshToken,
      tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    };

    await this.prisma.gmailBinding.upsert({
      where:  { userId },
      create: upsertData,
      update: {
        googleEmail:             upsertData.googleEmail,
        encryptedAccessToken:    upsertData.encryptedAccessToken,
        encryptedRefreshToken:   upsertData.encryptedRefreshToken,
        tokenExpiry:             upsertData.tokenExpiry,
      },
    });

    return `${this.frontendUrl}/invoices?gmail=connected`;
  }

  // ── Get binding status ────────────────────────────────────────────────────
  async getStatus(userId: string) {
    const b = await this.prisma.gmailBinding.findUnique({ where: { userId } });
    if (!b) return { connected: false };
    return {
      connected: true,
      googleEmail: b.googleEmail,
      lastSyncedAt: b.lastSyncedAt,
    };
  }

  // ── Manual sync: fetch Gmail → parse invoices → write DB ─────────────────
  async syncInvoices(userId: string) {
    const binding = await this.prisma.gmailBinding.findUnique({ where: { userId } });
    if (!binding) throw new BadRequestException('尚未連接 Gmail，請先連接');

    // Rate limit: 60 s between manual syncs
    if (binding.lastSyncedAt) {
      const elapsed = (Date.now() - binding.lastSyncedAt.getTime()) / 1000;
      if (elapsed < 60) {
        throw new BadRequestException(`請等待 ${Math.ceil(60 - elapsed)} 秒後再同步`);
      }
    }

    const accessToken  = decrypt(binding.encryptedAccessToken,  this.encryptKey);
    const refreshToken = decrypt(binding.encryptedRefreshToken, this.encryptKey);

    const oauth2 = this.makeOAuth2(accessToken, refreshToken, binding.tokenExpiry?.getTime());

    // Save refreshed tokens automatically
    oauth2.on('tokens', async (t) => {
      const upd: Record<string, any> = {};
      if (t.access_token)  upd.encryptedAccessToken  = encrypt(t.access_token,  this.encryptKey);
      if (t.refresh_token) upd.encryptedRefreshToken = encrypt(t.refresh_token, this.encryptKey);
      if (t.expiry_date)   upd.tokenExpiry = new Date(t.expiry_date);
      if (Object.keys(upd).length) {
        await this.prisma.gmailBinding.update({ where: { userId }, data: upd }).catch(() => {});
      }
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2 });

    // Build incremental date filter
    const afterDate = binding.lastSyncedAt
      ? new Date(binding.lastSyncedAt.getTime() - 24 * 3600 * 1000)  // 1-day overlap
      : new Date(Date.now() - 90 * 24 * 3600 * 1000);                 // first sync: 90 days
    const afterStr = [
      afterDate.getFullYear(),
      String(afterDate.getMonth() + 1).padStart(2, '0'),
      String(afterDate.getDate()).padStart(2, '0'),
    ].join('/');
    const query = `(${GMAIL_QUERY_TERMS}) after:${afterStr}`;

    // Fetch message list (max 100)
    let messages: { id?: string | null; threadId?: string | null }[] = [];
    try {
      const listRes = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 100,
      });
      messages = listRes.data.messages ?? [];
    } catch (e: any) {
      if (e.code === 401 || e.status === 401) {
        throw new BadRequestException('Gmail 授權已失效，請重新連接');
      }
      throw new BadRequestException('無法連接 Gmail，請稍後再試');
    }

    let imported = 0, duplicated = 0, failed = 0;

    for (const msg of messages) {
      if (!msg.id) continue;
      try {
        const fullMsg = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full',
        });
        const parsed = this.parseInvoiceFromMessage(fullMsg.data);
        if (!parsed) { failed++; continue; }

        // Dedup by invoiceNo (unique in DB)
        const exists = await this.prisma.invoiceRecord.findUnique({
          where: { invoiceNo: parsed.invoiceNo },
        });
        if (exists) { duplicated++; continue; }

        await this.prisma.invoiceRecord.create({
          data: {
            userId,
            invoiceNo:   parsed.invoiceNo,
            invoiceDate: parsed.invoiceDate,
            sellerName:  parsed.sellerName,
            amount:      parsed.amount,
            taxAmount:   0,
            source:      'EMAIL_IMPORT',
            rawData: {
              emailMessageId: msg.id,
              subject:        parsed.subject,
              parsedAt:       new Date().toISOString(),
            },
          },
        });
        imported++;
      } catch (e: any) {
        if (e.message?.includes('Unique constraint')) { duplicated++; }
        else { failed++; }
      }
    }

    await this.prisma.gmailBinding.update({
      where: { userId },
      data: { lastSyncedAt: new Date() },
    });

    return {
      success: true,
      imported,
      duplicated,
      failed,
      total: messages.length,
      syncedAt: new Date().toISOString(),
    };
  }

  // ── Revoke + delete binding ───────────────────────────────────────────────
  async disconnect(userId: string) {
    const binding = await this.prisma.gmailBinding.findUnique({ where: { userId } });
    if (!binding) throw new NotFoundException('尚未連接 Gmail');

    // Try to revoke with Google (best-effort)
    try {
      const at = decrypt(binding.encryptedAccessToken, this.encryptKey);
      const oauth2 = this.makeOAuth2(at);
      await oauth2.revokeCredentials();
    } catch { /* ignore */ }

    await this.prisma.gmailBinding.delete({ where: { userId } });
    return { success: true };
  }

  // ── Parse invoice number / amount / date / seller from raw Gmail message ──
  private parseInvoiceFromMessage(message: any): {
    invoiceNo: string;
    invoiceDate: Date;
    sellerName: string;
    amount: number;
    subject: string;
  } | null {
    const headers: { name: string; value: string }[] =
      message.payload?.headers ?? [];
    const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value ?? '';
    const from    = headers.find(h => h.name.toLowerCase() === 'from')?.value    ?? '';

    const body     = this.extractBody(message.payload);
    const fullText = subject + '\n' + from + '\n' + body;

    // 1. Invoice number (mandatory)
    const invMatch = fullText.match(INVOICE_NO_RE);
    if (!invMatch) return null;
    const invoiceNo = invMatch[1].replace(/[-\s]/g, '');

    // 2. Amount (mandatory)
    let amount = 0;
    for (const pat of AMOUNT_PATTERNS) {
      const m = fullText.match(pat);
      if (m) {
        const v = parseInt(m[1].replace(/,/g, ''), 10);
        if (v > 0) { amount = v; break; }
      }
    }
    if (amount <= 0) return null;

    // 3. Date (use today as fallback)
    let invoiceDate = new Date();
    for (const pat of DATE_PATTERNS) {
      const m = fullText.match(pat);
      if (m) {
        const d = new Date(+m[1], +m[2] - 1, +m[3]);
        if (!isNaN(d.getTime()) && d.getFullYear() >= 2015) { invoiceDate = d; break; }
      }
    }

    // 4. Seller name
    let sellerName = '';
    for (const pat of SELLER_PATTERNS) {
      const m = fullText.match(pat);
      if (m) { sellerName = m[1].trim(); break; }
    }
    if (!sellerName) {
      const fm = from.match(/^"?([^"<@]+)"?\s*</);
      sellerName = fm ? fm[1].trim() : from.replace(/<[^>]+>/g, '').trim();
    }
    sellerName = (sellerName || '未知商家').slice(0, 60);

    return { invoiceNo, invoiceDate, sellerName, amount, subject };
  }

  // ── Recursively decode MIME parts → plain text ───────────────────────────
  private extractBody(payload: any, depth = 0): string {
    if (depth > 6 || !payload) return '';

    // Try inline body data
    if (payload.body?.data) {
      try {
        const raw = Buffer.from(payload.body.data, 'base64url').toString('utf8');
        // Strip HTML tags for easier regex matching
        return raw.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ');
      } catch { return ''; }
    }

    if (Array.isArray(payload.parts)) {
      // Prefer text/plain, fall back to text/html
      const plain = payload.parts.find((p: any) => p.mimeType === 'text/plain');
      const html  = payload.parts.find((p: any) => p.mimeType === 'text/html');
      if (plain) return this.extractBody(plain, depth + 1);
      if (html)  return this.extractBody(html,  depth + 1);
      return payload.parts.map((p: any) => this.extractBody(p, depth + 1)).join('\n');
    }
    return '';
  }
}
