import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { AtmCreatedEvent } from '@vending-machines/events';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'node:crypto';
import { Atm } from '../../../app/atm/atm';
import { AtmFactory } from '../../../app/atm/atm.factory';

describe('AtmFactory', () => {
  let factory: AtmFactory;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AtmFactory, { provide: EventPublisher, useValue: { mergeObjectContext: jest.fn((atm) => atm) } }],
    }).compile();

    factory = module.get<AtmFactory>(AtmFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#create', () => {
    it('should apply AtmCreatedEvent', () => {
      jest.spyOn(Atm.prototype, 'apply');
      const id = randomUUID();

      const atm = factory.create(id);

      expect(atm.apply).toHaveBeenCalledWith(expect.any(AtmCreatedEvent));
    });

    it('should return Atm with proper id', () => {
      const id = randomUUID();

      const atm = factory.create(id);

      expect(atm.id).toEqual(id);
    });

    it('should return Atm with proper money inside', () => {
      const id = randomUUID();

      const atm = factory.create(id);

      expect(atm.moneyInside).toEqual(Money.None);
    });
  });
});
