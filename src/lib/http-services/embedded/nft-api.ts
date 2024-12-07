import { NFT_API_URL } from '@constants/env';
import { useStore } from '@hooks/store';
import { getReferrer } from '@utils/location';
import { getNetworkName } from '@utils/network-name';
import { camelizeKeys } from '@utils/object-helpers';
import { isMobileSdk } from '@utils/platform';
import { HttpServiceAbstract } from '../core/http-service-abstract';

export class NftHttpService extends HttpServiceAbstract {
  protected static BASE_URL = NFT_API_URL;

  protected SERVICE_NAME = 'NFT';

  async Get(route: string, headers?: HeadersInit) {
    const response = await fetch(NftHttpService.BASE_URL + route, {
      method: 'GET',
      headers: this.getHeaders(headers),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch NFT token info');
    }

    const data = await response.json();
    return camelizeKeys(data);
  }

  async Post(route: string, headers?: HeadersInit, bodyData?: unknown) {
    const response = await fetch(NftHttpService.BASE_URL + route, {
      method: 'POST',
      headers: this.getHeaders(headers),
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch NFT token info');
    }

    const data = await response.json();
    return camelizeKeys(data);
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
}
