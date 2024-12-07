import { evmErc20TokensFetch, flowUsdcTokensFetch, tokenPriceFetch } from '@hooks/data/embedded/token/fetchers';
import { EvmErc20TokensQueryKey, FlowUsdcTokensQueryKey, TokenPriceQueryKey } from '@hooks/data/embedded/token/keys';
import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

export type TokenPrice = {
  toCurrencyAmountDisplay: string;
};

export interface TokenBalances {
  balance: string;
  contractAddress: string;
  decimals: number;
  logo: undefined | string;
  name: string;
  rawBalance: string;
  symbol: string;
  isFlowUsdc?: boolean;
}

export interface GetTokensForOwnerResponse {
  pageKey?: string;
  tokens: TokenBalances[];
}

export const useTokenPriceQuery = (
  queryKey: TokenPriceQueryKey,
  config?: Omit<UseQueryOptions<TokenPrice, Error, TokenPrice, TokenPriceQueryKey>, 'queryKey' | 'queryFn'>,
): UseQueryResult<TokenPrice> => {
  const queryFn = tokenPriceFetch();

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...config,
  });
};

export const useEvmErc20TokensQuery = (
  queryKey: EvmErc20TokensQueryKey,
  config?: Omit<
    UseQueryOptions<GetTokensForOwnerResponse, Error, GetTokensForOwnerResponse, EvmErc20TokensQueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<GetTokensForOwnerResponse> => {
  const queryFn = evmErc20TokensFetch();

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...config,
  });
};

export const useFlowUsdcTokensQuery = (
  queryKey: FlowUsdcTokensQueryKey,
  config?: Omit<
    UseQueryOptions<GetTokensForOwnerResponse, Error, GetTokensForOwnerResponse, FlowUsdcTokensQueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<GetTokensForOwnerResponse> => {
  const queryFn = flowUsdcTokensFetch();

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...config,
  });
};
