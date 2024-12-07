import { Endpoint } from '@constants/endpoint';
import { MagicApiErrorCode } from '@constants/error';
import { PassportConfig } from '@custom-types/passport';
import { HttpService } from '@http-services';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import {
  createNextErrorResponse,
  createNextResponse,
  NextResponseErrorMessage,
  surfaceApiErrorResponse,
} from '@lib/http-services/util/next-response';
import { decodeBase64URL } from '@utils/base64';
import { NextRequest } from 'next/server';

export const revalidate = 900;
// fetches magic passport config behind vercel edge network cache
// https://vercel.com/docs/edge-network/caching
export async function GET(request: NextRequest, { params }: { params: { apiKey: string } }) {
  // Only use the apiKey from the url, because the url will be used as the key to cache the response
  // Reading it from the header will potentially read from a different cache key
  const apiKey = decodeBase64URL(params.apiKey || '');

  let passportConfigData: PassportConfig | null = null;

  if (!apiKey) {
    console.error('API key is missing. Please supply one.', {
      apiKey,
    });
    return createNextErrorResponse(
      400,
      MagicApiErrorCode.API_KEY_IS_MISSING,
      NextResponseErrorMessage.PassportConfigCacheKeyMissing,
      { params, headers: request.headers },
    );
  }

  // We need to remove excess headers that are not needed for the request, otherwise CF will block
  const headers: HeadersInit | undefined = {};

  request.headers.forEach((value, key) => {
    if (key.startsWith('x-magic') || key.startsWith('x-fortmatic') || key.startsWith('x-passport')) {
      headers[key] = value;
    }
  });

  try {
    passportConfigData = await HttpService.PassportIdentity.Get(Endpoint.PassportIdentity.Config, headers);
  } catch (e) {
    return surfaceApiErrorResponse(e as ApiResponseError);
  }

  if (!passportConfigData) {
    console.error(`${NextResponseErrorMessage.PassportConfigCacheDataMissing} ${apiKey}`);
    return createNextErrorResponse(
      400,
      MagicApiErrorCode.INVALID_API_KEY,
      NextResponseErrorMessage.PassportConfigCacheDataMissing,
      { params, headers: request.headers },
    );
  }

  return createNextResponse(passportConfigData, {
    'Cache-Control': 'public, s-maxage=60',
    'CDN-Cache-Control': 'public, s-maxage=60',
    'Vercel-CDN-Cache-Control': 'public, s-maxage=60',
  });
}
