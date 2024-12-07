'use client';

import { NftTokenInfo, PaypalClientToken, PaypalOrderDetails, WalletProvider } from '@custom-types/nft';
import {
  GetBalanceOfNftParams,
  GetCurrentStageParams,
  GetNetworkFeeParams,
  GetPaypalClientTokenParams,
  GetPaypalOrderDetailsParams,
  IsAllowListParams,
  makeBalanceOfNftFetcher,
  makeGetCurrentStageFetcher,
  makeGetFallbackNetworkFee,
  makeIsAllowListFetcher,
  makeNftTokenInfoFetcher,
  makePaypalClientTokenFetcher,
  makePaypalOrderDetailsFetcher,
  maketNetworkFeeFetcher,
} from '@hooks/data/embedded/nft/fetchers';
import {
  GetBalanceOfNftQueryKey,
  GetCurrentStageQueryKey,
  GetFallbackNetworkFeeQueryKey,
  GetNetworkFeeQueryKey,
  GetNftTokenInfoQueryKey,
  GetPaypalClientTokenQueryKey,
  GetPaypalOrderDetailsQueryKey,
  IsAllowListParamsQueryKey,
  nftQueryKeys,
} from '@hooks/data/embedded/nft/keys';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { NFTCheckoutRequest } from '@magic-sdk/types';
import {
  UseQueryOptions,
  UseQueryResult,
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';

export const useNftTokenInfo = (
  params: { contractId: string; tokenId: string },
  config?: Omit<UseQueryOptions<NftTokenInfo, Error, NftTokenInfo, GetNftTokenInfoQueryKey>, 'queryKey' | 'queryFn'>,
) => {
  return useSuspenseQuery<NftTokenInfo, Error, NftTokenInfo, GetNftTokenInfoQueryKey>({
    queryKey: nftQueryKeys.getNftTokenInfo(params),
    queryFn: makeNftTokenInfoFetcher(),
    ...config,
  });
};

export const usePaypalClientToken = (
  params: GetPaypalClientTokenParams,
  config?: Omit<
    UseQueryOptions<PaypalClientToken, Error, PaypalClientToken, GetPaypalClientTokenQueryKey>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useSuspenseQuery<PaypalClientToken, Error, PaypalClientToken, GetPaypalClientTokenQueryKey>({
    queryKey: nftQueryKeys.getPaypalClientToken(params),
    queryFn: makePaypalClientTokenFetcher(),
    ...config,
  });
};

export const usePaypalOrderDetails = (
  params: GetPaypalOrderDetailsParams,
  config?: Omit<
    UseQueryOptions<PaypalOrderDetails, Error, PaypalOrderDetails, GetPaypalOrderDetailsQueryKey>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useSuspenseQuery<PaypalOrderDetails, Error, PaypalOrderDetails, GetPaypalOrderDetailsQueryKey>({
    queryKey: nftQueryKeys.getPaypalOrderDetails(params),
    queryFn: makePaypalOrderDetailsFetcher(),
    ...config,
  });
};

export const useNftCheckoutPayload = () => {
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  // TODO: we need to check if the payload is valid
  // e.g. const validation = schema.safeParse(activeRpcPayload?.params?.[0]);
  // But, for now, we just return the payload as is because of performance reasons

  const payload = activeRpcPayload?.params?.[0] as NFTCheckoutRequest & {
    walletProvider?: WalletProvider; // TODO: it will be included in NFTCheckoutRequest
  };

  // Quantity must be a positive integer or undefined
  if (payload?.quantity && payload.quantity < 1) {
    throw new Error('Invalid payload');
  }

  return { nftCheckoutPayload: payload };
};

export const useNetworkFee = (
  params: GetNetworkFeeParams,
  config?: Omit<UseSuspenseQueryOptions<string, Error, string, GetNetworkFeeQueryKey>, 'queryKey' | 'queryFn'>,
): UseSuspenseQueryResult<string> => {
  return useSuspenseQuery<string, Error, string, GetNetworkFeeQueryKey>({
    queryKey: nftQueryKeys.getNetworkFee(params),
    queryFn: maketNetworkFeeFetcher(),
    gcTime: 1000,
    refetchOnWindowFocus: false,
    ...config,
  });
};

export const useBalanceOfNft = (
  params: GetBalanceOfNftParams,
  config?: Omit<UseSuspenseQueryOptions<bigint, Error, bigint, GetBalanceOfNftQueryKey>, 'queryKey' | 'queryFn'>,
): UseSuspenseQueryResult<bigint> => {
  return useSuspenseQuery<bigint, Error, bigint, GetBalanceOfNftQueryKey>({
    queryKey: nftQueryKeys.getBalanceOfNft(params),
    queryFn: makeBalanceOfNftFetcher(),
    gcTime: 1000,
    refetchOnWindowFocus: false,
    ...config,
  });
};

export const useIsAllowList = (
  params: IsAllowListParams,
  config?: Omit<UseSuspenseQueryOptions<boolean, Error, boolean, IsAllowListParamsQueryKey>, 'queryKey' | 'queryFn'>,
): UseSuspenseQueryResult<boolean> => {
  return useSuspenseQuery<boolean, Error, boolean, IsAllowListParamsQueryKey>({
    queryKey: nftQueryKeys.isAllowList(params),
    queryFn: makeIsAllowListFetcher(),
    gcTime: 1000,
    refetchOnWindowFocus: false,
    ...config,
  });
};

export const useCurrentStage = (
  params: GetCurrentStageParams,
  config?: Omit<UseSuspenseQueryOptions<number, Error, number, GetCurrentStageQueryKey>, 'queryKey' | 'queryFn'>,
): UseSuspenseQueryResult<number> => {
  return useSuspenseQuery<number, Error, number, GetCurrentStageQueryKey>({
    queryKey: nftQueryKeys.getCurrentStage(params),
    queryFn: makeGetCurrentStageFetcher(),
    gcTime: 1000,
    refetchOnWindowFocus: false,
    ...config,
  });
};

export const useFallbackNetworkFee = (
  config?: Omit<UseQueryOptions<bigint, Error, bigint, GetFallbackNetworkFeeQueryKey>, 'queryKey' | 'queryFn'>,
): UseQueryResult<bigint> => {
  return useQuery<bigint, Error, bigint, GetFallbackNetworkFeeQueryKey>({
    queryKey: nftQueryKeys.getFallbackNetworkFee(),
    queryFn: makeGetFallbackNetworkFee(),
    gcTime: 1000,
    refetchOnWindowFocus: false,
    ...config,
  });
};
