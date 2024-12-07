import { MagicApiErrorCode } from '@constants/error';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';

export const createNextResponse = (data: unknown, headers: HeadersInit): Response => {
  return Response.json(
    {
      data: data,
      error_code: '',
      message: '',
      status: 'ok',
    },
    { status: 200, headers },
  );
};

export const surfaceApiErrorResponse = (error: ApiResponseError): Response => {
  console.error(error);
  return Response.json(
    {
      response: error.response,
      data: error.data,
      error_code: error.response?.error_code || 'internal_server_error',
      message: error.response?.message || 'Internal server error',
      status: 'failed',
    },
    { status: error.response?.status_code || 500 },
  );
};

export const createNextErrorResponse = (
  status: number,
  error_code: MagicApiErrorCode,
  message: NextResponseErrorMessage,
  extraData?: Record<string, unknown>,
): Response => {
  if (status < 500) {
    console.warn('status', status, 'error_code', error_code, 'message', message, extraData);
  } else {
    console.error('status', status, 'error_code', error_code, 'message', message, extraData);
  }
  return Response.json(
    {
      data: null,
      error_code: error_code,
      message: message,
      status: 'failed',
    },
    { status: status },
  );
};

export enum NextResponseErrorMessage {
  PassportConfigCacheDataMissing = 'Config Passport Cache Data Missing from given API KEY',
  PassportConfigCacheKeyMissing = 'Config Passport Cache Key Missing',
  ConfigClientCacheKeyMissing = 'Config Client Cache Key Missing',
  ConfigClientMiddlewareKeyMissing = 'Config Client Cache Key Missing in Middleware',
  ConfigClientCacheDataMissing = 'Config Client Cache Data Missing from given API KEY',
  ConfigClientMiddlewareDataMissing = 'Config Client Data Missing from given API KEY in Middleware',
  InvalidArguments = 'Invalid Arguments Provided.',
  SmartAccount = 'Failed to get smart account.',
}
