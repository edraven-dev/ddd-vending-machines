import { Test, TestingModule } from '@nestjs/testing';
import { UnloadMoneyDto } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { of } from 'rxjs';
import { SnackMachineProtoServiceClient } from '../../../../app/management/proto-clients/snack-machine-proto-service.client';

describe('SnackMachineProtoServiceClient', () => {
  const dto: UnloadMoneyDto = { money: [1, 1, 1, 1, 1, 1] };
  const service = { unloadMoney: jest.fn(() => of(dto)) };
  let protoClient: SnackMachineProtoServiceClient;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: SnackMachineProtoServiceClient, useValue: new SnackMachineProtoServiceClient(service) }],
    }).compile();

    protoClient = module.get<SnackMachineProtoServiceClient>(SnackMachineProtoServiceClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('#unloadMoney', () => {
    it('should call grpc client with correct data', async () => {
      const id = randomUUID();

      await protoClient.unloadMoney(id);

      expect(service.unloadMoney).toHaveBeenCalledWith({ id });
    });

    it('should return dto', async () => {
      const id = randomUUID();

      const result = await protoClient.unloadMoney(id);

      expect(result).toEqual(dto);
    });
  });
});
