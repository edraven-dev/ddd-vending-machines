import { HttpStatus, INestApplication, Module } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { HeadOfficeRepository } from '../../../app/management/head-office.repository.interface';

@Module({
  providers: [{ provide: HeadOfficeRepository, useValue: { findOne: jest.fn(), save: jest.fn() } }],
  exports: [HeadOfficeRepository],
})
class DatabaseModuleMock {}
jest.mock('../../../app/database/database.module', () => {
  return {
    DatabaseModule: DatabaseModuleMock,
  };
});

import { ValidationProvider } from '@vending-machines/shared';
import { randomUUID } from 'crypto';
import { ManagementController } from '../../../app/management/management.controller';

describe('ManagementController - e2e', () => {
  const queryBusMock = { execute: () => ({ balance: '$1.00', cash: '$1.00' }) };
  const testEndpoint = (id: string) => `/management/${id}`;

  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ManagementController],
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

  describe('GET /:id', () => {
    it('should return 200 OK', () => {
      return request(app.getHttpServer())
        .get(testEndpoint(randomUUID()))
        .expect(HttpStatus.OK)
        .expect(queryBusMock.execute());
    });

    it('should return 400 BAD REQUEST when id is not a valid uuid', async () => {
      const response = await request(app.getHttpServer())
        .get(testEndpoint('not-valid-uuid'))
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });
  });
});
