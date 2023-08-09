import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Provider } from '@nestjs/common';
import { Money } from '../../snack-machine/money';
import { SnackMachine } from '../../snack-machine/snack-machine';
import { SnackMachineRepository } from '../../snack-machine/snack-machine.repository.interface';
import { SnackMachineEntity } from './snack-machine.entity';

@Injectable()
export class MikroOrmSnackMachineRepository implements SnackMachineRepository {
  constructor(
    @InjectRepository(SnackMachineEntity)
    private readonly snackMachineRepository: EntityRepository<SnackMachineEntity>,
  ) {}

  async findOne(): Promise<SnackMachine | null> {
    const snackMachineEntity = await this.snackMachineRepository.findOne({ id: { $exists: true } });
    if (!snackMachineEntity) {
      return null;
    }

    const { oneCentCount, tenCentCount, quarterCount, oneDollarCount, fiveDollarCount, twentyDollarCount } =
      snackMachineEntity.money;

    const snackMachine = new SnackMachine();
    Object.assign(snackMachine, {
      id: snackMachineEntity.id,
      moneyInside: new Money(
        oneCentCount,
        tenCentCount,
        quarterCount,
        oneDollarCount,
        fiveDollarCount,
        twentyDollarCount,
      ),
      moneyInTransaction: Money.None,
    });

    return snackMachine;
  }

  async save(snackMachine: SnackMachine): Promise<void> {
    const snackMachineEntity = await this.snackMachineRepository.findOne({ id: snackMachine.id });

    const { oneCentCount, tenCentCount, quarterCount, oneDollarCount, fiveDollarCount, twentyDollarCount } =
      snackMachine.moneyInside;

    Object.assign(snackMachineEntity, {
      id: snackMachine.id,
      money: {
        oneCentCount,
        tenCentCount,
        quarterCount,
        oneDollarCount,
        fiveDollarCount,
        twentyDollarCount,
      },
    });

    await this.snackMachineRepository.getEntityManager().persistAndFlush(snackMachineEntity);
  }
}

export const SnackMachineRepositoryProvider: Provider = {
  provide: SnackMachineRepository,
  useClass: MikroOrmSnackMachineRepository,
};
