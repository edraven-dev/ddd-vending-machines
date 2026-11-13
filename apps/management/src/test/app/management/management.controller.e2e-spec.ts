import { HttpStatus, INestApplication } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { Id, ValidationProvider } from '@vending-machines/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { LoadCashToAtmCommand } from '../../../app/management/commands/impl/load-cash-to-atm.command';
import { UnloadCashFromSnackMachineCommand } from '../../../app/management/commands/impl/unload-cash-from-snack-machine.command';
import { ManagementController } from '../../../app/management/management.controller';

describe('ManagementController - e2e', () => {
  const queryBusMock = { execute: () => ({ balance: '$1.00', cash: '$1.00' }) };
  const commandBusMock = { execute: vi.fn<CommandBus['execute']>() };
  const testEndpoint = (id: string) => `/management/${id}`;

  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ManagementController],
      providers: [
        ValidationProvider,
        { provide: QueryBus, useValue: queryBusMock },
        { provide: CommandBus, useValue: commandBusMock },
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
        .get(testEndpoint(Id.generate().value))
        .expect(HttpStatus.OK)
        .expect(queryBusMock.execute());
    });

    it('should return 400 BAD REQUEST when id is not a valid uuid', async () => {
      const response = await request(app.getHttpServer())
        .get(testEndpoint('not-valid-uuid'))
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when id is the nil uuid', async () => {
      const response = await request(app.getHttpServer())
        .get(testEndpoint('00000000-0000-0000-0000-000000000000'))
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });
  });

  describe('POST /', () => {
    it('should return 201 CREATED without a body', () => {
      return request(app.getHttpServer())
        .post(testEndpoint(''))
        .expect(HttpStatus.CREATED)
        .expect(queryBusMock.execute());
    });
  });

  describe('POST /:id/load-cash-to-atm/:atmId', () => {
    it('should return 200 OK and pass both ids to LoadCashToAtmCommand', async () => {
      const id = Id.generate();
      const atmId = Id.generate();

      await request(app.getHttpServer())
        .post(testEndpoint(`${id.value}/load-cash-to-atm/${atmId.value}`))
        .expect(HttpStatus.OK)
        .expect(queryBusMock.execute());

      expect(commandBusMock.execute.mock.lastCall).toStrictEqual([new LoadCashToAtmCommand(id, atmId)]);
    });

    it('should lowercase uppercase ids', async () => {
      const id = Id.generate();
      const atmId = Id.generate();

      await request(app.getHttpServer())
        .post(testEndpoint(`${id.value.toUpperCase()}/load-cash-to-atm/${atmId.value.toUpperCase()}`))
        .expect(HttpStatus.OK);

      expect(commandBusMock.execute.mock.lastCall).toStrictEqual([new LoadCashToAtmCommand(id, atmId)]);
    });

    it('should return 400 BAD REQUEST when id is not a valid uuid', async () => {
      const response = await request(app.getHttpServer())
        .post(testEndpoint(`not-valid-uuid/load-cash-to-atm/${Id.generate().value}`))
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when atmId is not a valid uuid', async () => {
      const response = await request(app.getHttpServer())
        .post(testEndpoint(`${Id.generate().value}/load-cash-to-atm/not-valid-uuid`))
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });
  });

  describe('POST /:id/unload-cash-from-snack-machine/:snackMachineId', () => {
    it('should return 200 OK and pass both ids to UnloadCashFromSnackMachineCommand', async () => {
      const id = Id.generate();
      const snackMachineId = Id.generate();

      await request(app.getHttpServer())
        .post(testEndpoint(`${id.value}/unload-cash-from-snack-machine/${snackMachineId.value}`))
        .expect(HttpStatus.OK)
        .expect(queryBusMock.execute());

      expect(commandBusMock.execute.mock.lastCall).toStrictEqual([
        new UnloadCashFromSnackMachineCommand(id, snackMachineId),
      ]);
    });

    it('should return 400 BAD REQUEST when id is not a valid uuid', async () => {
      const response = await request(app.getHttpServer())
        .post(testEndpoint(`not-valid-uuid/unload-cash-from-snack-machine/${Id.generate().value}`))
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });

    it('should return 400 BAD REQUEST when snackMachineId is not a valid uuid', async () => {
      const response = await request(app.getHttpServer())
        .post(testEndpoint(`${Id.generate().value}/unload-cash-from-snack-machine/not-valid-uuid`))
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toMatchSnapshot();
    });
  });
});
