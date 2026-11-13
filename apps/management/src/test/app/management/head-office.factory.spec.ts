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
    vi.useRealTimers();
  });

  describe('#create', () => {
    it('should apply HeadOfficeCreatedEvent for the head office', () => {
      const apply = vi.spyOn(HeadOffice.prototype, 'apply');
      const id = Id.generate();

      factory.create(id, [Id.generate(), Id.generate()], [Id.generate(), Id.generate()]);

      expect(apply).toHaveBeenCalledWith(expect.any(HeadOfficeCreatedEvent));
      expect(apply).toHaveBeenCalledWith(expect.objectContaining({ aggregateId: id.value }));
    });

    it('should return HeadOffice with the given id, atm ids and snack machine ids', () => {
      const id = Id.generate();
      const atmIds = [Id.generate(), Id.generate()];
      const snackMachineIds = [Id.generate(), Id.generate()];

      const headOffice = factory.create(id, atmIds, snackMachineIds);

      expect(headOffice.id).toEqual(id);
      expect(headOffice.atmIds).toEqual(atmIds);
      expect(headOffice.snackMachineIds).toEqual(snackMachineIds);
    });

    it('should return HeadOffice expiring 24 hours from now', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-11-13T12:00:00.000Z'));

      const headOffice = factory.create(Id.generate(), [Id.generate()], [Id.generate()]);

      expect(headOffice.expiresAt).toEqual(new Date('2026-11-14T12:00:00.000Z'));
    });
  });
});
