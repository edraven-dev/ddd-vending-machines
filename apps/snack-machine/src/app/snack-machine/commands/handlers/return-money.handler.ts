import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SnackMachine } from '../../snack-machine';
import { ReturnMoneyCommand } from '../impl/return-money.command';

@CommandHandler(ReturnMoneyCommand)
export class ReturnMoneyHandler implements ICommandHandler<ReturnMoneyCommand, void> {
  constructor(private readonly snackMachine: SnackMachine) {}

  async execute() {
    this.snackMachine.returnMoney();
  }
}
