export const allSettledOrThrow = async (promises: readonly Promise<unknown>[]): Promise<void> => {
  const failure = (await Promise.allSettled(promises)).find((result) => result.status === 'rejected');
  if (failure) {
    throw failure.reason;
  }
};
