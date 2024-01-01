import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MoneyDto } from '@vending-machines/shared';
import { SnackDto } from '../../../snack/dto/snack.dto';
import { SlotDto } from '../../dto/slot.dto';
import { SnackMachineDto } from '../../dto/snack-machine.dto';
import { SnackPileDto } from '../../dto/snack-pile.dto';
import { SnackMachineRepository } from '../../snack-machine.repository.interface';
import { GetSnackMachineQuery } from '../impl/get-snack-machine.query';

@QueryHandler(GetSnackMachineQuery)
export class GetSnackMachineHandler implements IQueryHandler<GetSnackMachineQuery, SnackMachineDto> {
  constructor(private readonly snackMachineRepository: SnackMachineRepository) {}

  async execute({ id }: GetSnackMachineQuery) {
    const snackMachine = await this.snackMachineRepository.findOne(id);

    if (!snackMachine) {
      throw new NotFoundException(`Snack machine with id ${id} not found`);
    }

    return new SnackMachineDto(
      snackMachine.id,
      new MoneyDto(snackMachine.moneyInside.amount),
      new MoneyDto(snackMachine.moneyInTransaction),
      snackMachine.slots.map(
        (slot) =>
          new SlotDto(
            slot.id,
            slot.position,
            new SnackPileDto(
              new SnackDto(slot.snackPile.snack.id, slot.snackPile.snack.name),
              slot.snackPile.quantity,
              slot.snackPile.price.format(),
            ),
          ),
      ),
    );
  }
}
