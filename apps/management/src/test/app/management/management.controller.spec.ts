import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { ManagementController } from '../../../app/management/management.controller';
import { GetHeadOfficeQuery } from '../../../app/management/queries/impl/get-head-office.query';

describe('ManagementController', () => {
  let controller: ManagementController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManagementController],
      providers: [
        { provide: CommandBus, useValue: { execute: jest.fn() } },
        { provide: QueryBus, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ManagementController>(ManagementController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);

    commandBus; // FIXME: remove this
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#getHeadOffice', () => {
    it('should execute GetHeadOfficeQuery', async () => {
      await controller.getHeadOffice();

      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetHeadOfficeQuery));
    });
  });
});
