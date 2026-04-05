import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email 格式不正確' })
  @IsNotEmpty({ message: 'Email 不可為空' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '密碼不可為空' })
  @MinLength(6, { message: '密碼至少 6 個字元' })
  @MaxLength(100)
  password: string;

  @IsString()
  @IsNotEmpty({ message: '姓名不可為空' })
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  taxId?: string;
}
