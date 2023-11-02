import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { InvalidOperationException } from './invalid-operation.exception';

@Catch(InvalidOperationException)
export class InvalidOperationExceptionFilter implements ExceptionFilter {
  catch(exception: InvalidOperationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
    });
  }
}
