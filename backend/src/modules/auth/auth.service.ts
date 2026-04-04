import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(data: { email: string; password: string; name: string; companyName?: string; taxId?: string }) {
    const exists = await this.prisma.appUser.findUnique({ where: { email: data.email } });
    if (exists) throw new ConflictException('此 Email 已被使用');
    const password = await bcrypt.hash(data.password, 12);
    const user = await this.prisma.appUser.create({
      data: { ...data, password },
      select: { id: true, email: true, name: true, mode: true, companyName: true, taxId: true },
    });
    const token = this.jwt.sign({ userId: user.id, email: user.email });
    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.appUser.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('帳號或密碼錯誤');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('帳號或密碼錯誤');
    const token = this.jwt.sign({ userId: user.id, email: user.email });
    const { password: _, ...safe } = user;
    return { user: safe, token };
  }

  async me(userId: string) {
    const user = await this.prisma.appUser.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, mode: true, companyName: true, taxId: true, phone: true, invoiceQuota: true, createdAt: true },
    });
    return user;
  }

  async switchMode(userId: string, mode: 'PERSONAL' | 'BUSINESS') {
    return this.prisma.appUser.update({
      where: { id: userId },
      data: { mode },
      select: { id: true, mode: true },
    });
  }

  async updateProfile(userId: string, data: { name?: string; companyName?: string; taxId?: string; phone?: string; invoiceQuota?: number }) {
    return this.prisma.appUser.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, mode: true, companyName: true, taxId: true, phone: true, invoiceQuota: true },
    });
  }
}
