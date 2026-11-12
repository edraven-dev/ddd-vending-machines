import { status } from '@grpc/grpc-js';
import { HttpStatus, INestApplication, NotFoundException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ClientGrpcProxy, ClientProxyFactory, MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import type { SnackMachineProtoService } from '@vending-machines/proto';
import {
  HttpExceptionFilterProvider,
  InvalidOperationException,
  InvalidOperationExceptionFilterProvider,
  ValidationProvider,
} from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { lastValueFrom } from 'rxjs';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { SnackMachineController } from '../../../app/snack-machine/snack-machine.controller';
import { SnackMachineService } from '../../../app/snack-machine/snack-machine.service';

describe('SnackMachineController - e2e', () => {
  const queryBusMock = { execute: () => ({ moneyInTransaction: '$1.00', moneyInside: '$1.00' }) };
  const commandBusMock = { execute: vi.fn<CommandBus['execute']>() };
  const snackMachineServiceMock = { unloadMoney: vi.fn<SnackMachineService['unloadMoney']>() };
  const testEndpoint = (id: string) => `/snack-machine/${id}`;
  const protoDir = dirname(createRequire(import.meta.url).resolve('@vending-machines/proto/package.json'));
  const grpcOptions = {
    package: 'snack_machine',
    protoPath: join(protoDir, 'src/lib/snack-machine/snack-machine.proto'),
    url: 'localhost:50152',
  };

  let app: INestApplication;
  let grpcClient: ClientGrpcProxy;
  let snackMachineProtoService: SnackMachineProtoService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [SnackMachineController],
      providers: [
        ValidationProvider,
        InvalidOperationExceptionFilterProvider,
        HttpExceptionFilterProvider,
        { provide: QueryBus, useValue: queryBusMock },
        { provide: CommandBus, useValue: commandBusMock },
        { provide: SnackMachineService, useValue: snackMachineServiceMock },
      ],
    }).compile();

    app = module.createNestApplication();
    app.connectMicroservice<MicroserviceOptions>(
      { transport: Transport.GRPC, options: grpcOptions },
      { inheritAppConfig: true },
    );
    await app.startAllMicroservices();
    await app.init();

    grpcClient = ClientProxyFactory.create({ transport: Transport.GRPC, options: grpcOptions });
    snackMachineProtoService = grpcClient.getService<SnackMachineProtoService>('SnackMachineProtoService');
  });

  afterAll(async () => {
    grpcClient.close();
    await app.close();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('GET /:id', () => {
    it('should return 200 OK', () => {
      return request(app.getHttpServer())
        .get(`${testEndpoint(randomUUID())}`)
        .expect(HttpStatus.OK)
        .expect(queryBusMock.execute());
    });

    it('should return 400 BAD REQUEST when id is not a valid uuid', async () => {
      const response = await request(app.getHttpServer())
        .get(`${testEndpoint('not-valid-uuid')}`)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });
  });

  describe('POST /', () => {
    it('should return 201 CREATED', () => {
      return request(app.getHttpServer())
        .post(testEndpoint(''))
        .send({ id: randomUUID() })
        .expect(HttpStatus.CREATED)
        .expect(queryBusMock.execute());
    });

    it('should return 400 BAD REQUEST when id is not a valid uuid', async () => {
      const response = await request(app.getHttpServer())
        .post(testEndpoint(''))
        .send({ id: 'not-valid-uuid' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });
  });

  describe('PUT /:id/insert-money', () => {
    it('should return 200 OK', () => {
      return request(app.getHttpServer())
        .put(`${testEndpoint(randomUUID())}/insert-money`)
        .send({ money: [1, 0, 0, 0, 0, 0] })
        .expect(HttpStatus.OK)
        .expect(queryBusMock.execute());
    });

    it('should return 400 BAD REQUEST when payload is not an array', async () => {
      const response = await request(app.getHttpServer())
        .put(`${testEndpoint(randomUUID())}/insert-money`)
        .send({ money: 'not an array' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when payload is an array with <6 elements', async () => {
      const response = await request(app.getHttpServer())
        .put(`${testEndpoint(randomUUID())}/insert-money`)
        .send({ money: [0, 0, 0, 0, 1] })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when payload is an array with >6 elements', async () => {
      const response = await request(app.getHttpServer())
        .put(`${testEndpoint(randomUUID())}/insert-money`)
        .send({ money: [0, 0, 0, 0, 0, 0, 1] })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when payload is not an array of integers', async () => {
      const response = await request(app.getHttpServer())
        .put(`${testEndpoint(randomUUID())}/insert-money`)
        .send({ money: ['abc', 'abc', 'abc', 'abc', 'abc', '1'] })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when payload is an array of non-integer numbers', async () => {
      const response = await request(app.getHttpServer())
        .put(`${testEndpoint(randomUUID())}/insert-money`)
        .send({ money: [0.5, 0, 0, 0, 0, 0] })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when payload is not an array of 0 and 1 integers', async () => {
      const response = await request(app.getHttpServer())
        .put(`${testEndpoint(randomUUID())}/insert-money`)
        .send({ money: [-1, 0, 0, 0, 0, 2] })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when id is not a valid uuid', async () => {
      const response = await request(app.getHttpServer())
        .put(`${testEndpoint('not-valid-uuid')}/insert-money`)
        .send({ money: [1, 0, 0, 0, 0, 0] })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });
  });

  describe('POST /:id/buy-snack', () => {
    it('should return 200 OK', () => {
      return request(app.getHttpServer())
        .post(`${testEndpoint(randomUUID())}/buy-snack`)
        .send({ position: 1 })
        .expect(HttpStatus.OK)
        .expect(queryBusMock.execute());
    });

    it('should return 400 BAD REQUEST when payload is not an integer', async () => {
      const response = await request(app.getHttpServer())
        .post(`${testEndpoint(randomUUID())}/buy-snack`)
        .send({ position: 'not an integer' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when payload is a non-integer number', async () => {
      const response = await request(app.getHttpServer())
        .post(`${testEndpoint(randomUUID())}/buy-snack`)
        .send({ position: 1.5 })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when payload is below 1', async () => {
      const response = await request(app.getHttpServer())
        .post(`${testEndpoint(randomUUID())}/buy-snack`)
        .send({ position: 0 })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when payload is not an integer between 1 and 3', async () => {
      const response = await request(app.getHttpServer())
        .post(`${testEndpoint(randomUUID())}/buy-snack`)
        .send({ position: 4 })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when id is not a valid uuid', async () => {
      const response = await request(app.getHttpServer())
        .post(`${testEndpoint('not-valid-uuid')}/buy-snack`)
        .send({ position: 1 })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });
  });

  describe('POST /:id/return-money', () => {
    it('should return 200 OK', () => {
      return request(app.getHttpServer())
        .post(`${testEndpoint(randomUUID())}/return-money`)
        .expect(HttpStatus.OK)
        .expect(queryBusMock.execute());
    });

    it('should return 400 BAD REQUEST when id is not a valid uuid', async () => {
      const response = await request(app.getHttpServer())
        .post(`${testEndpoint('not-valid-uuid')}/return-money`)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });
  });

  describe('GET /:id/money-in-machine', () => {
    it('should return 200 OK', () => {
      return request(app.getHttpServer())
        .get(`${testEndpoint(randomUUID())}/money-in-machine`)
        .expect(HttpStatus.OK)
        .expect(queryBusMock.execute());
    });

    it('should return 400 BAD REQUEST when id is not a valid uuid', async () => {
      const response = await request(app.getHttpServer())
        .get(`${testEndpoint('not-valid-uuid')}/money-in-machine`)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });
  });

  describe('PATCH /:id/load-snacks', () => {
    it('should return 200 OK', () => {
      return request(app.getHttpServer())
        .patch(`${testEndpoint(randomUUID())}/load-snacks`)
        .send({ position: 1, quantity: 1 })
        .expect(HttpStatus.OK)
        .expect(queryBusMock.execute());
    });

    it('should return 400 BAD REQUEST when position is not a integer', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${testEndpoint(randomUUID())}/load-snacks`)
        .send({ position: 'not an integer', quantity: 1 })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when position is a non-integer number', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${testEndpoint(randomUUID())}/load-snacks`)
        .send({ position: 1.1, quantity: 1 })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when position is below 1', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${testEndpoint(randomUUID())}/load-snacks`)
        .send({ position: 0, quantity: 1 })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when position is above 3', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${testEndpoint(randomUUID())}/load-snacks`)
        .send({ position: 4, quantity: 1 })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when quantity is not a integer', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${testEndpoint(randomUUID())}/load-snacks`)
        .send({ position: 1, quantity: 'not an integer' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when quantity is a non-integer number', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${testEndpoint(randomUUID())}/load-snacks`)
        .send({ position: 1, quantity: 1.1 })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when quantity is below 1', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${testEndpoint(randomUUID())}/load-snacks`)
        .send({ position: 1, quantity: 0 })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when quantity is above 20', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${testEndpoint(randomUUID())}/load-snacks`)
        .send({ position: 1, quantity: 21 })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });
  });

  describe('gRPC UnloadMoney', () => {
    it('should unload money', async () => {
      const id = randomUUID();
      snackMachineServiceMock.unloadMoney.mockResolvedValueOnce({ money: [1, 1, 1, 1, 1, 1] });

      const result = await lastValueFrom(snackMachineProtoService.unloadMoney({ id }));

      expect(result).toEqual({ money: [1, 1, 1, 1, 1, 1] });
      expect(snackMachineServiceMock.unloadMoney).toHaveBeenCalledWith(id);
    });

    it('should fail with INVALID_ARGUMENT when id is not a valid uuid', async () => {
      await expect(lastValueFrom(snackMachineProtoService.unloadMoney({ id: 'not-valid-uuid' }))).rejects.toMatchObject(
        { code: status.INVALID_ARGUMENT, details: 'id: Invalid UUID' },
      );

      expect(snackMachineServiceMock.unloadMoney).not.toHaveBeenCalled();
    });

    it('should fail with NOT_FOUND when the snack machine does not exist', async () => {
      const id = randomUUID();
      snackMachineServiceMock.unloadMoney.mockRejectedValueOnce(
        new NotFoundException(`Snack machine with id ${id} not found`),
      );

      await expect(lastValueFrom(snackMachineProtoService.unloadMoney({ id }))).rejects.toMatchObject({
        code: status.NOT_FOUND,
        details: `Snack machine with id ${id} not found`,
      });
    });

    it('should fail with FAILED_PRECONDITION when the domain rejects the operation', async () => {
      const message = 'Cannot unload money during transaction';
      snackMachineServiceMock.unloadMoney.mockRejectedValueOnce(new InvalidOperationException(message));

      await expect(lastValueFrom(snackMachineProtoService.unloadMoney({ id: randomUUID() }))).rejects.toMatchObject({
        code: status.FAILED_PRECONDITION,
        details: message,
      });
    });
  });
});
