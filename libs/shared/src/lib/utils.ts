import { Provider, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { InvalidOperationExceptionFilter } from './invalid-operation-exception.filter';

export const ValidationProvider: Provider = {
  provide: APP_PIPE,
  useValue: new ValidationPipe({ transform: true, whitelist: true }),
};

export const InvalidOperationExceptionFilterProvider: Provider = {
  provide: APP_FILTER,
  useClass: InvalidOperationExceptionFilter,
};
