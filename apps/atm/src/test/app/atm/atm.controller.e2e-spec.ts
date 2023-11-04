import { HttpStatus, INestApplication, Module } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AtmRepository } from '../../../app/atm/atm.repository.interface';

@Module({
  providers: [{ provide: AtmRepository, useValue: { findOne: jest.fn(), save: jest.fn() } }],
  exports: [AtmRepository],
})
class DatabaseModuleMock {}
jest.mock('../../../app/database/database.module', () => {
  return {
    DatabaseModule: DatabaseModuleMock,
  };
});

import { ValidationProvider } from '@vending-machines/shared';
import { AtmController } from '../../../app/atm/atm.controller';

describe('AtmController - e2e', () => {
  const queryBusMock = { execute: () => ({ moneyCharged: '$1.00', moneyInside: '$1.00' }) };
  const testEndpoint = '/atm';

  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AtmController],
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

  describe('GET /', () => {
    it('should return 200 OK', () => {
      return request(app.getHttpServer()).get(testEndpoint).expect(HttpStatus.OK).expect(queryBusMock.execute());
    });
  });

  describe('PUT /load-money', () => {
    it('should return 200 OK', () => {
      return request(app.getHttpServer())
        .put(`${testEndpoint}/load-money`)
        .send({ money: [1, 0, 0, 0, 0, 0] })
        .expect(HttpStatus.OK)
        .expect(queryBusMock.execute());
    });

    it('should return 400 BAD REQUEST when payload is not an array', async () => {
      const response = await request(app.getHttpServer())
        .put(`${testEndpoint}/load-money`)
        .send({ money: 'not an array' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when payload is an array with <6 elements', async () => {
      const response = await request(app.getHttpServer())
        .put(`${testEndpoint}/load-money`)
        .send({ money: [0, 0, 0, 0, 1] })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when payload is an array with >6 elements', async () => {
      const response = await request(app.getHttpServer())
        .put(`${testEndpoint}/load-money`)
        .send({ money: [0, 0, 0, 0, 0, 0, 1] })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when payload is not an array of integers', async () => {
      const response = await request(app.getHttpServer())
        .put(`${testEndpoint}/load-money`)
        .send({ money: [0, 0, 0, 0, 0, 0.1] })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });
  });

  describe('POST /take-money', () => {
    it('should return 200 OK', () => {
      return request(app.getHttpServer())
        .post(`${testEndpoint}/take-money`)
        .send({ amount: '20' })
        .expect(HttpStatus.OK)
        .expect(queryBusMock.execute());
    });

    it('should return 400 BAD REQUEST when payload is not a valid currency', async () => {
      const response = await request(app.getHttpServer())
        .post(`${testEndpoint}/take-money`)
        .send({ amount: '20.001' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });
  });
});
