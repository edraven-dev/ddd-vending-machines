import { Test, TestingModule } from '@nestjs/testing';
import { Money, MoneyDto } from '@vending-machines/shared';
import crypto from 'crypto';
import Currency from 'currency.js';
import { Atm } from '../../../../../app/atm/atm';
import { AtmDto } from '../../../../../app/atm/dto/atm.dto';
import { GetAtmHandler } from '../../../../../app/atm/queries/handlers/get-atm.handler';

jest.mock('../../../../../app/atm/dto/atm.dto', () => {
  return {
    AtmDto: jest.fn().mockImplementation(() => {
      return {};
    }),
  };
});

describe('GetAtmHandler', () => {
  const id = crypto.randomUUID();
  const atm = new Atm();
  Object.assign(atm, { id });
  let handler: GetAtmHandler;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetAtmHandler, { provide: Atm, useValue: atm }],
    }).compile();

    handler = module.get<GetAtmHandler>(GetAtmHandler);
  });

  describe('execute', () => {
    it('should create AtmDto with correct data', async () => {
      atm.loadMoney(Money.add(Money.FiveDollar, Money.FiveDollar));
      atm.takeMoney(new Currency('5.00'));

      await handler.execute();

      expect(AtmDto).toHaveBeenCalledWith(id, new MoneyDto(new Currency('5.00')), new MoneyDto(new Currency('5.05')));
    });
  });
});
