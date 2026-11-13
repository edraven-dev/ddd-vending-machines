import { Query } from '@nestjs/cqrs';
import type { Id } from '@vending-machines/shared';
import type { SnackMachineDto } from '../../dto/snack-machine.dto';

export class GetSnackMachineQuery extends Query<SnackMachineDto> {
  constructor(public readonly id: Id) {
    super();
  }
}
