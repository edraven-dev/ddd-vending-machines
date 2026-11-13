export abstract class ValueObject {
  equals(other: unknown): boolean {
    return other === this || (this.isSameType(other) && this.equalsCore(other));
  }

  protected abstract equalsCore(other: this): boolean;

  private isSameType(other: unknown): other is this {
    return other instanceof ValueObject && Object.getPrototypeOf(other) === Object.getPrototypeOf(this);
  }
}
