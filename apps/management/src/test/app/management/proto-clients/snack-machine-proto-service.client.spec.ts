import { status } from '@grpc/grpc-js';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { SnackMachineProtoService } from '@vending-machines/proto';
import { InvalidOperationException, UnloadMoneyDto } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { of, throwError } from 'rxjs';
import { SnackMachineProtoServiceClient } from '../../../../app/management/proto-clients/snack-machine-proto-service.client';

describe('SnackMachineProtoServiceClient', () => {
  const dto: UnloadMoneyDto = { money: [1, 1, 1, 1, 1, 1] };
  const service = {
    unloadMoney: vi.fn<SnackMachineProtoService['unloadMoney']>(() => of(dto)),
    createSnackMachine: vi.fn<SnackMachineProtoService['createSnackMachine']>(),
    deleteSnackMachine: vi.fn<SnackMachineProtoService['deleteSnackMachine']>(),
  };
  let protoClient: SnackMachineProtoServiceClient;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: SnackMachineProtoServiceClient, useValue: new SnackMachineProtoServiceClient(service) }],
    }).compile();

    protoClient = module.get<SnackMachineProtoServiceClient>(SnackMachineProtoServiceClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
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

    it('should rethrow FAILED_PRECONDITION as InvalidOperationException', async () => {
      const details = 'Cannot unload money during transaction';
      service.unloadMoney.mockReturnValueOnce(throwError(() => ({ code: status.FAILED_PRECONDITION, details })));

      const result = protoClient.unloadMoney(randomUUID());

      await expect(result).rejects.toBeInstanceOf(InvalidOperationException);
      await expect(result).rejects.toThrow(details);
    });

    it('should rethrow NOT_FOUND as NotFoundException', async () => {
      const id = randomUUID();
      const details = `Snack machine with id ${id} not found`;
      service.unloadMoney.mockReturnValueOnce(throwError(() => ({ code: status.NOT_FOUND, details })));

      const result = protoClient.unloadMoney(id);

      await expect(result).rejects.toBeInstanceOf(NotFoundException);
      await expect(result).rejects.toThrow(details);
    });

    it('should rethrow other errors unchanged', async () => {
      const error = { code: status.INTERNAL, details: 'Internal server error' };
      service.unloadMoney.mockReturnValueOnce(throwError(() => error));

      await expect(protoClient.unloadMoney(randomUUID())).rejects.toBe(error);
    });
  });
});
