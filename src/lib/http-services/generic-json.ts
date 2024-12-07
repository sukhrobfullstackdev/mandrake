import { HttpServiceAbstract } from './core/http-service-abstract';
import { camelizeKeys } from '@utils/object-helpers';

export class GenericJsonHttpService extends HttpServiceAbstract {
  protected SERVICE_NAME = 'JSON';

  async Get(route: string, headers?: HeadersInit) {
    const allHeaders = this.getHeaders(headers);
    const response = await fetch(route, {
      method: 'GET',
      headers: allHeaders,
    });

    return GenericJsonHttpService.handleJSONResponse(response, {
      route: route,
      magicApiKey: this.getApiKey(),
      headers: allHeaders,
    });
  }

  async Post(route: string, headers?: HeadersInit, bodyData?: unknown) {
    const allHeaders = this.getHeaders(headers);
    const response = await fetch(route, {
      method: 'POST',
      headers: this.getHeaders(headers),
      body: JSON.stringify(bodyData),
    });

    return GenericJsonHttpService.handleJSONResponse(response, {
      route: route,
      magicApiKey: this.getApiKey(),
      headers: allHeaders,
    });
  }

  protected getHeaders(headers?: HeadersInit) {
    return {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json',
      ...headers,
    };
  }

  protected static handleJSONResponse = async (response: Response, metadata: Record<string, unknown> = {}) => {
    try {
      const data = await response.json();
      logger.info(`External API request success: ${metadata.route}`, {
        response,
        data,
        metadata,
      });
      return camelizeKeys(data);
    } catch (error) {
      logger.error(`External API request parsing failed: ${metadata.route}`, { response, metadata, error });
      throw error;
    }
  };
}
