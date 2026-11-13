import { allSettledOrThrow } from '../../../app/management/all-settled-or-throw';

describe('allSettledOrThrow', () => {
  it('should resolve when every promise fulfils', async () => {
    await expect(allSettledOrThrow([Promise.resolve(1), Promise.resolve('two')])).resolves.toBeUndefined();
  });

  it('should reject with the first failure in input order', async () => {
    const first = new Error('first');

    await expect(
      allSettledOrThrow([Promise.resolve(), Promise.reject(first), Promise.reject(new Error('second'))]),
    ).rejects.toBe(first);
  });

  it('should wait for every promise before rejecting', async () => {
    let slowSettled = false;
    const slow = new Promise<void>((resolve) => {
      setTimeout(() => {
        slowSettled = true;
        resolve();
      }, 10);
    });

    await expect(allSettledOrThrow([Promise.reject(new Error('fast')), slow])).rejects.toThrow('fast');
    expect(slowSettled).toBe(true);
  });
});
