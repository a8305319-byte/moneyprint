import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  clientId: string;

  @IsString()
  clientName: string;

  @IsString()
  month: string;

  @IsNumber()
  amount: number;

  @IsString()
  dueDate: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsString()
  lastModifiedBy: string;
}
