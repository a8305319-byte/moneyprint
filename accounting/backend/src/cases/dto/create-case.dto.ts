import { IsOptional, IsString } from 'class-validator';

export class CreateCaseDto {
  @IsString()
  clientId: string;

  @IsString()
  clientName: string;

  @IsString()
  type: string;

  @IsString()
  month: string;

  @IsOptional()
  @IsString()
  owner?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsString()
  lastModifiedBy: string;
}
