import { HttpStatus, INestApplication, Module } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { ValidationProvider } from '@vending-machines/shared';
import request from 'supertest';
import { SnackMachineRepository } from '../../../app/snack-machine/snack-machine.repository.interface';
import { SnackMachineService } from '../../../app/snack-machine/snack-machine.service';

@Module({
  providers: [{ provide: SnackMachineRepository, useValue: { findOne: jest.fn(), save: jest.fn() } }],
  exports: [SnackMachineRepository],
})
class DatabaseModuleMock {}
jest.mock('../../../app/database/database.module', () => {
  return {
    DatabaseModule: DatabaseModuleMock,
  };
});

import { randomUUID } from 'crypto';
import { SnackMachineController } from '../../../app/snack-machine/snack-machine.controller';

describe('SnackMachineController - e2e', () => {
  const queryBusMock = { execute: () => ({ moneyInTransaction: '$1.00', moneyInside: '$1.00' }) };
  const testEndpoint = (id: string) => `/snack-machine/${id}`;

  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [SnackMachineController],
      providers: [
        ValidationProvider,
        { provide: QueryBus, useValue: queryBusMock },
        { provide: CommandBus, useValue: { execute: jest.fn() } },
        { provide: SnackMachineService, useValue: { unloadMoney: jest.fn() } },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
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

    it('should return 400 BAD REQUEST when payload is not an array of 0 and 1 integers', async () => {
      const response = await request(app.getHttpServer())
        .put(`${testEndpoint(randomUUID())}/insert-money`)
        .send({ money: ['0', '0', '0', '0', '0', '1'] })
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
});
