import { ALCHEMY_KEYS } from '@constants/alchemy';

export type TokenPriceQueryKey = ReturnType<typeof tokenQueryKeys.tokenPrice>;
export type EvmErc20TokensQueryKey = ReturnType<typeof tokenQueryKeys.erc20Tokens>;
export type FlowUsdcTokensQueryKey = ReturnType<typeof tokenQueryKeys.flowUsdcTokens>;

export interface TokenPriceParams {
  tokenSymbol: string;
  amount: string;
}

export interface EvmErc20TokensParams {
  userAddress: string;
  networkName: keyof typeof ALCHEMY_KEYS;
}

export interface FlowUsdcTokenParams {
  userAddress: string;
}

export const tokenQueryKeys = {
  base: ['token'] as const,

  tokenPrice: (params: TokenPriceParams) => [[...tokenQueryKeys.base, 'tokenPrice'], params] as const,
  erc20Tokens: (params: EvmErc20TokensParams) => [[...tokenQueryKeys.base, 'erc20Tokens'], params] as const,
  flowUsdcTokens: (params: FlowUsdcTokenParams) => [[...tokenQueryKeys.base, 'flowUsdcTokens'], params] as const,
};
