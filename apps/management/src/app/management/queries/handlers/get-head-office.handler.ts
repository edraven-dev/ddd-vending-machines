import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MoneyDto } from '@vending-machines/shared';
import { HeadOfficeDto } from '../../dto/head-office.dto';
import { HeadOfficeRepository } from '../../head-office.repository.interface';
import { GetHeadOfficeQuery } from '../impl/get-head-office.query';

@QueryHandler(GetHeadOfficeQuery)
export class GetHeadOfficeHandler implements IQueryHandler<GetHeadOfficeQuery, HeadOfficeDto> {
  constructor(private readonly headOfficeRepository: HeadOfficeRepository) {}

  async execute({ id }: GetHeadOfficeQuery) {
    const headOffice = await this.headOfficeRepository.findOne(id);

    if (!headOffice) {
      throw new NotFoundException(`Head office with id ${id} not found`);
    }

    return new HeadOfficeDto(headOffice.id, new MoneyDto(headOffice.balance), new MoneyDto(headOffice.cash.amount));
  }
}
