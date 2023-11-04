import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Atm } from '../../atm';
import { AtmRepository } from '../../atm.repository.interface';
import { TakeMoneyCommand } from '../impl/take-money.command';

@CommandHandler(TakeMoneyCommand)
export class TakeMoneyHandler implements ICommandHandler<TakeMoneyCommand, void> {
  constructor(
    private readonly atm: Atm,
    @Inject(AtmRepository) private readonly atmRepository: AtmRepository,
  ) {}

  async execute({ amount }: TakeMoneyCommand) {
    this.atm.takeMoney(amount);
    await this.atmRepository.save(this.atm);
  }
}
