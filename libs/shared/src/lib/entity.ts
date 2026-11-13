import { DEFAULT_ID } from './constants';

export abstract class Entity {
  readonly id: string;

  constructor(id?: string) {
    this.id = id || DEFAULT_ID;
  }

  equals(other: unknown): boolean {
    if (other === this) {
      return true;
    }

    return (
      other instanceof Entity && Object.getPrototypeOf(other) === Object.getPrototypeOf(this) && other.id === this.id
    );
  }
}
