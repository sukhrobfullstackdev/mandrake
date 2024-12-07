import { GetBalanceParams } from '@hooks/data/embedded/block/fetchers';

export const blockQueryKeys = {
  base: ['block'] as const,

  getBalance: (params: GetBalanceParams) => [[...blockQueryKeys.base, 'balance'], params] as const,
};

export type GetBalanceQueryKey = ReturnType<typeof blockQueryKeys.getBalance>;
