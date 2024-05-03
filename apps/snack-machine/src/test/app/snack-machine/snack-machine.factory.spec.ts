import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { SnackMachineCreatedEvent } from '@vending-machines/events';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import Currency from 'currency.js';
import { SnackMachine } from '../../../app/snack-machine/snack-machine';
import { SnackMachineFactory } from '../../../app/snack-machine/snack-machine.factory';

describe('SnackMachineFactory', () => {
  let factory: SnackMachineFactory;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnackMachineFactory,
        { provide: EventPublisher, useValue: { mergeObjectContext: jest.fn((snackMachine) => snackMachine) } },
      ],
    }).compile();

    factory = module.get<SnackMachineFactory>(SnackMachineFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#create', () => {
    it('should apply SnackMachineCreatedEvent', () => {
      jest.spyOn(SnackMachine.prototype, 'apply');
      const id = randomUUID();

      const snackMachine = factory.create(id);

      expect(snackMachine.apply).toHaveBeenCalledWith(expect.any(SnackMachineCreatedEvent));
    });

    it('should return SnackMachine with proper id', () => {
      const id = randomUUID();

      const snackMachine = factory.create(id);

      expect(snackMachine.id).toEqual(id);
    });

    it('should return SnackMachine with proper money inside', () => {
      const id = randomUUID();

      const snackMachine = factory.create(id);

      expect(snackMachine.moneyInside).toEqual(Money.None);
    });

    it('should return SnackMachine with proper money in transaction', () => {
      const id = randomUUID();

      const snackMachine = factory.create(id);

      expect(snackMachine.moneyInTransaction).toEqual(new Currency(0));
    });
  });
});
