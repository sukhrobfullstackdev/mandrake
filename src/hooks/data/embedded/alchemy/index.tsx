import {
  GetNftsForOwnerParams,
  GetSingleNftForOwnerParams,
  GetSingleNftParams,
  GetTransactionReceiptParams,
  makeGetNFtsForOwnerFetcher,
  makeGetSingleNFtForOwnerFetcher,
  makeGetSingleNftFetcher,
  makeGetTransactionReceiptFetcher,
} from '@hooks/data/embedded/alchemy/fetchers';
import {
  GetNftsForOwnerQueryKey,
  GetSingleNftForOwnerQueryKey,
  GetSingleNftQueryKey,
  GetTransactionReceiptQueryKey,
  alchemyQueryKeys,
} from '@hooks/data/embedded/alchemy/keys';
import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { Nft, OwnedNft, OwnedNftsResponse, TransactionReceipt } from 'alchemy-sdk';

export const useNftsForOwner = (
  params: GetNftsForOwnerParams,
  config?: Omit<
    UseQueryOptions<OwnedNftsResponse, Error, OwnedNftsResponse, GetNftsForOwnerQueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<OwnedNftsResponse> => {
  return useQuery({
    queryKey: alchemyQueryKeys.getNftsForOwner(params),
    queryFn: makeGetNFtsForOwnerFetcher(),
    gcTime: 1000,
    refetchOnWindowFocus: false,
    ...config,
  });
};

export const useSingleNftForOwner = (
  params: GetSingleNftForOwnerParams,
  config?: Omit<UseQueryOptions<OwnedNft, Error, OwnedNft, GetSingleNftForOwnerQueryKey>, 'queryKey' | 'queryFn'>,
): UseQueryResult<OwnedNft> => {
  return useQuery({
    queryKey: alchemyQueryKeys.getSingleNftForOwner(params),
    queryFn: makeGetSingleNFtForOwnerFetcher(),
    gcTime: 1000,
    refetchOnWindowFocus: false,
    ...config,
  });
};

export const useSingleNft = (
  params: GetSingleNftParams,
  config?: Omit<UseQueryOptions<Nft, Error, Nft, GetSingleNftQueryKey>, 'queryKey' | 'queryFn'>,
): UseQueryResult<Nft> => {
  return useQuery({
    queryKey: alchemyQueryKeys.getSingleNft(params),
    queryFn: makeGetSingleNftFetcher(),
    gcTime: 1000,
    refetchOnWindowFocus: false,
    ...config,
  });
};

export const useTransactionReceipt = (
  params: GetTransactionReceiptParams,
  config?: Omit<
    UseQueryOptions<TransactionReceipt, Error, TransactionReceipt, GetTransactionReceiptQueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<TransactionReceipt> => {
  return useQuery({
    queryKey: alchemyQueryKeys.getTransactionReceipt(params),
    queryFn: makeGetTransactionReceiptFetcher(),
    gcTime: 1000,
    refetchOnWindowFocus: false,
    ...config,
  });
};
