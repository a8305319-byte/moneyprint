import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateContractDto {
  @IsString()
  clientId: string;

  @IsString()
  clientName: string;

  @IsString()
  type: string;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsNumber()
  monthlyFee: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsString()
  lastModifiedBy: string;
}
