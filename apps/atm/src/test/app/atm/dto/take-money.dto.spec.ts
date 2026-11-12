import Currency from 'currency.js';
import { takeMoneySchema } from '../../../../app/atm/dto/take-money.dto';

describe('takeMoneySchema', () => {
  it.each([
    ['20', 20],
    ['20.00', 20],
    ['$20', 20],
    ['-$20.00', -20],
    ['1,000.00', 1000],
    ['1,234,567.89', 1234567.89],
    ['0', 0],
    ['.50', 0.5],
  ])('should parse %j into a currency', (amount, expected) => {
    const result = takeMoneySchema.safeParse({ amount });

    expect(result.success).toBe(true);
    expect(result.data?.amount).toBeInstanceOf(Currency);
    expect(result.data?.amount.value).toBe(expected);
  });

  it.each(['20.001', '20.1', '01', '1,00', '$-20', '20$', ' 20', '', '$', 'abc', '1e3'])(
    'should reject %j',
    (amount) => {
      const result = takeMoneySchema.safeParse({ amount });

      expect(result.success).toBe(false);
      expect(result.error?.issues).toEqual([
        expect.objectContaining({ path: ['amount'], message: 'Invalid currency' }),
      ]);
    },
  );

  it('should reject a number', () => {
    expect(takeMoneySchema.safeParse({ amount: 20 }).success).toBe(false);
  });
});
