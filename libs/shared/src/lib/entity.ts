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

// oxlint-disable-next-line typescript/no-explicit-any -- TypeScript requires a mixin constructor to take any[]
export function EntityMixin<TBase extends abstract new (...args: any[]) => { readonly id: string }>(Base: TBase) {
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
