import { Inject } from '@nestjs/common';
import { Money } from '@vending-machines/shared';
import { AtmRepository } from './atm.repository.interface';

export class AtmService {
  constructor(@Inject(AtmRepository) private readonly atmRepository: AtmRepository) {}

  async loadMoney(money: Money): Promise<void> {
    const atm = await this.atmRepository.findOne();
    atm.loadMoney(money);
    await this.atmRepository.save(atm);
  }
}
