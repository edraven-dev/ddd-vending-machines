import { CoinsAndNotes } from '@vending-machines/shared';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsInt } from 'class-validator';

export class InsertMoneyDto {
  @IsInt({ each: true })
  @IsIn([0, 1], { each: true })
  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  readonly money!: CoinsAndNotes;
}
