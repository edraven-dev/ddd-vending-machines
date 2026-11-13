import { MikroORM } from '@mikro-orm/core';
import { CreateRequestContext } from '@mikro-orm/decorators/legacy';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { type Id, Money } from '@vending-machines/shared';
import { AtmRepository } from './atm.repository.interface';

@Injectable()
export class AtmService {
  constructor(
    private readonly orm: MikroORM, // MikroORM needed for @CreateRequestContext()
    private readonly atmRepository: AtmRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  @CreateRequestContext()
  async loadMoney(id: Id, money: Money): Promise<void> {
    const existingAtm = await this.atmRepository.findOne(id);
    if (!existingAtm) {
      throw new NotFoundException(`Atm with id ${id.value} not found`);
    }

    const atm = this.eventPublisher.mergeObjectContext(existingAtm);
    atm.loadMoney(money);
    await this.atmRepository.save(atm);
    await atm.commit();
  }
}
