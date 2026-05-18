import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSalaryDto {
  @IsString()
  employeeId: string;

  @IsString()
  employeeName: string;

  @IsString()
  month: string;

  @IsNumber()
  baseSalary: number;

  @IsOptional()
  @IsNumber()
  bonus?: number;

  @IsNumber()
  laborIns: number;

  @IsNumber()
  healthIns: number;

  @IsOptional()
  @IsNumber()
  incomeTax?: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsString()
  lastModifiedBy: string;
}
