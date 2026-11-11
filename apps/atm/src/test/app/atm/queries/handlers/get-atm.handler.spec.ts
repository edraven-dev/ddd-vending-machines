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
  const repositoryMock = { findOne: vi.fn<AtmRepository['findOne']>(async () => atm) };
  let handler: GetAtmHandler;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetAtmHandler, { provide: AtmRepository, useValue: repositoryMock }],
    }).compile();

    handler = module.get<GetAtmHandler>(GetAtmHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#execute', () => {
    it('should call AtmRepository.findOne with correct id', async () => {
      const id = atm.id;

      await handler.execute({ id });

      expect(repositoryMock.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if Atm not found', async () => {
      repositoryMock.findOne.mockResolvedValueOnce(null);
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
