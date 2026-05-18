import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export enum EmployeeRole {
  BOSS = 'BOSS',
  MANAGER = 'MANAGER',
  SENIOR_ACCT = 'SENIOR_ACCT',
  ACCT = 'ACCT',
  ASSISTANT = 'ASSISTANT',
  INTERN = 'INTERN',
  READONLY = 'READONLY',
  ADMIN = 'ADMIN',
}

export class CreateEmployeeDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(EmployeeRole)
  role: EmployeeRole;

  @IsString()
  lastModifiedBy: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
