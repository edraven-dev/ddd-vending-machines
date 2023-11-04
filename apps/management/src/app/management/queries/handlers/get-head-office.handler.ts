import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MoneyDto } from '@vending-machines/shared';
import { HeadOfficeDto } from '../../dto/head-office.dto';
import { HeadOffice } from '../../head-office';
import { GetHeadOfficeQuery } from '../impl/get-head-office.query';

@QueryHandler(GetHeadOfficeQuery)
export class GetHeadOfficeHandler implements IQueryHandler<GetHeadOfficeQuery, HeadOfficeDto> {
  constructor(private readonly headOffice: HeadOffice) {}

  async execute() {
    return new HeadOfficeDto(
      this.headOffice.id,
      new MoneyDto(this.headOffice.balance),
      new MoneyDto(this.headOffice.cash.amount),
    );
  }
}
