import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SnackMachine } from '../../snack-machine';
import { InsertMoneyCommand } from '../impl/insert-money.command';

@CommandHandler(InsertMoneyCommand)
export class InsertMoneyHandler implements ICommandHandler<InsertMoneyCommand, void> {
  constructor(private readonly snackMachine: SnackMachine) {}

  async execute({ money }: InsertMoneyCommand) {
    this.snackMachine.insertMoney(money);
  }
}
