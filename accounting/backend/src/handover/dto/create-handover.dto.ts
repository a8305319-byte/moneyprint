import { IsOptional, IsString } from 'class-validator';

export class CreateHandoverDto {
  @IsString()
  fromEmployee: string;

  @IsString()
  toEmployee: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  caseIds?: string[];

  @IsString()
  lastModifiedBy: string;
}
