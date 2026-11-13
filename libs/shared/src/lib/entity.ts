import type { Id } from './id';

export abstract class Entity {
  readonly id: Id;

  constructor(id: Id) {
    this.id = id;
  }

  equals(other: unknown): boolean {
    if (other === this) {
      return true;
    }

    return (
      other instanceof Entity &&
      Object.getPrototypeOf(other) === Object.getPrototypeOf(this) &&
      this.id.equals(other.id)
    );
  }
}
