import { Inject, Injectable } from '@nestjs/common';
import { UnloadMoneyDto } from '@vending-machines/shared';
import { SnackMachineRepository } from './snack-machine.repository.interface';

@Injectable()
export class SnackMachineService {
  constructor(@Inject(SnackMachineRepository) private readonly snackMachineRepository: SnackMachineRepository) {}

  async unloadMoney(): Promise<UnloadMoneyDto> {
    const snackMachine = await this.snackMachineRepository.findOne();
    const money = snackMachine.unloadMoney();
    await this.snackMachineRepository.save(snackMachine);

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
