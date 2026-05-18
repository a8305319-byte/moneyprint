import { IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  recipientId: string;

  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  caseId?: string;
}
