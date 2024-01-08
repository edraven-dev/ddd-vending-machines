import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class LoadSnacksDto {
  @ApiProperty({ type: Number, minimum: 1, maximum: 3, example: 1 })
  @IsInt()
  @Min(1)
  @Max(3)
  readonly position!: number;

  @ApiProperty({ type: Number, minimum: 1, maximum: 20, example: 10 })
  @IsInt()
  @Min(1)
  @Max(20)
  readonly quantity!: number;
}
