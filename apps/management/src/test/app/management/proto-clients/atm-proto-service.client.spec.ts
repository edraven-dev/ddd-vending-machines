import { Test, TestingModule } from '@nestjs/testing';
import { CoinsAndNotes, LoadMoneyDto } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { of } from 'rxjs';
import { AtmProtoServiceClient } from '../../../../app/management/proto-clients/atm-proto-service.client';

describe('AtmProtoServiceClient', () => {
  const service = { loadMoney: jest.fn(() => of(void 0)) };
  let protoClient: AtmProtoServiceClient;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: AtmProtoServiceClient, useValue: new AtmProtoServiceClient(service) }],
    }).compile();

    protoClient = module.get<AtmProtoServiceClient>(AtmProtoServiceClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#loadMoney', () => {
    it('should call grpc client with correct data', async () => {
      const id = randomUUID();
      const money: CoinsAndNotes = [1, 1, 1, 1, 1, 1];
      const dto: LoadMoneyDto = { id, money };

      await protoClient.loadMoney(dto);

      expect(service.loadMoney).toHaveBeenCalledWith({ id, money });
    });
  });
});
