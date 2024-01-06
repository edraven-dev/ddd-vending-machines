import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class BuySnackDto {
  @ApiProperty({ type: Number, minimum: 1, maximum: 3, example: 1 })
  @IsInt()
  @Min(1)
  @Max(3)
  readonly position!: number;
}
