import {
  CreatePaypalOrderData,
  GetPaypalOrderData,
  GetStripeClientTokenParams,
  SardineClientTokenParams,
} from '@hooks/data/embedded/onramp/fetchers';

export const onrampQueryKeys = {
  base: ['onramp'] as const,
  getStripeClientToken: (params: GetStripeClientTokenParams) =>
    [[...onrampQueryKeys.base, 'get-stripe-client-token'], params] as const,
  getSardineClientToken: (params: SardineClientTokenParams) =>
    [[...onrampQueryKeys.base, 'get-sardine-client-token'], params] as const,
  getPaypalOrder: (params: GetPaypalOrderData) => [[...onrampQueryKeys.base, 'get-paypal-order'], params] as const,
  createPaypalOrder: (params: CreatePaypalOrderData) =>
    [[...onrampQueryKeys.base, 'create-paypal-order'], params] as const,
};

export type GetStripeClientTokenQueryKey = ReturnType<typeof onrampQueryKeys.getStripeClientToken>;
export type GetSardineClientTokenQueryKey = ReturnType<typeof onrampQueryKeys.getSardineClientToken>;
export type GetPaypalOrderQueryKey = ReturnType<typeof onrampQueryKeys.getPaypalOrder>;
export type CreatePaypalOrderQueryKey = ReturnType<typeof onrampQueryKeys.createPaypalOrder>;
