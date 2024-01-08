import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Money } from '@vending-machines/shared';
import { AtmFactory } from '../../atm.factory';
import { AtmRepository } from '../../atm.repository.interface';
import { CreateAtmCommand } from '../impl/create-atm.command';

@CommandHandler(CreateAtmCommand)
export class CreateAtmHandler implements ICommandHandler<CreateAtmCommand, void> {
  constructor(
    private readonly atmFactory: AtmFactory,
    private readonly atmRepository: AtmRepository,
  ) {}

  async execute({ id }: CreateAtmCommand) {
    const atm = this.atmFactory.create(id);
    atm.loadMoney(new Money(100, 100, 100, 100, 100, 100));
    await this.atmRepository.save(atm);
    atm.commit();
  }
}
