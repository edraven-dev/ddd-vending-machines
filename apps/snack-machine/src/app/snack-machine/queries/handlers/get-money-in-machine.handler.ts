import { ICommandHandler, QueryHandler } from '@nestjs/cqrs';
import { MoneyInMachineDto } from '../../dto/money-in-machine.dto';
import { SnackMachine } from '../../snack-machine';
import { GetMoneyInMachineQuery } from '../impl/get-money-in-machine.query';

@QueryHandler(GetMoneyInMachineQuery)
export class GetMoneyInMachineHandler implements ICommandHandler<GetMoneyInMachineQuery, MoneyInMachineDto> {
  constructor(private readonly snackMachine: SnackMachine) {}

  async execute() {
    return {
      moneyInTransaction: this.snackMachine.moneyInTransaction.toDto(),
      moneyInside: this.snackMachine.moneyInside.toDto(),
    };
  }
}
