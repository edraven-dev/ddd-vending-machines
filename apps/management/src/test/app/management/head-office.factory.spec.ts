import { EventPublisher } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { HeadOfficeCreatedEvent } from '@vending-machines/events';
import { Id } from '@vending-machines/shared';
import { HeadOffice } from '../../../app/management/head-office';
import { HeadOfficeFactory } from '../../../app/management/head-office.factory';

describe('HeadOfficeFactory', () => {
  const eventPublisherMock = {
    mergeObjectContext: vi.fn<EventPublisher['mergeObjectContext']>((headOffice) => headOffice),
  };
  let factory: HeadOfficeFactory;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HeadOfficeFactory, { provide: EventPublisher, useValue: eventPublisherMock }],
    }).compile();

    factory = module.get<HeadOfficeFactory>(HeadOfficeFactory);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#create', () => {
    it('should apply HeadOfficeCreatedEvent', () => {
      const apply = vi.spyOn(HeadOffice.prototype, 'apply');
      const id = Id.generate();

      factory.create(id);

      expect(apply).toHaveBeenCalledWith(expect.any(HeadOfficeCreatedEvent));
    });

    it('should return HeadOffice with proper id', () => {
      const id = Id.generate();

      const headOffice = factory.create(id);

      expect(headOffice.id).toEqual(id);
    });
  });
});
