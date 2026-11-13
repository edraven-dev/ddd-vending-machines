import { MikroORM } from '@mikro-orm/core';
import { CreateRequestContext, Transactional } from '@mikro-orm/decorators/legacy';
import { ConflictException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Money } from '@vending-machines/shared';
import Currency from 'currency.js';
import { Snack } from '../../../snack/snack';
import { SnackMachineFactory } from '../../snack-machine.factory';
import { SnackMachineRepository } from '../../snack-machine.repository.interface';
import { SnackPile } from '../../snack-pile';
import { CreateSnackMachineCommand } from '../impl/create-snack-machine.command';

@CommandHandler(CreateSnackMachineCommand)
export class CreateSnackMachineHandler implements ICommandHandler<CreateSnackMachineCommand, void> {
  constructor(
    private readonly orm: MikroORM, // MikroORM needed for @CreateRequestContext() and @Transactional()
    private readonly snackMachineFactory: SnackMachineFactory,
    private readonly snackMachineRepository: SnackMachineRepository,
  ) {}

  @CreateRequestContext()
  @Transactional()
  async execute({ id }: CreateSnackMachineCommand) {
    if (await this.snackMachineRepository.findOne(id)) {
      throw new ConflictException(`Snack machine with id ${id.value} already exists`);
    }

    const snackMachine = this.snackMachineFactory.create(id);
    snackMachine.loadSnacks(1, new SnackPile(Snack.Chocolate, 10, new Currency('5.00')));
    snackMachine.loadSnacks(2, new SnackPile(Snack.Soda, 10, new Currency('2.50')));
    snackMachine.loadSnacks(3, new SnackPile(Snack.Gum, 10, new Currency('1.00')));
    snackMachine.loadMoney(new Money(10, 10, 10, 10, 10, 10));
    await this.snackMachineRepository.save(snackMachine);
    await snackMachine.commit();
  }
}
