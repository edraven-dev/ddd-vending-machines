import { IsInt, Max, Min } from 'class-validator';

export class BuySnackDto {
  @IsInt()
  @Min(1)
  @Max(3)
  readonly position!: number;
}
