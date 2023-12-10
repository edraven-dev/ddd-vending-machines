const id = '00000000-0000-0000-0000-000000000000';

export abstract class Entity {
  readonly id: string = id;

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

// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
export function EntityMixin<TBase extends abstract new (...args: any[]) => {}>(Base: TBase) {
  abstract class EntityExtendedWithBase extends Base {
    readonly id: string = id;

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
