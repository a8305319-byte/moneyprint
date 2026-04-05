import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email 格式不正確' })
  @IsNotEmpty({ message: 'Email 不可為空' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '密碼不可為空' })
  password: string;
}
