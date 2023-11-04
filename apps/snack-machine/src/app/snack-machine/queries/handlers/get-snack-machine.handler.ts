import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MoneyDto } from '@vending-machines/shared';
import { SnackDto } from '../../../snack/dto/snack.dto';
import { SlotDto } from '../../dto/slot.dto';
import { SnackMachineDto } from '../../dto/snack-machine.dto';
import { SnackPileDto } from '../../dto/snack-pile.dto';
import { SnackMachine } from '../../snack-machine';
import { GetSnackMachineQuery } from '../impl/get-snack-machine.query';

@QueryHandler(GetSnackMachineQuery)
export class GetSnackMachineHandler implements IQueryHandler<GetSnackMachineQuery, SnackMachineDto> {
  constructor(private readonly snackMachine: SnackMachine) {}

  async execute() {
    return new SnackMachineDto(
      this.snackMachine.id,
      new MoneyDto(this.snackMachine.moneyInside.amount),
      new MoneyDto(this.snackMachine.moneyInTransaction),
      this.snackMachine.slots.map(
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
