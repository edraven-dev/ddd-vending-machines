import { MikroORM } from '@mikro-orm/core';
import { CreateRequestContext, Transactional } from '@mikro-orm/decorators/legacy';
import { ConflictException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Money } from '@vending-machines/shared';
import { AtmFactory } from '../../atm.factory';
import { AtmRepository } from '../../atm.repository.interface';
import { CreateAtmCommand } from '../impl/create-atm.command';

@CommandHandler(CreateAtmCommand)
export class CreateAtmHandler implements ICommandHandler<CreateAtmCommand, void> {
  constructor(
    private readonly orm: MikroORM, // MikroORM needed for @CreateRequestContext() and @Transactional()
    private readonly atmFactory: AtmFactory,
    private readonly atmRepository: AtmRepository,
  ) {}

  @CreateRequestContext()
  @Transactional()
  async execute({ id }: CreateAtmCommand) {
    if (await this.atmRepository.exists(id)) {
      throw new ConflictException(`Atm with id ${id.value} already exists`);
    }

    const atm = this.atmFactory.create(id);
    atm.loadMoney(new Money(100, 100, 100, 100, 100, 100));
    await this.atmRepository.save(atm);
    await atm.commit();
  }
}
