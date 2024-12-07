import { BACKEND_URL } from '@constants/env';
import { DecodedQueryParams, useStore } from '@hooks/store';
import { getReferrer } from '@utils/location';
import { getNetworkName } from '@utils/network-name';
import { isMobileSdk } from '@utils/platform';
import { HttpServiceAbstract } from '../core/http-service-abstract';

export class MagicHttpService extends HttpServiceAbstract {
  protected static BASE_URL = BACKEND_URL ?? 'https://api.magic.link';

  protected SERVICE_NAME = 'Mandrake-Client';

  async Get(route: string, headers?: HeadersInit, fetchRequestOverride: RequestInit = {}) {
    const allHeaders = this.getHeaders(headers);

    const response = await fetch(MagicHttpService.BASE_URL + route, {
      method: 'GET',
      credentials: 'include',
      headers: allHeaders,
      ...fetchRequestOverride,
    });

    return this.handleMagicResponse(response, {
      route: MagicHttpService.BASE_URL + route,
      magicApiKey: this.getApiKey(),
      headers: allHeaders,
    });
  }

  async Post(route: string, headers?: HeadersInit, bodyData?: unknown, fetchRequestOverride: RequestInit = {}) {
    const allHeaders = this.getHeaders(headers);

    const response = await fetch(MagicHttpService.BASE_URL + route, {
      method: 'POST',
      credentials: 'include',
      headers: allHeaders,
      body: JSON.stringify(bodyData),
      ...fetchRequestOverride,
    });

    return this.handleMagicResponse(response, {
      route: MagicHttpService.BASE_URL + route,
      magicApiKey: this.getApiKey(),
      headers: allHeaders,
    });
  }

  async Patch(route: string, headers?: HeadersInit, bodyData?: unknown) {
    const allHeaders = this.getHeaders(headers);

    const response = await fetch(MagicHttpService.BASE_URL + route, {
      method: 'PATCH',
      credentials: 'include',
      headers: allHeaders,
      body: JSON.stringify(bodyData),
    });

    return this.handleMagicResponse(response, {
      route: MagicHttpService.BASE_URL + route,
      magicApiKey: this.getApiKey(),
      headers: allHeaders,
    });
  }

  async Delete(route: string, headers?: HeadersInit, bodyData?: unknown) {
    const allHeaders = this.getHeaders(headers);

    const response = await fetch(MagicHttpService.BASE_URL + route, {
      method: 'DELETE',
      credentials: 'include',
      headers: allHeaders,
      body: JSON.stringify(bodyData),
    });

    return this.handleMagicResponse(response, {
      route: MagicHttpService.BASE_URL + route,
      magicApiKey: this.getApiKey(),
      headers: allHeaders,
    });
  }

  protected getHeaders(headers?: HeadersInit) {
    const userSessionToken = useStore.getState().authUserSessionToken;
    const customAuthorizationToken = useStore.getState().customAuthorizationToken;
    const containsAuth = (headers as Record<string, string> | undefined)?.Authorization !== undefined;
    const {
      bundleId = 'BundleIDMissing',
      domainOrigin = '',
      ethNetwork = 'mainnet',
      locale = '',
      sdkType = 'SdkMissing',
      meta,
      version,
      ext,
    } = useStore.getState().decodedQueryParams;

    // When we start doing network switching on the same instance of relayer, we're gunna have to index the
    // query cache by network name as well.
    const networkName = getNetworkName(ethNetwork, version, this.getApiKey(), isMobileSdk(sdkType, domainOrigin), ext);

    return {
      ...this.basicMagicHeaders(),
      'accept-language': locale,
      'x-fortmatic-network': networkName,
      'x-magic-api-key': this.getApiKey(),
      'x-magic-bundle-id': bundleId,
      'x-magic-referrer': getReferrer(domainOrigin),
      'x-magic-sdk': sdkType,
      'x-magic-meta': meta ? btoa(JSON.stringify(meta)) : 'None',
      ...(userSessionToken && !containsAuth && { authorization: `Bearer ${userSessionToken}` }),
      ...(customAuthorizationToken && { 'x-custom-authorization-token': customAuthorizationToken }),
      ...headers,
    };
  }

  getHeadersFromParams(params: DecodedQueryParams): HeadersInit {
    const {
      bundleId = 'BundleIDMissing',
      domainOrigin = '',
      ethNetwork = 'mainnet',
      locale = '',
      sdkType = 'SdkMissing',
      meta,
      version,
      ext,
      apiKey = '',
    } = params;

    const networkName = getNetworkName(
      ethNetwork,
      version,
      this.getApiKey() || apiKey,
      isMobileSdk(sdkType, domainOrigin),
      ext,
    );

    return {
      'accept-language': locale,
      'x-fortmatic-network': networkName,
      'x-magic-api-key': this.getApiKey() || apiKey,
      'x-magic-bundle-id': bundleId,
      'x-magic-referrer': getReferrer(domainOrigin),
      'x-magic-sdk': sdkType,
      'x-magic-meta': meta ? btoa(JSON.stringify(meta)) : 'None',
    };
  }

  protected getApiKey = (): string => {
    const apiKeyState = useStore.getState().magicApiKey;
    if (apiKeyState) return apiKeyState;

    const { apiKey } = useStore.getState().decodedQueryParams;
    return apiKey || '';
  };
}
