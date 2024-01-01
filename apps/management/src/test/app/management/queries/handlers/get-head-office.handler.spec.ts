import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import Currency from 'currency.js';
import { HeadOfficeDto } from '../../../../../app/management/dto/head-office.dto';
import { HeadOffice } from '../../../../../app/management/head-office';
import { HeadOfficeRepository } from '../../../../../app/management/head-office.repository.interface';
import { GetHeadOfficeHandler } from '../../../../../app/management/queries/handlers/get-head-office.handler';

describe('GetHeadOfficeHandler', () => {
  const headOffice = new HeadOffice();
  Object.assign(headOffice, { id: randomUUID() });
  let handler: GetHeadOfficeHandler;
  let repository: HeadOfficeRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetHeadOfficeHandler,
        { provide: HeadOfficeRepository, useValue: { findOne: jest.fn(async () => headOffice) } },
      ],
    }).compile();

    handler = module.get<GetHeadOfficeHandler>(GetHeadOfficeHandler);
    repository = module.get<HeadOfficeRepository>(HeadOfficeRepository);
  });

  describe('#execute', () => {
    it('should call HeadOfficeRepository.findOne', async () => {
      jest.spyOn(repository, 'findOne');

      await handler.execute({ id: headOffice.id });

      expect(repository.findOne).toHaveBeenCalledWith(headOffice.id);
    });

    it('should throw NotFoundException if HeadOffice not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(handler.execute({ id: headOffice.id })).rejects.toThrow(NotFoundException);
    });

    it('should return HeadOfficeDto with correct data', async () => {
      headOffice.cash = Money.FiveDollar;
      headOffice.changeBalance(new Currency('5.00'));

      const result = await handler.execute({ id: headOffice.id });

      expect(result).toBeInstanceOf(HeadOfficeDto);
      expect(result.id).toBe(headOffice.id);
      expect(result.cash.amount).toBe('$5.00');
      expect(result.balance.amount).toBe('$5.00');
    });
  });
});
