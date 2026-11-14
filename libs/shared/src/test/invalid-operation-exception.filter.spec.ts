import { status } from '@grpc/grpc-js';
import { ArgumentsHost, HttpServer, HttpStatus } from '@nestjs/common';
import { lastValueFrom, Observable } from 'rxjs';
import { InvalidOperationExceptionFilter } from '../lib/invalid-operation-exception.filter';
import { InvalidOperationException } from '../lib/invalid-operation.exception';

describe('InvalidOperationExceptionFilter', () => {
  const exception = new InvalidOperationException('Cannot unload money during transaction');

  it('should respond with the default 400 BAD REQUEST body over HTTP', () => {
    const reply = vi.fn<HttpServer['reply']>();
    const response = {};
    const applicationRef = { reply, isHeadersSent: () => false };
    const host = { getType: () => 'http', getArgByIndex: () => response };

    new InvalidOperationExceptionFilter(applicationRef as unknown as HttpServer).catch(
      exception,
      host as unknown as ArgumentsHost,
    );

    expect(reply).toHaveBeenCalledWith(
      response,
      { statusCode: HttpStatus.BAD_REQUEST, message: exception.message, error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );
  });

  it('should fail with FAILED_PRECONDITION over gRPC', async () => {
    const host = { getType: () => 'rpc' };

    const result = new InvalidOperationExceptionFilter().catch(exception, host as unknown as ArgumentsHost);

    await expect(lastValueFrom(result as Observable<never>)).rejects.toEqual({
      code: status.FAILED_PRECONDITION,
      message: exception.message,
    });
  });
});

describe('InvalidOperationException', () => {
  it('should be an Error named after its class', () => {
    const error = new InvalidOperationException('Not enough change');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(InvalidOperationException);
    expect(error.name).toBe('InvalidOperationException');
    expect(error.message).toBe('Not enough change');
  });
});
