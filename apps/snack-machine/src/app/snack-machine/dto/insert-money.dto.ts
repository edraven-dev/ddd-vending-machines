import { ApiProperty } from '@nestjs/swagger';
import { CoinsAndNotes } from '@vending-machines/shared';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsInt } from 'class-validator';

export class InsertMoneyDto {
  @ApiProperty({ type: Number, isArray: true, minLength: 6, maxLength: 6, example: [0, 0, 0, 0, 0, 1] })
  @IsInt({ each: true })
  @IsIn([0, 1], { each: true })
  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  readonly money!: CoinsAndNotes;
}
