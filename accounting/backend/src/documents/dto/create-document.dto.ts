import { IsOptional, IsString } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  caseId?: string;

  @IsString()
  uploader: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsString()
  lastModifiedBy: string;
}
