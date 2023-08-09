import { Provider, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null),
      );
    });
  });
}

export const ValidationProvider: Provider = {
  provide: APP_PIPE,
  useValue: new ValidationPipe({ transform: true, whitelist: true }),
};
