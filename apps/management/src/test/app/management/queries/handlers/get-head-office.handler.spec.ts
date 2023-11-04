import { Test, TestingModule } from '@nestjs/testing';
import { Money, MoneyDto } from '@vending-machines/shared';
import crypto from 'crypto';
import Currency from 'currency.js';
import { HeadOfficeDto } from '../../../../../app/management/dto/head-office.dto';
import { HeadOffice } from '../../../../../app/management/head-office';
import { GetHeadOfficeHandler } from '../../../../../app/management/queries/handlers/get-head-office.handler';

jest.mock('../../../../../app/management/dto/head-office.dto', () => {
  return {
    HeadOfficeDto: jest.fn().mockImplementation(() => {
      return {};
    }),
  };
});

describe('GetHeadOfficeHandler', () => {
  const id = crypto.randomUUID();
  const headOffice = new HeadOffice();
  Object.assign(headOffice, { id });
  let handler: GetHeadOfficeHandler;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetHeadOfficeHandler, { provide: HeadOffice, useValue: headOffice }],
    }).compile();

    handler = module.get<GetHeadOfficeHandler>(GetHeadOfficeHandler);
  });

  describe('execute', () => {
    it('should create HeadOfficeDto with correct data', async () => {
      headOffice.cash = Money.FiveDollar;
      headOffice.changeBalance(new Currency('5.00'));

      await handler.execute();

      expect(HeadOfficeDto).toHaveBeenCalledWith(
        id,
        new MoneyDto(new Currency('5.00')),
        new MoneyDto(new Currency('5.00')),
      );
    });
  });
});
