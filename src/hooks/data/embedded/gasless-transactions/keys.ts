export type GaslessTransactionPollerQueryKey = ReturnType<typeof gaslessTransactionQueryKeys.status>;

export type GaslessTransactionPollerParams = {
  requestId: string;
};

export const gaslessTransactionQueryKeys = {
  base: ['gasless-transaction'] as const,
  status: (params: GaslessTransactionPollerParams) =>
    [[...gaslessTransactionQueryKeys.base, 'status'], params] as const,
};
