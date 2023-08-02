import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SnackMachine } from '../../snack-machine';
import { BuySnackCommand } from '../impl/buy-snack.command';

@CommandHandler(BuySnackCommand)
export class BuySnackHandler implements ICommandHandler<BuySnackCommand, void> {
  constructor(private readonly snackMachine: SnackMachine) {}

  async execute() {
    this.snackMachine.buySnack();
  }
}
