import { IsUUID } from 'class-validator';

export class CreateAtmDto {
  @IsUUID('4')
  readonly id!: string;
}
