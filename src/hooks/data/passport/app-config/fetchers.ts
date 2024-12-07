import { Endpoint } from '@constants/endpoint';
import { HttpService } from '@http-services';

import { type QueryFunction } from '@tanstack/react-query';
import { MagicPassportConfigQueryKey } from './keys';

import { PassportConfig } from '@custom-types/passport';
import { usePassportStore } from '@hooks/data/passport/store';
import { fetchConfig } from '@lib/utils/app-config';
import { encodeBase64URL } from '@utils/base64';

/**
 * A raw fetch to passport config if api router has failed
 */
const fetchPassportConfigFromBackend = (headers: HeadersInit) => (): Promise<PassportConfig> => {
  const endpoint = Endpoint.PassportIdentity.Config;

  return HttpService.PassportIdentity.Get(endpoint, headers);
};

// Fetcher function compatible with React Query for retrieving cached passport configuration.
export const makeCachedPassportConfigFetcher =
  (origin: string): QueryFunction<PassportConfig, MagicPassportConfigQueryKey> =>
  ({ queryKey: [, { magicApiKey }] }): Promise<PassportConfig> => {
    const params = usePassportStore.getState().decodedQueryParams;
    const headers: HeadersInit | undefined = HttpService.PassportIdentity.getHeadersFromParams(params);
    params.apiKey = magicApiKey;
    const url = `${origin}${Endpoint.MandrakeAPI.MagicPassportAPI}/${encodeBase64URL(params.apiKey || '')}/config`;
    return fetchConfig(url, params, HttpService.Mandrake, headers, fetchPassportConfigFromBackend(headers));
  };
