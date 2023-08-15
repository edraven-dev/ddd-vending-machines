import { ICommandHandler, QueryHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { MoneyInMachineDto } from '../../dto/money-in-machine.dto';
import { MoneyDto } from '../../dto/money.dto';
import { SnackMachine } from '../../snack-machine';
import { GetMoneyInMachineQuery } from '../impl/get-money-in-machine.query';

@QueryHandler(GetMoneyInMachineQuery)
export class GetMoneyInMachineHandler implements ICommandHandler<GetMoneyInMachineQuery, MoneyInMachineDto> {
  constructor(private readonly snackMachine: SnackMachine) {}

  async execute() {
    return plainToInstance(MoneyInMachineDto, {
      moneyInTransaction: new MoneyDto(
        this.snackMachine.moneyInTransaction.intValue < 100
          ? `¢${this.snackMachine.moneyInTransaction.cents()}`
          : `$${this.snackMachine.moneyInTransaction}`,
      ),
      moneyInside: new MoneyDto(
        this.snackMachine.moneyInside.amount.intValue < 100
          ? `¢${this.snackMachine.moneyInside.amount.cents()}`
          : `$${this.snackMachine.moneyInside.amount}`,
      ),
    });
  }
}
