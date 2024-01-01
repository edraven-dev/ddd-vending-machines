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

import { randomUUID } from 'crypto';
import { AtmController } from '../../../app/atm/atm.controller';

describe('AtmController - e2e', () => {
  const queryBusMock = { execute: jest.fn(async () => ({ moneyCharged: '$1.00', moneyInside: '$1.00' })) };
  const testEndpoint = (id: string) => `/atm/${id}`;

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
});
