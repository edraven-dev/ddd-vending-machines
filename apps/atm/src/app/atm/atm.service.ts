import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Money } from '@vending-machines/shared';
import { AtmRepository } from './atm.repository.interface';

@Injectable()
export class AtmService {
  constructor(
    private readonly orm: MikroORM, // MikroORM needed for @CreateRequestContext()
    private readonly atmRepository: AtmRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  @CreateRequestContext()
  async loadMoney(id: string, money: Money): Promise<void> {
    const atm = this.eventPublisher.mergeObjectContext(await this.atmRepository.findOne(id));

    if (!atm) {
      throw new NotFoundException(`Atm with id ${id} not found`);
    }

    atm.loadMoney(money);
    await this.atmRepository.save(atm);
    atm.commit();
  }
}
