import { Query } from '@nestjs/cqrs';
import type { Id } from '@vending-machines/shared';
import type { HeadOfficeDto } from '../../dto/head-office.dto';

export class GetHeadOfficeQuery extends Query<HeadOfficeDto> {
  constructor(public readonly id: Id) {
    super();
  }
}
