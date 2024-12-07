import { getQueryClient } from '@common/query-client';
import { Endpoint } from '@constants/endpoint';
import { ETH_CHAINID, NET_VERSION } from '@constants/eth-rpc-methods';
import { JsonRpcRequestPayload, JsonRpcResponsePayload } from '@custom-types/json-rpc';
import {
  makeCustomNodeEthereumProxyFetcher,
  makeEthereumProxyFetcher,
} from '@hooks/data/embedded/ethereum-proxy/fetcher';
import { GasPriceEstimationResponse, gasPriceEstimationFetch } from '@hooks/data/embedded/ethereum-proxy/fetchers';
import {
  GasPriceEstimationParams,
  GasPriceEstimationQueryKey,
  ethereumProxyKeys,
} from '@hooks/data/embedded/ethereum-proxy/keys';
import { HttpService } from '@http-services';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { UseQueryOptions, UseQueryResult, useMutation, useQuery } from '@tanstack/react-query';

interface MagicApiEthProxyParams {
  payload: JsonRpcRequestPayload;
}

export function useMagicApiEthProxyQuery() {
  return useMutation({
    mutationFn: (params: MagicApiEthProxyParams): Promise<JsonRpcResponsePayload> => {
      const { payload } = params;

      const body = payload;

      return HttpService.Magic.Post(Endpoint.Ethereum.Proxy, {}, body);
    },
    retry: 2,
    gcTime: 1000,
  });
}

interface CustomNodeEthProxyParams {
  nodeUrl: string;
  payload: JsonRpcRequestPayload;
}

export function useCustomNodeEthProxyQuery() {
  return useMutation({
    mutationFn: (params: CustomNodeEthProxyParams): Promise<JsonRpcResponsePayload> => {
      const { payload, nodeUrl } = params;

      const body = payload;

      return HttpService.JSON.Post(nodeUrl, {}, body);
    },
    gcTime: 1000,
  });
}

export const useGetGasPriceEstimationQuery = (
  params: GasPriceEstimationParams,
  config?: Omit<
    UseQueryOptions<
      GasPriceEstimationResponse,
      ApiResponseError,
      GasPriceEstimationResponse,
      GasPriceEstimationQueryKey
    >,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<GasPriceEstimationResponse, ApiResponseError> =>
  useQuery({
    queryKey: ethereumProxyKeys.gasPriceEstimation(params),
    queryFn: gasPriceEstimationFetch(),
    ...config,
  });

/** This needs to be consolidated with the hooks in ethereum-proxy.ts */
export function ethereumNodeEthProxyQuery(payload: JsonRpcRequestPayload) {
  const queryClient = getQueryClient();

  const queryFn = makeEthereumProxyFetcher();

  const config =
    payload.method === ETH_CHAINID || payload.method === NET_VERSION
      ? { gcTime: 1000 * 60 * 30, staleTime: 1000 * 60 * 15 }
      : { gcTime: 1000 };

  return queryClient.fetchQuery({
    queryKey: ethereumProxyKeys.ethereumProxy(payload),
    queryFn,
    ...config,
  });
}

/** This needs to be consolidated with the hooks in ethereum-proxy.ts */
export function customNodeQuery(payload: JsonRpcRequestPayload, nodeUrl: string) {
  const queryClient = getQueryClient();

  const queryFn = makeCustomNodeEthereumProxyFetcher();

  const config =
    payload.method === ETH_CHAINID || payload.method === NET_VERSION
      ? { gcTime: 1000 * 60 * 30, staleTime: 1000 * 60 * 15 }
      : { gcTime: 1000 };

  return queryClient.fetchQuery({
    queryKey: ethereumProxyKeys.customNode({ payload, nodeUrl }),
    queryFn,
    ...config,
  });
}
