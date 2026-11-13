import { status } from '@grpc/grpc-js';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { AtmProtoService, LoadMoneyRequest } from '@vending-machines/proto';
import { CoinsAndNotes, InvalidOperationException } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { of, throwError } from 'rxjs';
import { AtmProtoServiceClient } from '../../../../app/management/proto-clients/atm-proto-service.client';

describe('AtmProtoServiceClient', () => {
  const service = {
    loadMoney: vi.fn<AtmProtoService['loadMoney']>(() => of(void 0)),
    createAtm: vi.fn<AtmProtoService['createAtm']>(),
    deleteAtm: vi.fn<AtmProtoService['deleteAtm']>(),
  };
  let protoClient: AtmProtoServiceClient;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: AtmProtoServiceClient, useValue: new AtmProtoServiceClient(service) }],
    }).compile();

    protoClient = module.get<AtmProtoServiceClient>(AtmProtoServiceClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('#loadMoney', () => {
    it('should call grpc client with correct data', async () => {
      const id = randomUUID();
      const money: CoinsAndNotes = [1, 1, 1, 1, 1, 1];
      const dto: LoadMoneyRequest = { id, money };

      await protoClient.loadMoney(dto);

      expect(service.loadMoney).toHaveBeenCalledWith({ id, money });
    });

    it('should rethrow FAILED_PRECONDITION as InvalidOperationException', async () => {
      const details = 'Money components cannot be negative';
      service.loadMoney.mockReturnValueOnce(throwError(() => ({ code: status.FAILED_PRECONDITION, details })));

      const result = protoClient.loadMoney({ id: randomUUID(), money: [1, 1, 1, 1, 1, 1] });

      await expect(result).rejects.toBeInstanceOf(InvalidOperationException);
      await expect(result).rejects.toThrow(details);
    });

    it('should rethrow NOT_FOUND as NotFoundException', async () => {
      const id = randomUUID();
      const details = `Atm with id ${id} not found`;
      service.loadMoney.mockReturnValueOnce(throwError(() => ({ code: status.NOT_FOUND, details })));

      const result = protoClient.loadMoney({ id, money: [1, 1, 1, 1, 1, 1] });

      await expect(result).rejects.toBeInstanceOf(NotFoundException);
      await expect(result).rejects.toThrow(details);
    });

    it('should rethrow other errors unchanged', async () => {
      const error = { code: status.INTERNAL, details: 'Internal server error' };
      service.loadMoney.mockReturnValueOnce(throwError(() => error));

      await expect(protoClient.loadMoney({ id: randomUUID(), money: [1, 1, 1, 1, 1, 1] })).rejects.toBe(error);
    });
  });
});
