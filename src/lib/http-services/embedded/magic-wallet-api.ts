import { API_WALLETS_URL } from '@constants/env';
import { HttpServiceAbstract } from '@lib/http-services/core/http-service-abstract';
import { camelizeKeys } from '@utils/object-helpers';

export class MagicWalletApiHttpService extends HttpServiceAbstract {
  protected static BASE_URL = API_WALLETS_URL;

  protected SERVICE_NAME = 'Mandrake-Tee';

  async Get(route: string, headers?: HeadersInit) {
    const response = await fetch(MagicWalletApiHttpService.BASE_URL + route, {
      method: 'GET',
      headers: this.getHeaders(headers),
    });

    if (!response.ok) {
      throw new Error('Something went wrong');
    }

    const data = await response.json();
    return camelizeKeys(data);
  }

  async Post(route: string, headers?: HeadersInit, bodyData?: unknown) {
    const response = await fetch(MagicWalletApiHttpService.BASE_URL + route, {
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

  protected getHeaders(headers?: HeadersInit) {
    return {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json;charset=UTF-8',
      'x-magic-api-key': this.getApiKey(),
      ...headers,
    };
  }
}
