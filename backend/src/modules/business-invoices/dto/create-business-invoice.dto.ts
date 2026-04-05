import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBusinessInvoiceDto {
  @IsIn(['RECEIVED', 'ISSUED'], { message: '方向必須是 RECEIVED 或 ISSUED' })
  direction: 'RECEIVED' | 'ISSUED';

  @IsOptional()
  @IsIn(['ELECTRONIC', 'PAPER', 'RECEIPT', 'CLOUD', 'UNIFORM'])
  format?: string;

  @IsString()
  @IsNotEmpty({ message: '發票號碼不可為空' })
  @MaxLength(20)
  invoiceNo: string;

  @IsString()
  @IsNotEmpty({ message: '發票日期不可為空' })
  invoiceDate: string;

  @IsString()
  @IsNotEmpty({ message: '交易對象不可為空' })
  @MaxLength(100)
  counterpartyName: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  counterpartyTaxId?: string;

  @Type(() => Number)
  @IsNumber({}, { message: '金額必須是數字' })
  @Min(1, { message: '金額必須大於 0' })
  @Max(99999999, { message: '金額超過上限' })
  amount: number;

  @IsOptional()
  @IsIn(['TAXABLE', 'ZERO_RATE', 'EXEMPT'])
  taxType?: 'TAXABLE' | 'ZERO_RATE' | 'EXEMPT';

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
