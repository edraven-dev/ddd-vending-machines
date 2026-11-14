import { status } from '@grpc/grpc-js';
import { ArgumentsHost, BadRequestException, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { throwError } from 'rxjs';
import { InvalidOperationException } from './invalid-operation.exception';

@Catch(InvalidOperationException)
export class InvalidOperationExceptionFilter extends BaseExceptionFilter {
  override catch(exception: InvalidOperationException, host: ArgumentsHost) {
    if (host.getType() === 'rpc') {
      return throwError(() => ({ code: status.FAILED_PRECONDITION, message: exception.message }));
    }

    return super.catch(new BadRequestException(exception.message), host);
  }
}
