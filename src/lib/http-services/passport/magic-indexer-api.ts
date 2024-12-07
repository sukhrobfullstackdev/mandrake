import { MAGIC_INDEXER_API_URL } from '@constants/env';
import { HttpServiceAbstract } from '@lib/http-services/core/http-service-abstract';
import { camelizeKeys } from '@utils/object-helpers';

export class MagicIndexerHttpService extends HttpServiceAbstract {
  protected static BASE_URL = MAGIC_INDEXER_API_URL;

  protected SERVICE_NAME = 'Magic-Indexer-Http-Service';

  async Get(route: string, headers?: HeadersInit) {
    const response = await fetch(MagicIndexerHttpService.BASE_URL + route, {
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
    const response = await fetch(MagicIndexerHttpService.BASE_URL + route, {
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
    const response = await fetch(MagicIndexerHttpService.BASE_URL + route, {
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
    return {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json;charset=UTF-8',
      ...headers,
    };
  }
}
