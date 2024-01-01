import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MoneyDto } from '@vending-machines/shared';
import { AtmRepository } from '../../atm.repository.interface';
import { AtmDto } from '../../dto/atm.dto';
import { GetAtmQuery } from '../impl/get-atm.query';

@QueryHandler(GetAtmQuery)
export class GetAtmHandler implements IQueryHandler<GetAtmQuery, AtmDto> {
  constructor(private readonly atmRepository: AtmRepository) {}

  async execute({ id }: GetAtmQuery) {
    const atm = await this.atmRepository.findOne(id);

    if (!atm) {
      throw new NotFoundException(`Atm with id ${id} not found`);
    }

    return new AtmDto(atm.id, new MoneyDto(atm.moneyInside.amount), new MoneyDto(atm.moneyCharged));
  }
}
