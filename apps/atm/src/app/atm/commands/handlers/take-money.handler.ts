import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Atm } from '../../atm';
import { AtmRepository } from '../../atm.repository.interface';
import { TakeMoneyCommand } from '../impl/take-money.command';

@CommandHandler(TakeMoneyCommand)
export class TakeMoneyHandler implements ICommandHandler<TakeMoneyCommand, void> {
  constructor(
    private readonly atm: Atm,
    @Inject(AtmRepository) private readonly atmRepository: AtmRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({ amount }: TakeMoneyCommand) {
    const atm = this.eventPublisher.mergeObjectContext(this.atm);
    atm.takeMoney(amount);
    await this.atmRepository.save(atm);
    atm.commit();
  }
}
