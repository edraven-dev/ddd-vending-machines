export class InvalidOperationException extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidOperationException.prototype);
  }
}
