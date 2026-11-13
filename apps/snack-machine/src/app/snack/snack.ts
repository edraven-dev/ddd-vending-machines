import { AggregateRoot, Id } from '@vending-machines/shared';

export class Snack extends AggregateRoot {
  static readonly None = new Snack(Id.from('00000000-0000-7000-8000-000000000000'), 'None');
  static readonly Chocolate = new Snack(Id.from('01a1d6fc-6819-7407-848a-bfb5746ee9b8'), 'Chocolate');
  static readonly Soda = new Snack(Id.from('01a1d6fc-687d-7c63-b6be-80b041969631'), 'Soda');
  static readonly Gum = new Snack(Id.from('01a1d6fc-68ee-7103-9989-0d47be47a684'), 'Gum');

  readonly name: string;

  private constructor(id: Id, name: string) {
    super(id);
    this.name = name;
  }
}
