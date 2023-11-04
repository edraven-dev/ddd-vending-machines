import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Atm } from '../../atm';
import { AtmRepository } from '../../atm.repository.interface';
import { LoadMoneyCommand } from '../impl/load-money.command';

@CommandHandler(LoadMoneyCommand)
export class LoadMoneyHandler implements ICommandHandler<LoadMoneyCommand, void> {
  constructor(
    private readonly atm: Atm,
    @Inject(AtmRepository) private readonly atmRepository: AtmRepository,
  ) {}

  async execute({ money }: LoadMoneyCommand) {
    this.atm.loadMoney(money);
    await this.atmRepository.save(this.atm);
  }
}
