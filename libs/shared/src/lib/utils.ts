import { Provider, StandardSchemaValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { HttpExceptionFilter } from './http-exception.filter';
import { InvalidOperationExceptionFilter } from './invalid-operation-exception.filter';

export const ValidationProvider: Provider = {
  provide: APP_PIPE,
  useClass: StandardSchemaValidationPipe,
};

export const InvalidOperationExceptionFilterProvider: Provider = {
  provide: APP_FILTER,
  useClass: InvalidOperationExceptionFilter,
};

export const HttpExceptionFilterProvider: Provider = {
  provide: APP_FILTER,
  useClass: HttpExceptionFilter,
};
