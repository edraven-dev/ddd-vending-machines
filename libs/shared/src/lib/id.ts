import { randomUUIDv7 } from 'node:crypto';
import { ensure, isString, Predicate, TinyType } from 'tiny-types';
import { z } from 'zod';

const uuidV7 = z.uuidv7();

const isLowercaseUuidV7 = Predicate.to<string>(
  'be a lowercase UUID v7',
  (value) => value === value.toLowerCase() && uuidV7.safeParse(value).success,
);

export class Id extends TinyType {
  readonly value: string;

  private constructor(value: string) {
    super();
    this.value = ensure(Id.name, value, isString(), isLowercaseUuidV7);
  }

  static from(value: string): Id {
    return new Id(value);
  }

  static generate(): Id {
    return new Id(randomUUIDv7());
  }

  override toString(): string {
    return this.value;
  }
}

export const idSchema = uuidV7.toLowerCase().transform((value) => Id.from(value));
