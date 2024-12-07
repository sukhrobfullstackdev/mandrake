import { HttpServiceAbstract } from '@lib/http-services/core/http-service-abstract';

/**
 * This service pulls data from cookies and url params exclusively for server-side actions or middleware.
 */
export class MandrakeHttpService extends HttpServiceAbstract {
  protected SERVICE_NAME = 'Mandrake-Next';

  async Get<T>(route: string, headers?: HeadersInit, fetchRequestOverride: RequestInit = {}) {
    const allHeaders = this.getHeaders(headers);

    const response = await fetch(route, {
      method: 'GET',
      credentials: 'include',
      headers: allHeaders,
      ...fetchRequestOverride,
    });

    return this.handleMagicResponse<T>(response, {
      vercelCache: response?.headers?.get('X-Vercel-Cache'),
      route,
      headers: allHeaders,
    });
  }

  async Post<T>(
    route: string,
    headers?: HeadersInit,
    bodyData?: Record<string, unknown>,
    fetchRequestOverride: RequestInit = {},
  ) {
    const allHeaders = this.getHeaders(headers);

    const response = await fetch(route, {
      method: 'POST',
      credentials: 'include',
      headers: allHeaders,
      body: JSON.stringify(bodyData),
      ...fetchRequestOverride,
    });

    return this.handleMagicResponse<T>(response, {
      vercelCache: response?.headers?.get('X-Vercel-Cache'),
      route,
      headers: allHeaders,
    });
  }

  protected getHeaders(headers?: HeadersInit): HeadersInit {
    return {
      ...this.basicMagicHeaders(),
      ...headers,
    };
  }
}
