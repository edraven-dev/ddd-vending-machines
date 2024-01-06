import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import Currency from 'currency.js';
import { Atm } from '../../../../../app/atm/atm';
import { AtmRepository } from '../../../../../app/atm/atm.repository.interface';
import { AtmDto } from '../../../../../app/atm/dto/atm.dto';
import { GetAtmHandler } from '../../../../../app/atm/queries/handlers/get-atm.handler';

describe('GetAtmHandler', () => {
  const atm = new Atm(randomUUID());
  let handler: GetAtmHandler;
  let repository: AtmRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetAtmHandler, { provide: AtmRepository, useValue: { findOne: jest.fn(async () => atm) } }],
    }).compile();

    handler = module.get<GetAtmHandler>(GetAtmHandler);
    repository = module.get<AtmRepository>(AtmRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should call AtmRepository.findOne with correct id', async () => {
      const spy = jest.spyOn(repository, 'findOne');
      const id = atm.id;

      await handler.execute({ id });

      expect(spy).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if Atm not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValueOnce(undefined);
      const id = atm.id;

      await expect(handler.execute({ id })).rejects.toThrow(NotFoundException);
    });

    it('should return AtmDto with correct data', async () => {
      atm.loadMoney(Money.add(Money.FiveDollar, Money.FiveDollar));
      atm.takeMoney(new Currency('5.00'));
      const id = atm.id;

      const result = await handler.execute({ id });

      expect(result).toBeInstanceOf(AtmDto);
      expect(result.id).toBe(id);
      expect(result.moneyCharged.amount).toBe('$5.05');
      expect(result.moneyInside.amount).toBe('$5.00');
    });
  });
});
