import { BASE_URI } from '@constants/content-security-policies/base-uri';
import { CONNECT_SRC } from '@constants/content-security-policies/connect-src';
import { DEFAULT_SRC } from '@constants/content-security-policies/default-src';
import { FONT_SRC } from '@constants/content-security-policies/font-src';
import { FORM_ACTION } from '@constants/content-security-policies/form-action';
import { FRAME_SRC } from '@constants/content-security-policies/frame-src';
import { IMG_SRC } from '@constants/content-security-policies/img-src';
import { multiChainConnectSrc } from '@constants/content-security-policies/multi-chain-connect-src';
import { OBJECT_SRC } from '@constants/content-security-policies/object-src';
import { SCRIPT_SRC } from '@constants/content-security-policies/script-src';
import { STYLE_SRC } from '@constants/content-security-policies/style-src';
import { WORKER_SRC } from '@constants/content-security-policies/worker-src';
import { SEND_CONTEXT_COOKIE } from '@constants/cookies';
import { Endpoint } from '@constants/endpoint';
import { MagicApiErrorCode } from '@constants/error';
import { ClientConfig, CSPSource } from '@custom-types/magic-client';
import { fetchClientConfigFromBackend } from '@hooks/data/embedded/magic-client';
import { HttpService } from '@lib/http-services';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import {
  createNextErrorResponse,
  NextResponseErrorMessage,
  surfaceApiErrorResponse,
} from '@lib/http-services/util/next-response';
import { fetchConfig } from '@lib/utils/app-config';
import { encodeBase64URL } from '@lib/utils/base64';
import { getDecodedQueryParams, getParsedQueryParams } from '@lib/utils/query-string';
import { NextRequest, NextResponse } from 'next/server';
import { ResponseConfig } from '../middleware';

export const contentSecurityPolicyMiddleware = async (request: NextRequest, responseConfig: ResponseConfig) => {
  const { headers: requestHeaders } = responseConfig.request;
  const { params } = getParsedQueryParams(request.nextUrl.search);
  const decodedQueryParams = getDecodedQueryParams(params as string);

  // bail out of here if we don't have a magic client api key
  if (!decodedQueryParams.apiKey) {
    return createNextErrorResponse(
      400,
      MagicApiErrorCode.API_KEY_IS_MISSING,
      NextResponseErrorMessage.ConfigClientMiddlewareKeyMissing,
      { decodedQueryParams },
    );
  }

  let clientConfig: ClientConfig | null = null;

  try {
    const url = `${request.nextUrl.origin}${Endpoint.MandrakeAPI.MagicClientAPI}/${encodeBase64URL(decodedQueryParams.apiKey || '')}/config`;
    const headers = HttpService.Magic.getHeadersFromParams(decodedQueryParams);
    clientConfig = await fetchConfig<ClientConfig>(
      url,
      decodedQueryParams,
      HttpService.Mandrake,
      headers,
      fetchClientConfigFromBackend(headers),
    );
  } catch (e) {
    return surfaceApiErrorResponse(e as ApiResponseError);
  }

  // If it's still missing, throw an error
  if (!clientConfig) {
    return createNextErrorResponse(
      400,
      MagicApiErrorCode.INVALID_API_KEY,
      NextResponseErrorMessage.ConfigClientMiddlewareDataMissing,
      { decodedQueryParams },
    );
  }

  const configConnectSrc =
    clientConfig.cspSources
      ?.filter((cspSources: CSPSource) => cspSources.isActive)
      .filter((cspSources: CSPSource) => cspSources.type === 'connect-src')
      .map((cspSources: CSPSource) => cspSources.value) ?? [];
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const cspHeader = `
      default-src ${DEFAULT_SRC.join(' ')};
      script-src ${SCRIPT_SRC.join(' ')};
      style-src ${STYLE_SRC.join(' ')};
      frame-src ${FRAME_SRC.join(' ')};
      connect-src ${CONNECT_SRC.join(' ')} ${configConnectSrc.join(' ')} ${multiChainConnectSrc.join(' ')};
      img-src ${IMG_SRC.join(' ')} ${clientConfig.clientTheme?.assetUri || ''};
      font-src ${FONT_SRC.join(' ')};
      object-src ${OBJECT_SRC.join(' ')};
      base-uri ${BASE_URI.join(' ')};
      form-action ${FORM_ACTION.join(' ')};
      worker-src ${WORKER_SRC.join(' ')};
      block-all-mixed-content;
      ${process.env.HOSTNAME === 'localhost' ? '' : 'upgrade-insecure-requests;'}
      `;

  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim();

  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  // cookie holding contextual data for server components within /send
  response.cookies.set({
    name: SEND_CONTEXT_COOKIE,
    value: JSON.stringify({
      magicApiKey: decodedQueryParams.apiKey,
      encodedQueryParams: params,
    }),
    httpOnly: true,
    secure: true,
    partitioned: true,
  });

  return response;
};
