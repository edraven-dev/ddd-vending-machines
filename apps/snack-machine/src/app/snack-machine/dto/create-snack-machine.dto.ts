import { IsUUID } from 'class-validator';

export class CreateSnackMachineDto {
  @IsUUID('4')
  readonly id!: string;
}
