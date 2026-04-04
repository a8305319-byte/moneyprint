import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const SYSTEM_RULES = [
  { pattern: '全家|7-11|萊爾富|OK便利', category: '餐飲食品' },
  { pattern: '麥當勞|肯德基|摩斯|subway', category: '餐飲食品' },
  { pattern: 'MRT|捷運|台鐵|高鐵|公車|uber', category: '交通' },
  { pattern: 'netflix|spotify|apple|google play', category: '訂閱服務' },
  { pattern: '電費|水費|瓦斯|網路|電信', category: '帳單' },
  { pattern: '超市|大潤發|家樂福|全聯', category: '日常購物' },
  { pattern: '診所|藥局|醫院|醫療', category: '醫療' },
];

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async classifyPending() {
    const pending = await this.prisma.ledgerTransaction.findMany({
      where: { status: 'PENDING', categoryId: null },
      take: 500,
    });

    let classified = 0;
    for (const tx of pending) {
      const categoryName = this.matchRule(tx.description);
      if (!categoryName) continue;

      let cat = await this.prisma.category.findFirst({ where: { name: categoryName, isSystem: true } });
      if (!cat) {
        cat = await this.prisma.category.create({ data: { name: categoryName, isSystem: true } });
      }

      await this.prisma.ledgerTransaction.update({
        where: { id: tx.id },
        data: { categoryId: cat.id, status: 'CATEGORIZED' },
      });
      classified++;
    }
    return { classified };
  }

  async manualSet(ledgerId: string, categoryId: string) {
    const tx = await this.prisma.ledgerTransaction.update({
      where: { id: ledgerId },
      data: { categoryId, status: 'CATEGORIZED' },
      include: { category: true },
    });

    // Learn: create a rule from this correction
    if (tx.description) {
      await this.prisma.categoryRule.upsert({
        where: { id: `learn-${ledgerId}` },
        create: { id: `learn-${ledgerId}`, categoryId, pattern: tx.description.slice(0, 20), priority: 1 },
        update: {},
      }).catch(() => {});
    }

    return tx;
  }

  private matchRule(description: string): string | null {
    const lower = description.toLowerCase();
    for (const rule of SYSTEM_RULES) {
      if (new RegExp(rule.pattern, 'i').test(lower)) return rule.category;
    }
    return null;
  }
}
