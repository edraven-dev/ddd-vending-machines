import { type ServiceError, status } from '@grpc/grpc-js';
import { NotFoundException } from '@nestjs/common';
import { InvalidOperationException } from '@vending-machines/shared';
import { catchError, type Observable, throwError } from 'rxjs';

const toException = (error: ServiceError) => {
  switch (error.code) {
    case status.FAILED_PRECONDITION:
      return new InvalidOperationException(error.details);
    case status.NOT_FOUND:
      return new NotFoundException(error.details);
    default:
      return error;
  }
};

export const mapGrpcErrors = <T>(source: Observable<T>): Observable<T> =>
  source.pipe(catchError((error: ServiceError) => throwError(() => toException(error))));
