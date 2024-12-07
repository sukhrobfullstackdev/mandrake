/* istanbul ignore file */

import { GetBalanceParams, getBalance } from '@hooks/data/embedded/block/fetchers';
import { GetBalanceQueryKey, blockQueryKeys } from '@hooks/data/embedded/block/keys';
import { useSuspenseQuery } from '@tanstack/react-query';

export const useBalance = (params: GetBalanceParams) => {
  const { data, ...rest } = useSuspenseQuery<bigint, Error, bigint, GetBalanceQueryKey>({
    queryKey: blockQueryKeys.getBalance(params),
    queryFn: async ({ queryKey: [, { chainId, address }] }) => {
      return getBalance({ chainId, address });
    },
    refetchOnWindowFocus: true,
    gcTime: 1000 * 60 * 2, // 2 minutes
    retry: false,
  });

  return { balance: data, ...rest };
};
