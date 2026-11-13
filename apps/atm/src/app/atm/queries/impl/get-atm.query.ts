import { Query } from '@nestjs/cqrs';
import type { Id } from '@vending-machines/shared';
import type { AtmDto } from '../../dto/atm.dto';

export class GetAtmQuery extends Query<AtmDto> {
  constructor(public readonly id: Id) {
    super();
  }
}
