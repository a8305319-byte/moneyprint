import { IsOptional, IsString } from 'class-validator';

export class UpdateCaseStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  rejectReason?: string;

  @IsString()
  lastModifiedBy: string;
}
