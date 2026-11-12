import { status } from '@grpc/grpc-js';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { lastValueFrom, Observable } from 'rxjs';
import { InvalidOperationExceptionFilter } from '../lib/invalid-operation-exception.filter';
import { InvalidOperationException } from '../lib/invalid-operation.exception';

describe('InvalidOperationExceptionFilter', () => {
  const filter = new InvalidOperationExceptionFilter();
  const exception = new InvalidOperationException('Cannot unload money during transaction');

  it('should respond with 400 BAD REQUEST over HTTP', () => {
    const response = { status: vi.fn<Response['status']>().mockReturnThis(), json: vi.fn<Response['json']>() };
    const host = { getType: () => 'http', switchToHttp: () => ({ getResponse: () => response }) };

    filter.catch(exception, host as unknown as ArgumentsHost);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({ statusCode: HttpStatus.BAD_REQUEST, message: exception.message });
  });

  it('should fail with FAILED_PRECONDITION over gRPC', async () => {
    const host = { getType: () => 'rpc' };

    const result = filter.catch(exception, host as unknown as ArgumentsHost) as Observable<never>;

    await expect(lastValueFrom(result)).rejects.toEqual({
      code: status.FAILED_PRECONDITION,
      message: exception.message,
    });
  });
});
