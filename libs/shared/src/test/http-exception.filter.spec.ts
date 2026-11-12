import { status } from '@grpc/grpc-js';
import {
  ArgumentsHost,
  BadRequestException,
  ConflictException,
  HttpException,
  HttpServer,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { lastValueFrom, Observable } from 'rxjs';
import { HttpExceptionFilter } from '../lib/http-exception.filter';

describe('HttpExceptionFilter', () => {
  const catchOverGrpc = (exception: HttpException) => {
    const host = { getType: () => 'rpc' };

    return lastValueFrom(
      new HttpExceptionFilter().catch(exception, host as unknown as ArgumentsHost) as Observable<never>,
    );
  };

  it('should fail with NOT_FOUND over gRPC', async () => {
    await expect(catchOverGrpc(new NotFoundException('Snack machine not found'))).rejects.toEqual({
      code: status.NOT_FOUND,
      message: 'Snack machine not found',
    });
  });

  it('should fail with INVALID_ARGUMENT over gRPC with every validation message', async () => {
    await expect(catchOverGrpc(new BadRequestException(['id: Invalid UUID', 'money: Too small']))).rejects.toEqual({
      code: status.INVALID_ARGUMENT,
      message: 'id: Invalid UUID; money: Too small',
    });
  });

  it('should fail with UNKNOWN over gRPC for other HTTP exceptions', async () => {
    await expect(catchOverGrpc(new ConflictException('Already exists'))).rejects.toEqual({
      code: status.UNKNOWN,
      message: 'Already exists',
    });
  });

  it('should use the message of an HTTP exception with a plain string response', async () => {
    await expect(catchOverGrpc(new HttpException('Out of order', HttpStatus.SERVICE_UNAVAILABLE))).rejects.toEqual({
      code: status.UNKNOWN,
      message: 'Out of order',
    });
  });

  it('should leave HTTP responses to the default exception handling', () => {
    const reply = vi.fn<HttpServer['reply']>();
    const response = {};
    const applicationRef = { reply, isHeadersSent: () => false };
    const host = { getType: () => 'http', getArgByIndex: () => response };

    new HttpExceptionFilter(applicationRef as unknown as HttpServer).catch(
      new NotFoundException('Snack machine not found'),
      host as unknown as ArgumentsHost,
    );

    expect(reply).toHaveBeenCalledWith(
      response,
      { statusCode: HttpStatus.NOT_FOUND, message: 'Snack machine not found', error: 'Not Found' },
      HttpStatus.NOT_FOUND,
    );
  });
});
