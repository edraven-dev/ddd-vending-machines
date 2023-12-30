import { HttpStatus, INestApplication, Module } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { ValidationProvider } from '@vending-machines/shared';
import request from 'supertest';
import { AtmRepository } from '../../../app/atm/atm.repository.interface';
import { AtmService } from '../../../app/atm/atm.service';

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
        { provide: AtmService, useValue: { loadMoney: jest.fn() } },
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
