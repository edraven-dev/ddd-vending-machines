import { AggregateRoot } from '@vending-machines/shared';

export class Snack extends AggregateRoot {
  static readonly None = new Snack('00000000-0000-0000-0000-000000000000', 'None');
  static readonly Chocolate = new Snack('ad277203-e35d-4ffe-a03f-6630ea3302cc', 'Chocolate');
  static readonly Soda = new Snack('2551785a-6b0d-4069-bf51-e60fc76588fd', 'Soda');
  static readonly Gum = new Snack('31ca7cbd-4635-4f2e-9a19-6e6f7d4bdad1', 'Gum');

  readonly name: string;

  private constructor(id: string, name: string) {
    super();
    Object.assign(this, { id });
    this.name = name;
  }
}
