import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@http-services';

import { ClientConfig, OAuthApp } from '@custom-types/magic-client';
import { type QueryFunction } from '@tanstack/react-query';
import { MagicClientConfigQueryKey, MagicClientOAuthAppQueryKey } from './keys';

import { DecodedQueryParams, useStore } from '@hooks/store';
import { fetchConfig } from '@lib/utils/app-config';
import { encodeBase64URL } from '@utils/base64';

/**
 * Todo: Remove This fetcher and use the Next one
 */
export const makeClientConfigFetcher =
  (): QueryFunction<ClientConfig, MagicClientConfigQueryKey> =>
  ({ queryKey: [, { magicApiKey }] }): Promise<ClientConfig> => {
    return HttpService.Magic.Get(Endpoint.MagicClient.Config, magicApiKey ? { 'x-magic-api-key': magicApiKey } : {});
  };

export const makeOAuthAppFetcher =
  (): QueryFunction<OAuthApp[], MagicClientOAuthAppQueryKey> =>
  ({ queryKey: [, { provider }] }) =>
    HttpService.Magic.Get(`${Endpoint.MagicClient.OAuthApp}?provider_name=${provider}`);

/**
 * A raw fetch to client config if api router has failed
 */
export const fetchClientConfigFromBackend = (headers: HeadersInit) => (): Promise<ClientConfig> => {
  const endpoint = Endpoint.MagicClient.Config;
  return HttpService.Magic.Get(endpoint, headers);
};

// Fetcher function compatible with React Query for retrieving cached client configuration.
export const makeCachedClientConfigFetcher =
  (origin: string, paramsOverride?: DecodedQueryParams): QueryFunction<ClientConfig, MagicClientConfigQueryKey> =>
  ({ queryKey: [, { magicApiKey }] }): Promise<ClientConfig> => {
    const params = paramsOverride ?? useStore.getState().decodedQueryParams;
    params.apiKey = magicApiKey;
    const headers: HeadersInit | undefined = HttpService.Magic.getHeadersFromParams(params);
    const url = `${origin}${Endpoint.MandrakeAPI.MagicClientAPI}/${encodeBase64URL(params.apiKey || '')}/config`;
    return fetchConfig<ClientConfig>(url, params, HttpService.Mandrake, headers, fetchClientConfigFromBackend(headers));
  };
