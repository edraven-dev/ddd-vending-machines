export abstract class ValueObject {
  equals(object?: ValueObject): boolean {
    if (object == null || object == undefined) {
      return false;
    }

    if (!(object instanceof ValueObject)) {
      return false;
    }

    if (object === this) {
      return true;
    }

    return this.equalsCore(object);
  }

  protected abstract equalsCore(other: ValueObject): boolean;
}
