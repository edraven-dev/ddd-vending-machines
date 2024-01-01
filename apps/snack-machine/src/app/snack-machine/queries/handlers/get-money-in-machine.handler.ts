import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MoneyInMachineDto } from '../../dto/money-in-machine.dto';
import { SnackMachineRepository } from '../../snack-machine.repository.interface';
import { GetMoneyInMachineQuery } from '../impl/get-money-in-machine.query';

@QueryHandler(GetMoneyInMachineQuery)
export class GetMoneyInMachineHandler implements IQueryHandler<GetMoneyInMachineQuery, MoneyInMachineDto> {
  constructor(private readonly snackMachineRepository: SnackMachineRepository) {}

  async execute({ id }: GetMoneyInMachineQuery) {
    const snackMachine = await this.snackMachineRepository.findOne(id);

    if (!snackMachine) {
      throw new NotFoundException(`Snack machine with id ${id} not found`);
    }

    return new MoneyInMachineDto(snackMachine.moneyInTransaction, snackMachine.moneyInside.amount);
  }
}
