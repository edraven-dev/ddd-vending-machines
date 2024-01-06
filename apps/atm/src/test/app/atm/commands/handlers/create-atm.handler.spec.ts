import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { Atm } from '../../../../../app/atm/atm';
import { AtmFactory } from '../../../../../app/atm/atm.factory';
import { AtmRepository } from '../../../../../app/atm/atm.repository.interface';
import { CreateAtmHandler } from '../../../../../app/atm/commands/handlers/create-atm.handler';
import { CreateAtmCommand } from '../../../../../app/atm/commands/impl/create-atm.command';

describe('CreateAtmHandler', () => {
  const atm = new Atm(randomUUID());
  let handler: CreateAtmHandler;
  let factory: AtmFactory;
  let atmRepository: AtmRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAtmHandler,
        { provide: AtmFactory, useValue: { create: jest.fn(() => atm) } },
        { provide: AtmRepository, useValue: { save: jest.fn() } },
      ],
    }).compile();

    handler = module.get<CreateAtmHandler>(CreateAtmHandler);
    factory = module.get<AtmFactory>(AtmFactory);
    atmRepository = module.get<AtmRepository>(AtmRepository);
  });

  describe('#execute', () => {
    it('should call atmFactory.create with correct id', async () => {
      jest.spyOn(factory, 'create');
      const id = atm.id;

      await handler.execute(new CreateAtmCommand(id));

      expect(factory.create).toHaveBeenCalledWith(id);
    });

    it('should call atmRepository.save with proper data', async () => {
      const id = atm.id;

      await handler.execute(new CreateAtmCommand(id));

      expect(atmRepository.save).toHaveBeenCalledWith(atm);
    });

    it('should call atm.commit', async () => {
      jest.spyOn(Atm.prototype, 'commit');
      const id = atm.id;

      await handler.execute(new CreateAtmCommand(id));

      expect(atm.commit).toHaveBeenCalled();
    });
  });
});
