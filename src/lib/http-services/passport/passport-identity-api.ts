import { PASSPORT_IDENTITY_API_URL } from '@constants/env';
import { usePassportStore } from '@hooks/data/passport/store';
import { DecodedQueryParams } from '@hooks/store';
import { HttpServiceAbstract } from '@lib/http-services/core/http-service-abstract';
import { camelizeKeys } from '@utils/object-helpers';

export interface PassportIdentityGetErrorCause {
  status: number;
  statusText: string;
  data: { [key: string]: unknown } | undefined;
}
export class PassportIdentityHttpService extends HttpServiceAbstract {
  protected static BASE_URL = PASSPORT_IDENTITY_API_URL;

  protected SERVICE_NAME = 'Passport-Identity-Http-Service';

  async Get(route: string, headers?: HeadersInit) {
    const response = await fetch(PassportIdentityHttpService.BASE_URL + route, {
      method: 'GET',
      headers: this.getHeaders(headers),
    });

    return this.handleResponse(response, {
      vercelCache: response?.headers?.get('X-Vercel-Cache'),
      route,
      headers: this.getHeaders(headers),
    });
  }

  async Post(route: string, headers?: HeadersInit, bodyData?: unknown) {
    const response = await fetch(PassportIdentityHttpService.BASE_URL + route, {
      method: 'POST',
      headers: this.getHeaders(headers),
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      throw new Error('Something went wrong');
    }

    const data = await response.json();
    return camelizeKeys(data);
  }

  async Patch(route: string, headers?: HeadersInit, bodyData?: unknown) {
    const response = await fetch(PassportIdentityHttpService.BASE_URL + route, {
      method: 'PATCH',
      headers: this.getHeaders(headers),
      body: JSON.stringify(bodyData),
    });

    if (!response.ok || response.status !== 204) {
      throw new Error('Something went wrong');
    }
    if (response.bodyUsed) {
      const data = await response.json();
      return camelizeKeys(data);
    }

    return;
  }

  protected getHeaders(headers?: HeadersInit) {
    const accessToken = usePassportStore.getState().accessToken;
    const containsAuth = (headers as Record<string, string> | undefined)?.Authorization !== undefined;
    const apiKey = this.getApiKey();

    return {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json;charset=UTF-8',
      'x-passport-api-key': apiKey,
      ...(accessToken && !containsAuth && { authorization: `Bearer ${accessToken}` }),
      ...headers,
    };
  }

  protected getApiKey = (): string => {
    const apiKeyState = usePassportStore.getState().magicApiKey;
    if (apiKeyState) return apiKeyState;

    const { apiKey } = usePassportStore.getState().decodedQueryParams;
    return apiKey || '';
  };

  getHeadersFromParams(params: DecodedQueryParams): HeadersInit {
    const { locale = '', apiKey = '' } = params;

    return {
      'accept-language': locale,
      'x-passport-api-key': this.getApiKey() || apiKey,
    };
  }
}
