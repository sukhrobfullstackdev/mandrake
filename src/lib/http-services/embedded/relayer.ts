import { CSRF_TOKEN_COOKIE, OAUTH_MOBILE_BUNDLE_ID } from '@constants/cookies';
import { LEGACY_URL } from '@constants/env';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { getReferrer } from '@utils/location';
import { getCookie } from 'cookies-next';
import { v4 as uuid } from 'uuid';
import { HttpServiceAbstract } from '../core/http-service-abstract';

export class RelayerHttpService extends HttpServiceAbstract {
  protected static BASE_URL = LEGACY_URL;

  protected SERVICE_NAME = 'RELAYER';

  async Get(route: string, headers?: HeadersInit) {
    const allHeaders = this.getHeaders(headers);

    const response = await fetch(RelayerHttpService.BASE_URL + route, {
      method: 'GET',
      credentials: 'include',
      headers: allHeaders,
    });

    return this.handleMagicResponse(response, {
      route: RelayerHttpService.BASE_URL + route,
      magicApiKey: this.getApiKey(),
      headers: allHeaders,
    });
  }

  async Post(route: string, headers?: HeadersInit, bodyData?: unknown) {
    const allHeaders = this.getHeaders(headers);

    const response = await fetch(RelayerHttpService.BASE_URL + route, {
      method: 'POST',
      credentials: 'include',
      headers: allHeaders,
      body: JSON.stringify(bodyData),
    });

    return this.handleMagicResponse(response, {
      route: RelayerHttpService.BASE_URL + route,
      magicApiKey: this.getApiKey(),
      headers: allHeaders,
    });
  }

  protected getHeaders(headers?: HeadersInit) {
    const csrf = getCookie(CSRF_TOKEN_COOKIE);
    const bundleIdFromCookie = getCookie(OAUTH_MOBILE_BUNDLE_ID);
    const traceId = uuid();
    const userSessionToken = useStore.getState().authUserSessionToken;
    const customAuthorizationToken = AtomicRpcPayloadService.getActiveRpcPayload()?.params?.[0]?.jwt as
      | string
      | undefined;

    const {
      bundleId = 'BundleIDMissing',
      domainOrigin = '',
      locale = '',
      sdkType = 'SdkMissing',
    } = useStore.getState().decodedQueryParams;

    return {
      'x-magic-trace-id': traceId,
      'x-amzn-trace-id': `Root=${traceId}`,
      'x-magic-referrer': getReferrer(domainOrigin),
      'x-magic-api-key': this.getApiKey(),
      'x-magic-csrf': csrf || '',
      'x-magic-sdk': sdkType,
      'x-magic-bundle-id': bundleIdFromCookie || bundleId,
      'accept-language': locale,
      ...(userSessionToken && { authorization: `Bearer ${userSessionToken}` }),
      ...(customAuthorizationToken && { authorization: `Bearer ${customAuthorizationToken}` }),
      ...(process.env.VERCEL_ENV === 'preview'
        ? {
            'CF-Access-Client-Id': process.env.CLOUDFLARE_ACCESS_CLIENT_ID,
            'CF-Access-Client-Secret': process.env.CLOUDFLARE_ACCESS_CLIENT_SECRET,
          }
        : {}),
      ...headers,
    };
  }
}
