/* eslint-disable @typescript-eslint/no-explicit-any */
import { IS_LOCAL_ENV } from '@constants/env';
import { useStore } from '@hooks/store';
import { isServer } from '@utils/context';
import { camelizeKeys } from '@utils/object-helpers';
import { v4 as uuid } from 'uuid';
import { ApiResponseError } from './api-response-error';
import { getClientLogger } from '@services/client-logger';

export type SerializedHeaders = Record<string, string>;

const log = isServer ? console : getClientLogger(); // middleware can only use console

export abstract class HttpServiceAbstract {
  protected static BASE_URL: string;

  protected SERVICE_NAME = 'Http-Service';
  abstract Get<T = any>(route: string, headers?: HeadersInit, fetchRequestOverride?: RequestInit): Promise<T>;

  abstract Post<T = any>(
    route: string,
    headers?: HeadersInit,
    bodyData?: Record<string, unknown>,
    fetchRequestOverride?: RequestInit,
  ): Promise<T>;

  protected abstract getHeaders(headers?: HeadersInit): HeadersInit;

  protected basicMagicHeaders = (): HeadersInit => {
    const traceId = uuid();

    return {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json;charset=UTF-8',
      'x-amzn-trace-id': `Root=${traceId}`,
      'x-magic-trace-id': traceId,
      ...(process.env.VERCEL_ENV === 'preview'
        ? {
            'CF-Access-Client-Id': process.env.CLOUDFLARE_ACCESS_CLIENT_ID,
            'CF-Access-Client-Secret': process.env.CLOUDFLARE_ACCESS_CLIENT_SECRET,
          }
        : {}),
    };
  };

  protected serializeHeaders = (responseHeaders: Headers): SerializedHeaders => {
    const headers: SerializedHeaders = {};
    if (!responseHeaders) return headers;
    for (const [key, value] of responseHeaders.entries()) {
      headers[key] = value;
    }
    return headers;
  };

  protected handleMagicResponse = async <T = any>(
    response: Response,
    metadata: Record<string, unknown> = {},
  ): Promise<T> => {
    let responseJson;
    const cloneResponse = response.clone(); // clone the response to be able to read it twice
    try {
      responseJson = await response.json();
    } catch (error) {
      log.error(`Magic ${this.SERVICE_NAME} request json() failed ${response.status}: ${metadata.route}`, {
        response: JSON.stringify(response),
        metadata,
        errorMessage: (error as Error).message,
        text: await this.getResponseText(cloneResponse, metadata),
        error,
      });
      throw error;
    }

    const res = {
      headers: this.serializeHeaders(response.headers),
      status_code: response.status,
      ...responseJson,
    };

    if (!response.ok || res?.status !== 'ok') {
      log.error(`Magic ${this.SERVICE_NAME} request failed: ${metadata.route}`, {
        response: res,
        metadata,
      });
      throw new ApiResponseError(res);
    }

    log.info(
      `Magic ${this.SERVICE_NAME} request success: ${metadata.route}`,
      !IS_LOCAL_ENV
        ? {
            response: res,
            metadata,
          }
        : res.status_code,
    );
    return camelizeKeys(res.data);
  };

  protected handleResponse = async <T = any>(
    response: Response,
    metadata: Record<string, unknown> = {},
  ): Promise<T> => {
    let responseJson;
    const cloneResponse = response.clone(); // clone the response to be able to read it twice
    try {
      responseJson = await response.json();
    } catch (error) {
      log.error(`Magic ${this.SERVICE_NAME} request json() failed ${response.status}: ${metadata.route}`, {
        response: JSON.stringify(response),
        metadata,
        errorMessage: (error as Error).message,
        text: await this.getResponseText(cloneResponse, metadata),
        error,
      });
      throw error;
    }

    const res = {
      headers: this.serializeHeaders(response.headers),
      status_code: response.status,
      ...responseJson,
    };

    if (!response.ok || res.status_code !== 200) {
      log.error(`Magic ${this.SERVICE_NAME} request failed: ${metadata.route}`, {
        response: res,
        metadata,
      });
      throw new ApiResponseError(res);
    }

    log.info(
      `Magic ${this.SERVICE_NAME} request success: ${metadata.route}`,
      !IS_LOCAL_ENV
        ? {
            response: res,
            metadata,
          }
        : res.status_code,
    );
    return camelizeKeys(responseJson);
  };

  protected getApiKey = (): string => {
    const apiKeyState = useStore.getState().magicApiKey;
    if (apiKeyState) return apiKeyState;

    const { apiKey } = useStore.getState().decodedQueryParams;
    return apiKey || '';
  };

  private async getResponseText(responseClone: Response, metadata: Record<string, unknown> = {}): Promise<string> {
    // Get the response plaintext
    try {
      return await responseClone.text();
    } catch (error) {
      log.error(`Magic ${this.SERVICE_NAME} request text() failed ${responseClone.status}: ${metadata.route}`, {
        response: JSON.stringify(responseClone),
        metadata,
        errorMessage: (error as Error).message,
        error,
      });
      return 'Unable to get response text';
    }
  }
}
