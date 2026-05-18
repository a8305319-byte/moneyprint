import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

export type UserRole =
  | 'BOSS' | 'MANAGER' | 'SENIOR_ACCT' | 'ACCT' | 'ASSISTANT' | 'INTERN' | 'READONLY' | 'ADMIN';

interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  private readonly users: MockUser[] = [
    { id: 'E001', name: '林國棟', email: 'boss@firm.com', password: 'password123', role: 'BOSS' },
    { id: 'E002', name: '張淑芬', email: 'manager@firm.com', password: 'password123', role: 'MANAGER' },
    { id: 'E003', name: '陳美玲', email: 'senior@firm.com', password: 'password123', role: 'SENIOR_ACCT' },
    { id: 'E004', name: '王志明', email: 'acct@firm.com', password: 'password123', role: 'ACCT' },
    { id: 'E005', name: '黃曉玲', email: 'assistant@firm.com', password: 'password123', role: 'ASSISTANT' },
  ];

  constructor(private readonly jwtService: JwtService) {}

  login(loginDto: LoginDto) {
    const user = this.users.find(
      (u) => u.email === loginDto.email && u.password === loginDto.password,
    );
    if (!user) throw new UnauthorizedException('帳號或密碼錯誤');

    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    const token = this.jwtService.sign(payload);
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }

  validateUserByPayload(payload: { sub: string; email: string; role: UserRole; name: string }) {
    return { id: payload.sub, email: payload.email, role: payload.role, name: payload.name };
  }
}
