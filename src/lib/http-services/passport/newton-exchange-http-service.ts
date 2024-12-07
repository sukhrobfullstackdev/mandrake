import { NEWTON_EXCHANGE_API_URL } from '@constants/env';
import { usePassportStore } from '@hooks/data/passport/store';

import { HttpServiceAbstract } from '@lib/http-services/core/http-service-abstract';
import { camelizeKeys } from '@utils/object-helpers';

export class NewtonExchangeHttpService extends HttpServiceAbstract {
  protected static BASE_URL = NEWTON_EXCHANGE_API_URL;

  async Get(route: string, headers?: HeadersInit) {
    const response = await fetch(NewtonExchangeHttpService.BASE_URL + route, {
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
    const response = await fetch(NewtonExchangeHttpService.BASE_URL + route, {
      method: 'POST',
      headers: this.getHeaders(headers),
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      throw new Error('Something went wrong');
    }

    const res = await response.json();
    return camelizeKeys(res.data);
  }

  protected getHeaders(headers?: HeadersInit) {
    const accessToken = usePassportStore.getState().accessToken;
    const containsAuth = (headers as Record<string, string> | undefined)?.Authorization !== undefined;

    return {
      'Content-Type': 'application/json',
      ...(accessToken && !containsAuth && { authorization: `Bearer ${accessToken}` }),
      ...headers,
    };
  }
}
