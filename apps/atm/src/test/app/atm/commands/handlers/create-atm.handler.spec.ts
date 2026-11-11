import { Test, TestingModule } from '@nestjs/testing';
import { Money } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { Atm } from '../../../../../app/atm/atm';
import { AtmFactory } from '../../../../../app/atm/atm.factory';
import { AtmRepository } from '../../../../../app/atm/atm.repository.interface';
import { CreateAtmHandler } from '../../../../../app/atm/commands/handlers/create-atm.handler';
import { CreateAtmCommand } from '../../../../../app/atm/commands/impl/create-atm.command';

describe('CreateAtmHandler', () => {
  const atm = new Atm(randomUUID());
  const factory = { create: vi.fn<AtmFactory['create']>(() => atm) };
  const atmRepository = { save: vi.fn<AtmRepository['save']>() };
  let handler: CreateAtmHandler;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAtmHandler,
        { provide: AtmFactory, useValue: factory },
        { provide: AtmRepository, useValue: atmRepository },
      ],
    }).compile();

    handler = module.get<CreateAtmHandler>(CreateAtmHandler);
  });

  describe('#execute', () => {
    it('should create ATM entity', async () => {
      vi.spyOn(factory, 'create');
      const id = atm.id;

      await handler.execute(new CreateAtmCommand(id));

      expect(factory.create).toHaveBeenCalledWith(id);
    });

    it('should load money into ATM', async () => {
      const loadMoney = vi.spyOn(Atm.prototype, 'loadMoney');
      const id = atm.id;

      await handler.execute(new CreateAtmCommand(id));

      expect(loadMoney).toHaveBeenCalledWith(new Money(100, 100, 100, 100, 100, 100));
    });

    it('should save ATM with repository', async () => {
      const id = atm.id;

      await handler.execute(new CreateAtmCommand(id));

      expect(atmRepository.save).toHaveBeenCalledWith(atm);
    });

    it('should commit events', async () => {
      const commit = vi.spyOn(Atm.prototype, 'commit');
      const id = atm.id;

      await handler.execute(new CreateAtmCommand(id));

      expect(commit).toHaveBeenCalled();
    });
  });
});
