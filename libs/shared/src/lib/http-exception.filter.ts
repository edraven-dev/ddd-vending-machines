import { status } from '@grpc/grpc-js';
import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { throwError } from 'rxjs';

const GRPC_STATUS_BY_HTTP_STATUS: Partial<Record<number, status>> = {
  [HttpStatus.BAD_REQUEST]: status.INVALID_ARGUMENT,
  [HttpStatus.NOT_FOUND]: status.NOT_FOUND,
  [HttpStatus.CONFLICT]: status.ALREADY_EXISTS,
};

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  override catch(exception: HttpException, host: ArgumentsHost) {
    if (host.getType() === 'rpc') {
      const response = exception.getResponse();
      const message = typeof response === 'object' && 'message' in response ? response.message : undefined;

      return throwError(() => ({
        code: GRPC_STATUS_BY_HTTP_STATUS[exception.getStatus()] ?? status.UNKNOWN,
        message: Array.isArray(message) ? message.join('; ') : exception.message,
      }));
    }

    return super.catch(exception, host);
  }
}
