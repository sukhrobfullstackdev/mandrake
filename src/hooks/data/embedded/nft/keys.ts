import {
  GetBalanceOfNftParams,
  GetCurrentStageParams,
  GetNetworkFeeParams,
  GetNftTokenInfoParams,
  GetPaypalClientTokenParams,
  GetPaypalOrderDetailsParams,
  IsAllowListParams,
} from '@hooks/data/embedded/nft/fetchers';

export const nftQueryKeys = {
  base: ['nft'] as const,

  getNftTokenInfo: (params: GetNftTokenInfoParams) => [[...nftQueryKeys.base, 'nft-token-info'], params] as const,
  getPaypalClientToken: (params: GetPaypalClientTokenParams) =>
    [[...nftQueryKeys.base, 'get-paypal-client-token'], params] as const,
  getPaypalOrderDetails: (params: GetPaypalOrderDetailsParams) =>
    [[...nftQueryKeys.base, 'get-paypal-order-details'], params] as const,
  getNetworkFee: (params: GetNetworkFeeParams) => [[...nftQueryKeys.base, 'get-network-fee'], params] as const,
  getBalanceOfNft: (params: GetBalanceOfNftParams) => [[...nftQueryKeys.base, 'get-balance-of-nft'], params] as const,
  isAllowList: (params: IsAllowListParams) => [[...nftQueryKeys.base, 'is-allow-list'], params] as const,
  getCurrentStage: (params: GetCurrentStageParams) => [[...nftQueryKeys.base, 'get-current-stage'], params] as const,
  getFallbackNetworkFee: () => [[...nftQueryKeys.base, 'get-fallback-network-fee']] as const,
};

export type GetNftTokenInfoQueryKey = ReturnType<typeof nftQueryKeys.getNftTokenInfo>;

export type GetPaypalClientTokenQueryKey = ReturnType<typeof nftQueryKeys.getPaypalClientToken>;

export type GetPaypalOrderDetailsQueryKey = ReturnType<typeof nftQueryKeys.getPaypalOrderDetails>;

export type GetNetworkFeeQueryKey = ReturnType<typeof nftQueryKeys.getNetworkFee>;

export type GetBalanceOfNftQueryKey = ReturnType<typeof nftQueryKeys.getBalanceOfNft>;

export type IsAllowListParamsQueryKey = ReturnType<typeof nftQueryKeys.isAllowList>;

export type GetCurrentStageQueryKey = ReturnType<typeof nftQueryKeys.getCurrentStage>;

export type GetFallbackNetworkFeeQueryKey = ReturnType<typeof nftQueryKeys.getFallbackNetworkFee>;
