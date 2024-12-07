import { Endpoint } from '@constants/endpoint';
import { StripeClientToken } from '@custom-types/onramp';
import {
  CreatePaypalOrderQueryKey,
  GetPaypalOrderQueryKey,
  GetSardineClientTokenQueryKey,
  GetStripeClientTokenQueryKey,
} from '@hooks/data/embedded/onramp/keys';
import { HttpService } from '@http-services';
import { QueryFunction } from '@tanstack/react-query';

export type GetStripeClientTokenParams = {
  isMainnet: boolean;
  publicAddress: string;
  supportedDestinationNetworks: string[];
  supportedDestinationCurrencies: string[];
  sourceExchangeAmount: string;
  sourceCurrency: string;
};

export interface GetPaypalOrderData {
  auth_user_id: string;
  order_entry_id: string;
}

interface Link {
  href: string;
  rel: string;
}

interface PaypalOrder {
  asset_symbol: string;
  create_time: number;
  id: string;
  intent: string;
  links: Link[];
  partner: {
    account_id: string;
    channel: string;
    name: string;
    order_id: string;
    redirect_url: string;
  };
  status: string;
  topup_summary: string;
  transaction_hash: string;
  type: string;
  update_time: number;
}

export interface GetPaypalOrderResponse {
  orders: PaypalOrder[];
}

export interface CreatePaypalOrderData {
  value: string;
  auth_user_id: string;
  channel: 'WEB' | 'APP';
}

interface CreatePaypalOrderRequest {
  auth_user_id: string;
  wallet_type: string;
  intent: string;
  asset_symbol: string;
  country_code: string;
  region?: string;
  fiat_amount: {
    value: string;
    currency_code: string;
  };
  partner: {
    order_id?: string;
    redirect_url: string;
    account_id?: string;
    channel?: string;
  };
}

interface CreatePaypalOrderResponse {
  country_code: string;
  create_time: number;
  fiat_amount: {
    currency_code: string;
    value: string;
  };
  id: string;
  intent: string;
  partner: {
    account_id: string;
    channel: string;
    name: string;
    order_id: string;
    redirect_url: string;
  };
  redirect_url: string;
  region: string;
  token: string;
}

export interface SardineClientTokenParams {
  isMainnet: boolean;
  paymentMethodTypeConfig: {
    default: string;
    enabled: string[];
  };
}

export const makeStripeClientTokenFetcher =
  (): QueryFunction<StripeClientToken, GetStripeClientTokenQueryKey> =>
  async ({
    queryKey: [
      ,
      {
        isMainnet,
        publicAddress,
        supportedDestinationCurrencies,
        supportedDestinationNetworks,
        sourceExchangeAmount,
        sourceCurrency,
      },
    ],
  }) => {
    const response = await HttpService.Magic.Post(
      `${Endpoint.Onramp.StripeClientToken}`,
      {},
      {
        is_mainnet: isMainnet,
        public_address: publicAddress,
        supported_destination_currencies: supportedDestinationCurrencies,
        supported_destination_networks: supportedDestinationNetworks,
        source_exchange_amount: sourceExchangeAmount,
        source_currency: sourceCurrency,
      },
    );
    return response as StripeClientToken;
  };

export const makeSardineClientTokenFetcher =
  (): QueryFunction<string, GetSardineClientTokenQueryKey> =>
  async ({ queryKey: [, { isMainnet, paymentMethodTypeConfig }] }): Promise<string> => {
    const res = await HttpService.Magic.Post(
      Endpoint.Onramp.SardineClientToken,
      {},
      {
        is_mainnet: isMainnet,
        payment_method_type_config: paymentMethodTypeConfig,
      },
    );

    return res?.clientToken as string;
  };

export const makePaypalGetOrderFetcher =
  (): QueryFunction<GetPaypalOrderResponse, GetPaypalOrderQueryKey> =>
  async ({ queryKey: [, { auth_user_id, order_entry_id }] }) => {
    const response = await HttpService.Magic.Get(
      `${Endpoint.Onramp.PaypalGetOrder}?auth_user_id=${auth_user_id}&order_entry_id=${order_entry_id}`,
    );
    return response.data as GetPaypalOrderResponse;
  };

const constructCreateOrderData = ({
  value,
  auth_user_id,
  channel,
}: CreatePaypalOrderData): CreatePaypalOrderRequest => {
  return {
    auth_user_id,
    wallet_type: 'ETH',
    intent: 'TOPUP',
    asset_symbol: 'ETH',
    country_code: 'US',
    fiat_amount: {
      value,
      currency_code: 'USD',
    },
    partner: {
      redirect_url: 'https://wallet.magic.link/paypal',
      channel,
    },
  };
};

export const makePaypalCreateOrderFetcher =
  (): QueryFunction<CreatePaypalOrderResponse, CreatePaypalOrderQueryKey> =>
  async ({ queryKey: [, { value, auth_user_id, channel }] }) => {
    const body = constructCreateOrderData({ value, auth_user_id, channel });
    const response = await HttpService.Magic.Post(Endpoint.Onramp.PaypalCreateOrder, {}, body);
    return response.data as CreatePaypalOrderResponse;
  };
