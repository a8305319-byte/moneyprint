import { IsOptional, IsString } from 'class-validator';

export class CreateFilingDto {
  @IsString()
  clientId: string;

  @IsString()
  clientName: string;

  @IsOptional()
  @IsString()
  caseId?: string;

  @IsString()
  type: string;

  @IsString()
  period: string;

  @IsString()
  deadline: string;

  @IsString()
  handler: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsString()
  lastModifiedBy: string;
}
