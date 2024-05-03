import { NotFoundException } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { AtmRepository } from '../../atm.repository.interface';
import { TakeMoneyCommand } from '../impl/take-money.command';

@CommandHandler(TakeMoneyCommand)
export class TakeMoneyHandler implements ICommandHandler<TakeMoneyCommand, void> {
  constructor(
    private readonly atmRepository: AtmRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({ id, amount }: TakeMoneyCommand) {
    const existingAtm = await this.atmRepository.findOne(id);
    if (!existingAtm) {
      throw new NotFoundException(`Atm with id ${id} not found`);
    }

    const atm = this.eventPublisher.mergeObjectContext(existingAtm);
    atm.takeMoney(amount);
    await this.atmRepository.save(atm);
    atm.commit();
  }
}
