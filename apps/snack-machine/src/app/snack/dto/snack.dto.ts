import { ApiProperty } from '@nestjs/swagger';

export class SnackDto {
  @ApiProperty({ type: String, format: 'uuid' })
  readonly id!: string;

  @ApiProperty({ type: String })
  readonly name!: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
