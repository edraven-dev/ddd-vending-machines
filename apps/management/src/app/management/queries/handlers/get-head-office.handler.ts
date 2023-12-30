import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MoneyDto } from '@vending-machines/shared';
import { HeadOfficeDto } from '../../dto/head-office.dto';
import { HeadOfficeRepository } from '../../head-office.repository.interface';
import { GetHeadOfficeQuery } from '../impl/get-head-office.query';

@QueryHandler(GetHeadOfficeQuery)
export class GetHeadOfficeHandler implements IQueryHandler<GetHeadOfficeQuery, HeadOfficeDto> {
  constructor(@Inject(HeadOfficeRepository) private readonly headOfficeRepository: HeadOfficeRepository) {}

  async execute() {
    const headOffice = await this.headOfficeRepository.findOne();
    return new HeadOfficeDto(headOffice.id, new MoneyDto(headOffice.balance), new MoneyDto(headOffice.cash.amount));
  }
}
