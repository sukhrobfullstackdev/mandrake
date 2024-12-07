import { JsonRpcRequestPayload } from '@magic-sdk/types';

export type GasPriceEstimationQueryKey = ReturnType<typeof ethereumProxyKeys.gasPriceEstimation>;

export type GasPriceEstimationParams = {
  authUserSessionToken: string;
};

export type EthereumProxyQueryKey = ReturnType<typeof ethereumProxyKeys.ethereumProxy>;
export type CustomNodeQueryKey = ReturnType<typeof ethereumProxyKeys.customNode>;

export type CustomNodeParams = {
  payload: JsonRpcRequestPayload;
  nodeUrl: string;
};

export const ethereumProxyKeys = {
  base: ['ethereum-proxy'] as const,

  gasPriceEstimation: (params: GasPriceEstimationParams) =>
    [[...ethereumProxyKeys.base, 'gas-price-estimation'], params] as const,
  ethereumProxy: (params: JsonRpcRequestPayload) => [[...ethereumProxyKeys.base, params.method], params] as const,
  customNode: (params: CustomNodeParams) => [[...ethereumProxyKeys.base, params.payload.method], params] as const,
};
