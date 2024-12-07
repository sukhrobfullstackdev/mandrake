import {
  GetNftsForOwnerParams,
  GetSingleNftForOwnerParams,
  GetSingleNftParams,
  GetTransactionReceiptParams,
} from '@hooks/data/embedded/alchemy/fetchers';

export const alchemyQueryKeys = {
  base: ['alchemy'] as const,

  getNftsForOwner: (params: GetNftsForOwnerParams) =>
    [[...alchemyQueryKeys.base, 'get-nfts-for-owner'], params] as const,
  getSingleNftForOwner: (params: GetSingleNftForOwnerParams) =>
    [[...alchemyQueryKeys.base, 'get-single-nft-for-owner'], params] as const,
  getSingleNft: (params: GetSingleNftParams) => [[...alchemyQueryKeys.base, 'get-single-nft'], params] as const,
  getTransactionReceipt: (params: GetTransactionReceiptParams) =>
    [[...alchemyQueryKeys.base, 'get-transaction-receipt-params'], params] as const,
};

export type GetNftsForOwnerQueryKey = ReturnType<typeof alchemyQueryKeys.getNftsForOwner>;

export type GetSingleNftForOwnerQueryKey = ReturnType<typeof alchemyQueryKeys.getSingleNftForOwner>;

export type GetSingleNftQueryKey = ReturnType<typeof alchemyQueryKeys.getSingleNft>;

export type GetTransactionReceiptQueryKey = ReturnType<typeof alchemyQueryKeys.getTransactionReceipt>;
