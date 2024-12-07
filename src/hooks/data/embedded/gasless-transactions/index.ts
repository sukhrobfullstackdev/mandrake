import { Endpoint } from '@constants/endpoint';
import {
  GaslessTransactionStatusResponse,
  gaslessTransactionStatusFetch,
} from '@hooks/data/embedded/gasless-transactions/fetchers';
import {
  GaslessTransactionPollerParams,
  GaslessTransactionPollerQueryKey,
  gaslessTransactionQueryKeys,
} from '@hooks/data/embedded/gasless-transactions/keys';
import { HttpService } from '@lib/http-services';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { UseMutationResult, UseQueryOptions, UseQueryResult, useMutation, useQuery } from '@tanstack/react-query';
import { EIP712TypedData } from 'eth-sig-util';

interface SubmitGaslessTransactionParams {
  address: string;
  payload: EIP712TypedData;
  signedTransaction: string;
  clientId: string;
}

type GasApiResponse = {
  success: boolean;
  requestId: string;
  state: string;
  errorMessage?: string;
};

export const useSubmitGaslessTransactionMutation = (): UseMutationResult<
  GasApiResponse,
  ApiResponseError,
  SubmitGaslessTransactionParams
> => {
  return useMutation({
    mutationFn: (params: SubmitGaslessTransactionParams) => {
      const { address, payload, signedTransaction, clientId } = params;
      const body = {
        public_address: address,
        signature: signedTransaction,
        request_payload: payload.message,
        contract_address: payload.message.to,
        chain_id: Number(payload.domain.chainId),
        magic_client_id: clientId,
      };

      return HttpService.Gas.Post(Endpoint.Gas.SubmitGaslessRequest, {}, body);
    },
    gcTime: 1000,
  });
};

export const useGaslessTransactionStatusPollerQuery = (
  params: GaslessTransactionPollerParams,
  config?: Omit<
    UseQueryOptions<
      GaslessTransactionStatusResponse,
      Error,
      GaslessTransactionStatusResponse,
      GaslessTransactionPollerQueryKey
    >,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<GaslessTransactionStatusResponse, Error> =>
  useQuery({
    queryKey: gaslessTransactionQueryKeys.status(params),
    queryFn: gaslessTransactionStatusFetch(),
    ...config,
  });
