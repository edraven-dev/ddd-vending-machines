import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { UnloadMoneyDto } from '@vending-machines/shared';
import { SnackMachineRepository } from './snack-machine.repository.interface';

@Injectable()
export class SnackMachineService {
  constructor(
    private readonly orm: MikroORM,
    private readonly snackMachineRepository: SnackMachineRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  @CreateRequestContext()
  async unloadMoney(id: string): Promise<UnloadMoneyDto> {
    const snackMachine = this.eventPublisher.mergeObjectContext(await this.snackMachineRepository.findOne(id));

    if (!snackMachine) {
      throw new NotFoundException(`Snack machine with id ${id} not found`);
    }

    const money = snackMachine.unloadMoney();
    await this.snackMachineRepository.save(snackMachine);
    snackMachine.commit();

    return {
      money: [
        money.oneCentCount,
        money.tenCentCount,
        money.quarterCount,
        money.oneDollarCount,
        money.fiveDollarCount,
        money.twentyDollarCount,
      ],
    };
  }
}
