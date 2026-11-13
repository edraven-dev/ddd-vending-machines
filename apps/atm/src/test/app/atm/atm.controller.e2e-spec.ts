import { status } from '@grpc/grpc-js';
import { HttpStatus, INestApplication, NotFoundException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ClientGrpcProxy, ClientProxyFactory, MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import type { AtmProtoService } from '@vending-machines/proto';
import {
  HttpExceptionFilterProvider,
  InvalidOperationExceptionFilterProvider,
  Money,
  ValidationProvider,
} from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { lastValueFrom } from 'rxjs';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AtmController } from '../../../app/atm/atm.controller';
import { AtmService } from '../../../app/atm/atm.service';

describe('AtmController - e2e', () => {
  const queryBusMock = {
    execute: vi.fn<() => Promise<{ moneyCharged: string; moneyInside: string }>>(async () => ({
      moneyCharged: '$1.00',
      moneyInside: '$1.00',
    })),
  };
  const commandBusMock = { execute: vi.fn<CommandBus['execute']>() };
  const atmServiceMock = { loadMoney: vi.fn<AtmService['loadMoney']>() };
  const testEndpoint = (id: string) => `/atm/${id}`;
  const protoDir = dirname(createRequire(import.meta.url).resolve('@vending-machines/proto/package.json'));
  const grpcOptions = { package: 'atm', protoPath: join(protoDir, 'src/lib/atm/atm.proto'), url: 'localhost:40151' };

  let app: INestApplication;
  let grpcClient: ClientGrpcProxy;
  let atmProtoService: AtmProtoService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AtmController],
      providers: [
        ValidationProvider,
        InvalidOperationExceptionFilterProvider,
        HttpExceptionFilterProvider,
        { provide: QueryBus, useValue: queryBusMock },
        { provide: CommandBus, useValue: commandBusMock },
        { provide: AtmService, useValue: atmServiceMock },
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
    atmProtoService = grpcClient.getService<AtmProtoService>('AtmProtoService');
  });

  afterAll(async () => {
    grpcClient.close();
    await app.close();
  });

  describe('GET /:id', () => {
    it('should return 200 OK', async () => {
      return request(app.getHttpServer())
        .get(testEndpoint(randomUUID()))
        .expect(HttpStatus.OK)
        .expect(await queryBusMock.execute());
    });

    it('should return 400 BAD REQUEST when id is not a valid uuid', async () => {
      const response = await request(app.getHttpServer())
        .get(testEndpoint('not-valid-uuid'))
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });
  });

  describe('POST /', () => {
    it('should return 201 CREATED', async () => {
      return request(app.getHttpServer())
        .post(testEndpoint(''))
        .send({ id: randomUUID() })
        .expect(HttpStatus.CREATED)
        .expect(await queryBusMock.execute());
    });

    it('should return 400 BAD REQUEST when id is not a valid uuid', async () => {
      const response = await request(app.getHttpServer())
        .post(testEndpoint(''))
        .send({ id: 'not-valid-uuid' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });
  });

  describe('POST /:id/take-money', () => {
    it('should return 200 OK', async () => {
      return request(app.getHttpServer())
        .post(`${testEndpoint(randomUUID())}/take-money`)
        .send({ amount: '20' })
        .expect(HttpStatus.OK)
        .expect(await queryBusMock.execute());
    });

    it('should return 400 BAD REQUEST when id is not a valid uuid', async () => {
      const response = await request(app.getHttpServer())
        .post(`${testEndpoint('not-valid-uuid')}/take-money`)
        .send({ amount: '20' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when payload is not a valid currency', async () => {
      const response = await request(app.getHttpServer())
        .post(`${testEndpoint(randomUUID())}/take-money`)
        .send({ amount: '20.001' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });
  });

  describe('gRPC LoadMoney', () => {
    it('should load money', async () => {
      const id = randomUUID();

      await lastValueFrom(atmProtoService.loadMoney({ id, money: [1, 1, 1, 1, 1, 1] }));

      expect(atmServiceMock.loadMoney).toHaveBeenCalledWith(id, new Money(1, 1, 1, 1, 1, 1));
    });

    it('should fail with INVALID_ARGUMENT when id is not a valid uuid', async () => {
      await expect(
        lastValueFrom(atmProtoService.loadMoney({ id: 'not-valid-uuid', money: [1, 1, 1, 1, 1, 1] })),
      ).rejects.toMatchObject({ code: status.INVALID_ARGUMENT, details: 'id: Invalid UUID' });

      expect(atmServiceMock.loadMoney).not.toHaveBeenCalledWith('not-valid-uuid', expect.anything());
    });

    it('should fail with NOT_FOUND when the ATM does not exist', async () => {
      const id = randomUUID();
      atmServiceMock.loadMoney.mockRejectedValueOnce(new NotFoundException(`Atm with id ${id} not found`));

      await expect(lastValueFrom(atmProtoService.loadMoney({ id, money: [1, 1, 1, 1, 1, 1] }))).rejects.toMatchObject({
        code: status.NOT_FOUND,
        details: `Atm with id ${id} not found`,
      });
    });

    it('should fail with FAILED_PRECONDITION when the domain rejects the money', async () => {
      await expect(
        lastValueFrom(atmProtoService.loadMoney({ id: randomUUID(), money: [-1, 0, 0, 0, 0, 0] })),
      ).rejects.toMatchObject({ code: status.FAILED_PRECONDITION, details: 'Money components cannot be negative' });
    });
  });
});
