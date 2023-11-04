import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MoneyInMachineDto } from '../../dto/money-in-machine.dto';
import { SnackMachine } from '../../snack-machine';
import { GetMoneyInMachineQuery } from '../impl/get-money-in-machine.query';

@QueryHandler(GetMoneyInMachineQuery)
export class GetMoneyInMachineHandler implements IQueryHandler<GetMoneyInMachineQuery, MoneyInMachineDto> {
  constructor(private readonly snackMachine: SnackMachine) {}

  async execute() {
    return new MoneyInMachineDto(this.snackMachine.moneyInTransaction, this.snackMachine.moneyInside.amount);
  }
}
