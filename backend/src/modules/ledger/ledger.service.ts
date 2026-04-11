import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as iconv from 'iconv-lite';

// ── CSV 編碼偵測 (UTF-8 BOM / UTF-8 / Big5) ─────────────────────────────────
function decodeBuffer(buf: Buffer): string {
  if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) return buf.slice(3).toString('utf8');
  const utf8 = buf.toString('utf8');
  if (!utf8.includes('\uFFFD')) return utf8;
  return iconv.decode(buf, 'big5');
}

// ── CSV row 解析（支援帶引號欄位）──────────────────────────────────────────
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      fields.push(cur.trim()); cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur.trim());
  return fields;
}

// ── 日期解析：YYYY/MM/DD, YYYY-MM-DD, YYY/MM/DD（民國）, YYYYMMDD ──────────
function parseDate(s: string): Date | null {
  const clean = s.trim().replace(/[　\s]/g, '');
  let m: RegExpMatchArray | null;
  // YYYYMMDD
  if (/^\d{8}$/.test(clean)) {
    const y = +clean.slice(0,4), mo = +clean.slice(4,6)-1, d = +clean.slice(6,8);
    const dt = new Date(y, mo, d);
    return isNaN(dt.getTime()) ? null : dt;
  }
  // YYY/MM/DD or YYY-MM-DD (ROC)
  m = clean.match(/^(\d{2,3})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (m) {
    let y = +m[1], mo = +m[2]-1, d = +m[3];
    if (y < 1900) y += 1911;
    const dt = new Date(y, mo, d);
    return isNaN(dt.getTime()) ? null : dt;
  }
  // YYYY/MM/DD or YYYY-MM-DD
  m = clean.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (m) {
    const dt = new Date(+m[1], +m[2]-1, +m[3]);
    return isNaN(dt.getTime()) ? null : dt;
  }
  return null;
}

// ── 金額解析：移除逗號、括號負數 ─────────────────────────────────────────────
function parseAmount(s: string): number {
  const clean = s.replace(/,/g, '').replace(/[,，\s]/g, '').trim();
  if (!clean || clean === '-' || clean === '--') return 0;
  // (1234.56) → negative
  const neg = clean.startsWith('(') && clean.endsWith(')');
  const num = parseFloat(clean.replace(/[()]/g, ''));
  return isNaN(num) ? 0 : Math.abs(num) * (neg ? -1 : 1);
}

// ── 欄位標題偵測 ─────────────────────────────────────────────────────────────
const DATE_HDRS  = ['日期','交易日期','記帳日期','交易日','入帳日','value date','date','交易時間','消費日期'];
const DEBIT_HDRS = ['支出','支出金額','借方金額','借方','debit','提款','扣款','提出金額','提出','支付金額','出帳','扣帳'];
const CREDIT_HDRS= ['收入','收入金額','貸方金額','貸方','credit','存款','匯入','存入金額','存入','入帳金額','收款'];
const AMT_HDRS   = ['金額','交易金額','amount','交易後餘額','本期金額'];
const DESC_HDRS  = ['摘要','說明','備註','交易說明','交易摘要','項目','description','備忘','交易類型','交易內容'];

function findCol(headers: string[], candidates: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].toLowerCase().replace(/\s/g,'');
    if (candidates.some(c => h.includes(c.toLowerCase()))) return i;
  }
  return -1;
}

// ── 類別自動對應 ─────────────────────────────────────────────────────────────
const CATEGORY_RULES: Array<{ pattern: RegExp; name: string; icon: string }> = [
  { pattern: /ATM|自動提款|提款機/i,                    name: '提款',  icon: '🏧' },
  { pattern: /POS|刷卡|消費|購物|超商|便利/i,            name: '消費',  icon: '🛍' },
  { pattern: /轉帳|匯款|TRANSFER|薪資|工資|salary/i,     name: '轉帳',  icon: '🔄' },
  { pattern: /餐|飲|咖啡|food|飯|麵|breakfast|lunch/i,  name: '餐飲',  icon: '🍱' },
  { pattern: /交通|捷運|公車|停車|加油|uber/i,           name: '交通',  icon: '🚇' },
];
function mapCategory(desc: string): { name: string; icon: string } {
  for (const r of CATEGORY_RULES) {
    if (r.pattern.test(desc)) return { name: r.name, icon: r.icon };
  }
  return { name: '其他', icon: '📋' };
}

function parseMonth(month?: string): { gte: Date; lt: Date } | undefined {
  if (!month) return undefined;
  if (!/^\d{4}-\d{2}$/.test(month)) throw new BadRequestException('月份格式必須為 YYYY-MM');
  const [y, m] = month.split('-').map(Number);
  if (m < 1 || m > 12) throw new BadRequestException('月份必須介於 01-12');
  return { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
}

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, month?: string, search?: string, direction?: string) {
    const txDate = parseMonth(month);
    const where: any = { userId };
    if (txDate) where.txDate = txDate;
    if (direction === 'DEBIT' || direction === 'CREDIT') where.direction = direction;
    if (search && search.trim()) {
      where.description = { contains: search.trim(), mode: 'insensitive' };
    }
    const data = await this.prisma.ledgerTransaction.findMany({
      where,
      include: { category: true },
      orderBy: { txDate: 'desc' },
      take: 200,
    });
    return { data };
  }

  async create(userId: string, body: {
    description: string;
    amount: number;
    direction: 'DEBIT' | 'CREDIT';
    categoryName?: string;
    txDate?: string;
  }) {
    const { description, amount, direction, categoryName, txDate } = body;

    if (!description || !description.trim()) throw new BadRequestException('請填寫說明');
    if (!amount || amount <= 0) throw new BadRequestException('金額必須大於 0');

    // Find or create category
    let categoryId: string | undefined;
    if (categoryName && categoryName.trim()) {
      const name = categoryName.trim();
      const existing = await this.prisma.category.findFirst({ where: { userId, name } });
      if (existing) {
        categoryId = existing.id;
      } else {
        const ICONS: Record<string, string> = {
          餐飲: '🍱', 交通: '🚇', 購物: '🛍', 娛樂: '🎬',
          通訊: '📱', 薪資: '💰', 其他: '📋',
        };
        const created = await this.prisma.category.create({
          data: { userId, name, icon: ICONS[name] ?? '📋' },
        });
        categoryId = created.id;
      }
    }

    const date = txDate ? new Date(txDate) : new Date();

    const tx = await this.prisma.ledgerTransaction.create({
      data: {
        userId,
        source: 'MANUAL',
        status: 'CATEGORIZED',
        txDate: date,
        amount,
        direction,
        description: description.trim(),
        categoryId,
      },
      include: { category: true },
    });

    // Month summary
    const monthRange = parseMonth(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    )!;
    const monthTxs = await this.prisma.ledgerTransaction.findMany({
      where: { userId, txDate: monthRange },
    });
    const monthExpense = monthTxs.filter(t => t.direction === 'DEBIT').reduce((s, t) => s + Number(t.amount), 0);

    // Today summary
    const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayEnd   = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const todayTxs = await this.prisma.ledgerTransaction.findMany({
      where: { userId, txDate: { gte: todayStart, lt: todayEnd } },
    });
    const todayExpense = todayTxs.filter(t => t.direction === 'DEBIT').reduce((s, t) => s + Number(t.amount), 0);

    return {
      transaction: tx,
      todaySummary:  { totalExpense: todayExpense, txCount: todayTxs.length },
      monthSummary:  { totalExpense: monthExpense, txCount: monthTxs.length },
    };
  }

  // ── 編輯單筆交易 ──────────────────────────────────────────────────────────
  async update(userId: string, id: string, body: {
    description?: string;
    amount?: number;
    direction?: 'DEBIT' | 'CREDIT';
    categoryName?: string;
    txDate?: string;
  }) {
    const existing = await this.prisma.ledgerTransaction.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('找不到此交易記錄');

    const update: any = {};
    if (body.description !== undefined) {
      if (!body.description.trim()) throw new BadRequestException('說明不可為空');
      update.description = body.description.trim();
    }
    if (body.amount !== undefined) {
      if (body.amount <= 0) throw new BadRequestException('金額必須大於 0');
      update.amount = body.amount;
    }
    if (body.direction !== undefined) update.direction = body.direction;
    if (body.txDate !== undefined) update.txDate = new Date(body.txDate);

    if (body.categoryName !== undefined) {
      if (body.categoryName.trim()) {
        const name = body.categoryName.trim();
        const ICONS: Record<string, string> = {
          餐飲: '🍱', 交通: '🚇', 購物: '🛍', 娛樂: '🎬',
          通訊: '📱', 薪資: '💰', 其他: '📋',
        };
        let cat = await this.prisma.category.findFirst({ where: { userId, name } });
        if (!cat) cat = await this.prisma.category.create({ data: { userId, name, icon: ICONS[name] ?? '📋' } });
        update.categoryId = cat.id;
      } else {
        update.categoryId = null;
      }
    }

    const tx = await this.prisma.ledgerTransaction.update({
      where: { id },
      data: update,
      include: { category: true },
    });
    return { transaction: tx };
  }

  // ── 刪除單筆交易（owner check）──────────────────────────────────────────
  async delete(userId: string, id: string) {
    const existing = await this.prisma.ledgerTransaction.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('找不到此交易記錄');
    await this.prisma.ledgerTransaction.delete({ where: { id } });
    return { data: { success: true } };
  }

  // ── 銀行 CSV 匯入 ─────────────────────────────────────────────────────────
  async importBankCsv(
    userId: string, buffer: Buffer,
  ): Promise<{ success: boolean; imported: number; duplicated: number; failed: number }> {

    // 1. 解碼
    const text = decodeBuffer(buffer);
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) throw new BadRequestException('CSV 檔案內容不足，請確認格式');

    // 2. 找標題列（前 15 行內）
    let headerIdx = -1;
    let dateCol = -1, debitCol = -1, creditCol = -1, amtCol = -1, descCol = -1;
    const scanEnd = Math.min(15, lines.length);
    for (let i = 0; i < scanEnd; i++) {
      const fields = parseCsvLine(lines[i]);
      const lower  = fields.map(f => f.toLowerCase().replace(/\s/g,''));
      const dIdx = findCol(fields, DATE_HDRS);
      const desc = findCol(fields, DESC_HDRS);
      // 標題列必須有日期欄 + 至少一個金額欄
      const hasAmt = findCol(fields, DEBIT_HDRS) >= 0
                  || findCol(fields, CREDIT_HDRS) >= 0
                  || findCol(fields, AMT_HDRS) >= 0;
      if (dIdx >= 0 && (hasAmt || lower.length >= 3)) {
        headerIdx = i;
        dateCol  = dIdx;
        debitCol = findCol(fields, DEBIT_HDRS);
        creditCol= findCol(fields, CREDIT_HDRS);
        amtCol   = findCol(fields, AMT_HDRS);
        descCol  = desc >= 0 ? desc : (debitCol >= 0 ? debitCol - 1 : amtCol - 1);
        descCol  = Math.max(descCol, 0);
        break;
      }
    }
    if (headerIdx === -1) throw new BadRequestException('找不到有效欄位（需包含日期、支出/收入等標題）');

    // 3. 確保類別存在（批次 upsert）
    const catMap = new Map<string, string>();
    const catDefs = [
      { name: '提款', icon: '🏧' }, { name: '消費', icon: '🛍' },
      { name: '轉帳', icon: '🔄' }, { name: '餐飲', icon: '🍱' },
      { name: '交通', icon: '🚇' }, { name: '其他', icon: '📋' },
    ];
    for (const { name, icon } of catDefs) {
      let cat = await this.prisma.category.findFirst({ where: { userId, name } });
      if (!cat) cat = await this.prisma.category.create({ data: { userId, name, icon } });
      catMap.set(name, cat.id);
    }

    // 4. 逐行處理
    let imported = 0, duplicated = 0, failed = 0;

    for (let i = headerIdx + 1; i < lines.length; i++) {
      try {
        const fields = parseCsvLine(lines[i]);
        if (fields.every(f => !f)) continue; // 空行

        // --- 日期 ---
        const rawDate = fields[dateCol] ?? '';
        const txDate  = parseDate(rawDate);
        if (!txDate) { failed++; continue; }

        // --- 金額 & 方向 ---
        let amount = 0;
        let direction: 'DEBIT' | 'CREDIT' = 'DEBIT';

        if (debitCol >= 0 && creditCol >= 0) {
          const debit  = parseAmount(fields[debitCol]  ?? '');
          const credit = parseAmount(fields[creditCol] ?? '');
          if (debit > 0)       { amount = debit;  direction = 'DEBIT';  }
          else if (credit > 0) { amount = credit; direction = 'CREDIT'; }
          else { failed++; continue; }
        } else if (amtCol >= 0) {
          const rawStr = (fields[amtCol] ?? '').trim();
          const isNeg = rawStr.startsWith('-') || (rawStr.startsWith('(') && rawStr.endsWith(')'));
          const raw = parseAmount(rawStr);
          if (raw === 0) { failed++; continue; }
          amount    = raw;
          direction = isNeg ? 'DEBIT' : 'CREDIT';
        } else if (debitCol >= 0) {
          amount    = parseAmount(fields[debitCol] ?? '');
          direction = 'DEBIT';
          if (amount <= 0) { failed++; continue; }
        } else if (creditCol >= 0) {
          amount    = parseAmount(fields[creditCol] ?? '');
          direction = 'CREDIT';
          if (amount <= 0) { failed++; continue; }
        } else { failed++; continue; }

        // --- 摘要 ---
        const description = (fields[descCol] ?? '銀行匯入').replace(/"/g,'').trim() || '銀行匯入';

        // --- 類別 ---
        const { name: catName } = mapCategory(description);
        const categoryId = catMap.get(catName) ?? catMap.get('其他')!;

        // --- 去重（同 user + 同日 + 同金額 + 同方向 + 同摘要）---
        const dayStart = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());
        const dayEnd   = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate() + 1);
        const dup = await this.prisma.ledgerTransaction.findFirst({
          where: {
            userId, direction, description,
            txDate: { gte: dayStart, lt: dayEnd },
            amount: { equals: amount as any },
          },
        });
        if (dup) { duplicated++; continue; }

        await this.prisma.ledgerTransaction.create({
          data: { userId, source: 'BANK_IMPORT', status: 'PENDING',
                  txDate, amount, direction, description, categoryId },
        });
        imported++;
      } catch {
        failed++;
      }
    }

    return { success: true, imported, duplicated, failed };
  }

}
