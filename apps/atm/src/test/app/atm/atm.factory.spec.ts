import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { AtmCreatedEvent } from '@vending-machines/events';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'node:crypto';
import { Atm } from '../../../app/atm/atm';
import { AtmFactory } from '../../../app/atm/atm.factory';

describe('AtmFactory', () => {
  const eventPublisher = { mergeObjectContext: vi.fn<EventPublisher['mergeObjectContext']>((atm) => atm) };
  let factory: AtmFactory;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AtmFactory, { provide: EventPublisher, useValue: eventPublisher }],
    }).compile();

    factory = module.get<AtmFactory>(AtmFactory);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#create', () => {
    it('should apply AtmCreatedEvent', () => {
      const apply = vi.spyOn(Atm.prototype, 'apply');
      const id = randomUUID();

      factory.create(id);

      expect(apply).toHaveBeenCalledWith(expect.any(AtmCreatedEvent));
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
