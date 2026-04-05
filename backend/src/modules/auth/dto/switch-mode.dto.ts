import { IsIn, IsNotEmpty } from 'class-validator';

export class SwitchModeDto {
  @IsNotEmpty({ message: '模式不可為空' })
  @IsIn(['PERSONAL', 'BUSINESS'], { message: '模式必須是 PERSONAL 或 BUSINESS' })
  mode: 'PERSONAL' | 'BUSINESS';
}
