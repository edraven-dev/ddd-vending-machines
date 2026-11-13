import { Query } from '@nestjs/cqrs';
import type { Id } from '@vending-machines/shared';
import type { MoneyInMachineDto } from '../../dto/money-in-machine.dto';

export class GetMoneyInMachineQuery extends Query<MoneyInMachineDto> {
  constructor(public readonly id: Id) {
    super();
  }
}
