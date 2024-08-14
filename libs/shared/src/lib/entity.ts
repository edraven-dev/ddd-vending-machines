import { DEFAULT_ID } from './constants';

export abstract class Entity {
  readonly id: string;

  constructor(id?: string) {
    this.id = id || DEFAULT_ID;
  }

  equals(object?: Entity): boolean {
    if (object == null || object == undefined) {
      return false;
    }

    if (!(object instanceof Entity)) {
      return false;
    }

    if (object === this) {
      return true;
    }

    return this.id === object.id;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EntityMixin<TBase extends abstract new (...args: any[]) => { id: string }>(Base: TBase) {
  abstract class EntityExtendedWithBase extends Base {
    equals(object?: Entity): boolean {
      if (object == null || object == undefined) {
        return false;
      }

      if (!(object instanceof Entity)) {
        return false;
      }

      if (object === this) {
        return true;
      }

      return this.id === object.id;
    }
  }

  return EntityExtendedWithBase;
}
