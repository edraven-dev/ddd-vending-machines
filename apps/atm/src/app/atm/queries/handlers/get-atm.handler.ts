import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MoneyDto } from '@vending-machines/shared';
import { Atm } from '../../atm';
import { AtmDto } from '../../dto/atm.dto';
import { GetAtmQuery } from '../impl/get-atm.query';

@QueryHandler(GetAtmQuery)
export class GetAtmHandler implements IQueryHandler<GetAtmQuery, AtmDto> {
  constructor(private readonly atm: Atm) {}

  async execute() {
    return new AtmDto(this.atm.id, new MoneyDto(this.atm.moneyInside.amount), new MoneyDto(this.atm.moneyCharged));
  }
}
