import { Money } from '../lib/money';
import { ValueObject } from '../lib/value-object';

class Price extends ValueObject {
  constructor(readonly amount: { cents: number }) {
    super();
  }

  protected equalsCore(other: this): boolean {
    return this.amount.cents === other.amount.cents;
  }
}

describe('ValueObject', () => {
  it('should equal itself', () => {
    const price = new Price({ cents: 100 });

    expect(price.equals(price)).toBe(true);
  });

  it('should equal another value of the same type with the same components', () => {
    expect(new Price({ cents: 100 }).equals(new Price({ cents: 100 }))).toBe(true);
  });

  it('should not equal a value of the same type with other components', () => {
    expect(new Price({ cents: 100 }).equals(new Price({ cents: 200 }))).toBe(false);
  });

  it('should not compare components of another value type, in either direction', () => {
    expect(new Price({ cents: 100 }).equals(Money.None)).toBe(false);
    expect(Money.None.equals(new Price({ cents: 100 }))).toBe(false);
  });

  it.each([null, undefined, 100, { amount: { cents: 100 } }])('should not equal %o', (other) => {
    expect(new Price({ cents: 100 }).equals(other)).toBe(false);
  });
});
