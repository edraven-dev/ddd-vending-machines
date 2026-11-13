import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Id, Money } from '@vending-machines/shared';
import Currency from 'currency.js';
import { HeadOfficeDto } from '../../../../../app/management/dto/head-office.dto';
import { HeadOffice } from '../../../../../app/management/head-office';
import { HeadOfficeRepository } from '../../../../../app/management/head-office.repository.interface';
import { GetHeadOfficeHandler } from '../../../../../app/management/queries/handlers/get-head-office.handler';
import { GetHeadOfficeQuery } from '../../../../../app/management/queries/impl/get-head-office.query';

describe('GetHeadOfficeHandler', () => {
  const headOffice = new HeadOffice(
    Id.generate(),
    [Id.generate(), Id.generate()],
    [Id.generate(), Id.generate()],
    new Date('2026-11-14T12:00:00.000Z'),
  );
  const repository = { findOne: vi.fn<HeadOfficeRepository['findOne']>(async () => headOffice) };
  let handler: GetHeadOfficeHandler;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetHeadOfficeHandler, { provide: HeadOfficeRepository, useValue: repository }],
    }).compile();

    handler = module.get<GetHeadOfficeHandler>(GetHeadOfficeHandler);
  });

  describe('#execute', () => {
    it('should call HeadOfficeRepository.findOne', async () => {
      const id = headOffice.id;

      await handler.execute(new GetHeadOfficeQuery(id));

      expect(repository.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if HeadOffice not found', async () => {
      repository.findOne.mockResolvedValueOnce(null);
      const id = headOffice.id;

      await expect(handler.execute(new GetHeadOfficeQuery(id))).rejects.toThrow(NotFoundException);
    });

    it('should return HeadOfficeDto with correct data', async () => {
      headOffice.cash = Money.FiveDollar;
      headOffice.changeBalance(new Currency('5.00'));
      const id = headOffice.id;
      const [firstAtmId, secondAtmId] = headOffice.atmIds;
      const [firstSnackMachineId, secondSnackMachineId] = headOffice.snackMachineIds;

      const result = await handler.execute(new GetHeadOfficeQuery(id));

      expect(result).toBeInstanceOf(HeadOfficeDto);
      expect(result.id).toBe(id.value);
      expect(result.cash.amount).toBe('$5.00');
      expect(result.balance.amount).toBe('$5.00');
      expect(result.atmIds).toStrictEqual([firstAtmId.value, secondAtmId.value]);
      expect(result.snackMachineIds).toStrictEqual([firstSnackMachineId.value, secondSnackMachineId.value]);
      expect(result.expiresAt).toBe('2026-11-14T12:00:00.000Z');
    });
  });
});
