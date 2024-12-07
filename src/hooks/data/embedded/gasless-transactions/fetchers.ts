import { GaslessTransactionPollerQueryKey } from '@hooks/data/embedded/gasless-transactions/keys';
import { getRequestState } from '@lib/utils/gasless-transactions';
import { QueryFunction } from '@tanstack/react-query';

export type GaslessTransactionStatusResponse = {
  state: 'COMPLETED' | 'FAILED' | string;
};

export type GaslessTransactionParams = {
  requestId: string;
};

export const gaslessTransactionStatusFetch =
  (): QueryFunction<GaslessTransactionStatusResponse, GaslessTransactionPollerQueryKey> =>
  ({ queryKey: [, { requestId }] }) => {
    return getRequestState({ requestId });
  };
