import { IsInt } from 'class-validator';

export class BuySnackDto {
  @IsInt()
  readonly position: number;
}
