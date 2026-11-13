import { status } from '@grpc/grpc-js';
import {
  GatewayTimeoutException,
  HttpException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InvalidOperationException } from '@vending-machines/shared';
import { lastValueFrom, of, throwError } from 'rxjs';
import { mapGrpcErrors } from '../../../../app/management/proto-clients/map-grpc-errors';

describe('mapGrpcErrors', () => {
  const fail = (code: status, details: string) =>
    lastValueFrom(throwError(() => ({ code, details })).pipe(mapGrpcErrors));

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should pass values through', async () => {
    await expect(lastValueFrom(of('value').pipe(mapGrpcErrors))).resolves.toBe('value');
  });

  it('should map FAILED_PRECONDITION to InvalidOperationException', async () => {
    const result = fail(status.FAILED_PRECONDITION, 'Cannot unload money during transaction');

    await expect(result).rejects.toBeInstanceOf(InvalidOperationException);
    await expect(result).rejects.toThrow('Cannot unload money during transaction');
  });

  it('should map NOT_FOUND to NotFoundException', async () => {
    const result = fail(status.NOT_FOUND, 'Atm with id 1 not found');

    await expect(result).rejects.toBeInstanceOf(NotFoundException);
    await expect(result).rejects.toThrow('Atm with id 1 not found');
  });

  it.each([
    { name: 'UNAVAILABLE', code: status.UNAVAILABLE, exception: ServiceUnavailableException, httpStatus: 503 },
    { name: 'DEADLINE_EXCEEDED', code: status.DEADLINE_EXCEEDED, exception: GatewayTimeoutException, httpStatus: 504 },
  ])(
    'should map $name to $httpStatus and log the details instead of exposing them',
    async ({ name, code, exception, httpStatus }) => {
      const warn = vi.spyOn(Logger, 'warn').mockImplementation(() => undefined);
      const details = 'No connection established. Last error: connect ECONNREFUSED 127.0.0.1:40051';

      const error = await fail(code, details).catch((caught: unknown) => caught);

      if (!(error instanceof HttpException)) {
        throw new Error('Expected an HttpException');
      }
      expect(error).toBeInstanceOf(exception);
      expect(error.getStatus()).toBe(httpStatus);
      expect(JSON.stringify(error.getResponse())).not.toContain('ECONNREFUSED');
      expect(warn).toHaveBeenCalledWith(`${name}: ${details}`, 'mapGrpcErrors');
    },
  );

  it.each([
    ['INVALID_ARGUMENT', status.INVALID_ARGUMENT],
    ['ALREADY_EXISTS', status.ALREADY_EXISTS],
    ['INTERNAL', status.INTERNAL],
  ])('should rethrow %s unchanged as a server error', async (_name, code) => {
    const error = { code, details: 'details' };

    await expect(lastValueFrom(throwError(() => error).pipe(mapGrpcErrors))).rejects.toBe(error);
  });
});
