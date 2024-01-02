import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { Atm } from '../../../../../app/atm/atm';
import { AtmRepository } from '../../../../../app/atm/atm.repository.interface';
import { CreateAtmHandler } from '../../../../../app/atm/commands/handlers/create-atm.handler';
import { CreateAtmCommand } from '../../../../../app/atm/commands/impl/create-atm.command';

describe('CreateAtmHandler', () => {
  const atm = new Atm(randomUUID());
  let handler: CreateAtmHandler;
  let atmRepository: AtmRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAtmHandler,
        {
          provide: AtmRepository,
          useValue: { save: jest.fn() },
        },
        { provide: EventPublisher, useValue: { mergeObjectContext: jest.fn((atm) => atm) } },
      ],
    }).compile();

    handler = module.get<CreateAtmHandler>(CreateAtmHandler);
    atmRepository = module.get<AtmRepository>(AtmRepository);
  });

  describe('#execute', () => {
    it('should call atmRepository.save with proper data', async () => {
      await handler.execute(new CreateAtmCommand(atm.id));

      expect(atmRepository.save).toHaveBeenCalledWith(atm);
    });

    it('should call atm.commit', async () => {
      jest.spyOn(Atm.prototype, 'commit');

      await handler.execute(new CreateAtmCommand(atm.id));

      expect(atm.commit).toHaveBeenCalled();
    });
  });
});
