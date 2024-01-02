import { IsUUID } from 'class-validator';

export class CreateHeadOfficeDto {
  @IsUUID('4')
  readonly id!: string;
}
