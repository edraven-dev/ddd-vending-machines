import { randomUUIDv7 } from 'node:crypto';
import { ensure, isString, matches, TinyType } from 'tiny-types';
import { z } from 'zod';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export class Id extends TinyType {
  readonly value: string;

  private constructor(value: string) {
    super();
    this.value = ensure(Id.name, value, isString(), matches(UUID_PATTERN));
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

export const idSchema = z
  .uuid({ abort: true })
  .toLowerCase()
  .refine((value) => UUID_PATTERN.test(value), 'Invalid UUID')
  .transform((value) => Id.from(value));
