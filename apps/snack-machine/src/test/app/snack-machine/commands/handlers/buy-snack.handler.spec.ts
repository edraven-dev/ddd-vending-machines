import { NotFoundException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import type { Mock } from 'vitest';
import { BuySnackHandler } from '../../../../../app/snack-machine/commands/handlers/buy-snack.handler';
import type { SnackMachine } from '../../../../../app/snack-machine/snack-machine';
import { SnackMachineRepository } from '../../../../../app/snack-machine/snack-machine.repository.interface';

describe('BuySnackHandler', () => {
  const snackMachine = {
    id: randomUUID(),
    buySnack: vi.fn<SnackMachine['buySnack']>(),
    commit: vi.fn<SnackMachine['commit']>(),
  };
  let handler: BuySnackHandler;
  let repository: SnackMachineRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuySnackHandler,
        {
          provide: SnackMachineRepository,
          useValue: {
            findOne: vi.fn<() => Promise<typeof snackMachine>>(async () => snackMachine),
            save: vi.fn<SnackMachineRepository['save']>(),
          },
        },
        {
          provide: EventPublisher,
          useValue: { mergeObjectContext: vi.fn<EventPublisher['mergeObjectContext']>((snackMachine) => snackMachine) },
        },
      ],
    }).compile();

    handler = module.get<BuySnackHandler>(BuySnackHandler);
    repository = module.get<SnackMachineRepository>(SnackMachineRepository);
  });

  describe('#execute', () => {
    it('should call snackMachineRepository.findOne with correct id', async () => {
      const spy = vi.spyOn(repository, 'findOne');
      const id = snackMachine.id;
      const position = 1;

      await handler.execute({ id, position });

      expect(spy).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if SnackMachine not found', async () => {
      (repository.findOne as Mock).mockResolvedValueOnce(undefined);
      const id = snackMachine.id;
      const position = 1;

      await expect(handler.execute({ id, position })).rejects.toThrow(NotFoundException);
    });

    it('should call snackMachine.buySnack', async () => {
      const id = snackMachine.id;
      const position = 1;

      await handler.execute({ id, position });

      expect(snackMachine.buySnack).toHaveBeenCalled();
    });

    it('should call snackMachineRepository.save with proper data', async () => {
      const spy = vi.spyOn(repository, 'save');
      const id = snackMachine.id;
      const position = 1;

      await handler.execute({ id, position });

      expect(spy).toHaveBeenCalledWith(snackMachine);
    });

    it('should call snackMachine.commit', async () => {
      const id = snackMachine.id;
      const position = 1;

      await handler.execute({ id, position });

      expect(snackMachine.commit).toHaveBeenCalled();
    });
  });
});
