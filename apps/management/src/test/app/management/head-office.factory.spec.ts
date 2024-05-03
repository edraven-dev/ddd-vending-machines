import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { HeadOfficeCreatedEvent } from '@vending-machines/events';
import { randomUUID } from 'node:crypto';
import { HeadOffice } from '../../../app/management/head-office';
import { HeadOfficeFactory } from '../../../app/management/head-office.factory';

describe('HeadOfficeFactory', () => {
  let factory: HeadOfficeFactory;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeadOfficeFactory,
        { provide: EventPublisher, useValue: { mergeObjectContext: jest.fn((headOffice) => headOffice) } },
      ],
    }).compile();

    factory = module.get<HeadOfficeFactory>(HeadOfficeFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#create', () => {
    it('should apply HeadOfficeCreatedEvent', () => {
      jest.spyOn(HeadOffice.prototype, 'apply');
      const id = randomUUID();

      const headOffice = factory.create(id);

      expect(headOffice.apply).toHaveBeenCalledWith(expect.any(HeadOfficeCreatedEvent));
    });

    it('should return HeadOffice with proper id', () => {
      const id = randomUUID();

      const headOffice = factory.create(id);

      expect(headOffice.id).toEqual(id);
    });
  });
});
