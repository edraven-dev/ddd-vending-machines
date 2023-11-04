import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt } from 'class-validator';

export class LoadMoneyDto {
  @IsInt({ each: true })
  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  readonly money!: [number, number, number, number, number, number];
}
