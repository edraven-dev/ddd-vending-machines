import type { Id } from './id';

const sameId = (a: Id | string, b: Id | string): boolean =>
  typeof a === 'string' || typeof b === 'string' ? a === b : a.equals(b);

export abstract class Entity<TId extends Id | string = Id> {
  readonly id: TId;

  constructor(id: TId) {
    this.id = id;
  }

  equals(other: unknown): boolean {
    if (other === this) {
      return true;
    }

    return (
      other instanceof Entity &&
      Object.getPrototypeOf(other) === Object.getPrototypeOf(this) &&
      sameId(this.id, other.id)
    );
  }
}
