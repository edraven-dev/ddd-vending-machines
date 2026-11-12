import { status } from '@grpc/grpc-js';
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { throwError } from 'rxjs';
import { InvalidOperationException } from './invalid-operation.exception';

@Catch(InvalidOperationException)
export class InvalidOperationExceptionFilter implements ExceptionFilter {
  catch(exception: InvalidOperationException, host: ArgumentsHost) {
    if (host.getType() === 'rpc') {
      return throwError(() => ({ code: status.FAILED_PRECONDITION, message: exception.message }));
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    return response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
    });
  }
}
