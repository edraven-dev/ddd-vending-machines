import { HttpStatus, INestApplication, Module } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { SnackMachineRepository } from '../../../app/snack-machine/snack-machine.repository.interface';

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

import { ValidationProvider } from '@vending-machines/shared';
import { SnackMachineController } from '../../../app/snack-machine/snack-machine.controller';

describe('SnackMachine - e2e', () => {
  const queryBusMock = { execute: () => ({ moneyInTransaction: '$1.00', moneyInside: '$1.00' }) };
  const testEndpoint = '/snack-machine';

  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [SnackMachineController],
      providers: [
        ValidationProvider,
        { provide: QueryBus, useValue: queryBusMock },
        { provide: CommandBus, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/PUT insert-money', () => {
    it('should return 200 OK', () => {
      return request(app.getHttpServer())
        .put(`${testEndpoint}/insert-money`)
        .send({ money: [1, 0, 0, 0, 0, 0] })
        .expect(HttpStatus.OK)
        .expect(queryBusMock.execute());
    });

    it('should return 400 BAD REQUEST when payload is not an array', async () => {
      const response = await request(app.getHttpServer())
        .put(`${testEndpoint}/insert-money`)
        .send({ money: 'not an array' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when payload is an array with <6 elements', async () => {
      const response = await request(app.getHttpServer())
        .put(`${testEndpoint}/insert-money`)
        .send({ money: [0, 0, 0, 0, 1] })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when payload is an array with >6 elements', async () => {
      const response = await request(app.getHttpServer())
        .put(`${testEndpoint}/insert-money`)
        .send({ money: [0, 0, 0, 0, 0, 0, 1] })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when payload is not an array of 0 and 1 integers', async () => {
      const response = await request(app.getHttpServer())
        .put(`${testEndpoint}/insert-money`)
        .send({ money: ['0', '0', '0', '0', '0', '1'] })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });
  });

  describe('/POST buy-snack', () => {
    it('should return 200 OK', () => {
      return request(app.getHttpServer())
        .post(`${testEndpoint}/buy-snack`)
        .send({ position: 1 })
        .expect(HttpStatus.OK)
        .expect(queryBusMock.execute());
    });
  });

  describe('/POST return-money', () => {
    it('should return 200 OK', () => {
      return request(app.getHttpServer())
        .post(`${testEndpoint}/return-money`)
        .expect(HttpStatus.OK)
        .expect(queryBusMock.execute());
    });
  });

  describe('/GET money-in-machine', () => {
    it('should return 200 OK', () => {
      return request(app.getHttpServer())
        .get(`${testEndpoint}/money-in-machine`)
        .expect(HttpStatus.OK)
        .expect(queryBusMock.execute());
    });
  });
});
