import { DecodedQueryParams } from '@hooks/store';
import { HttpServiceAbstract } from '@lib/http-services/core/http-service-abstract';
import { isServer } from '@lib/utils/context';
import { timedPromiseWithFallback } from '@lib/utils/promise';

/**
 * Fetch client config from Next.js API route with a fallback to the backend.
 */
export const fetchConfig = <T>(
  url: string,
  params: DecodedQueryParams,
  httpService: HttpServiceAbstract,
  headers: HeadersInit,
  fallback?: () => Promise<T>,
): Promise<T> => {
  const log = isServer ? console : logger;
  if (!params.apiKey) {
    log.error('Unable to retrieve client config from Next.js API route. API key is missing from the params!!', params);
  }

  const fetchConfigPrimary = () => {
    return httpService.Get<T>(url, headers);
  };

  if (fallback) {
    return timedPromiseWithFallback<T>(fetchConfigPrimary, fallback, 500);
  }

  return fetchConfigPrimary();
};
