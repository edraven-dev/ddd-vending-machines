import { type ServiceError, status } from '@grpc/grpc-js';
import { GatewayTimeoutException, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InvalidOperationException } from '@vending-machines/shared';
import { catchError, type Observable, throwError } from 'rxjs';

const toException = (error: ServiceError) => {
  switch (error.code) {
    case status.FAILED_PRECONDITION:
      return new InvalidOperationException(error.details);
    case status.NOT_FOUND:
      return new NotFoundException(error.details);
    case status.UNAVAILABLE:
      Logger.warn(`${status[error.code]}: ${error.details}`, 'mapGrpcErrors');
      return new ServiceUnavailableException();
    case status.DEADLINE_EXCEEDED:
      Logger.warn(`${status[error.code]}: ${error.details}`, 'mapGrpcErrors');
      return new GatewayTimeoutException();
    default:
      return error;
  }
};

export const mapGrpcErrors = <T>(source: Observable<T>): Observable<T> =>
  source.pipe(catchError((error: ServiceError) => throwError(() => toException(error))));
