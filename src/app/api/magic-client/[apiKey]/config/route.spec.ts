/**
 * @jest-environment node
 */
// Note that setting the jest-environment to node above is required for testing Next API routes
// we disable the following because we're not picking the variable names like "error_code" these are from the system

import { MagicApiErrorCode } from '@constants/error';
import { HttpService } from '@lib/http-services';
import { NextResponseErrorMessage } from '@lib/http-services/util/next-response';
import { NextRequest } from 'next/server';
import { GET } from './route';

describe('success', () => {
  it('should return data with status 200 if client config response is successful', async () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn()); // expected to be called in the handler
    jest.spyOn(console, 'warn').mockImplementation(jest.fn()); // expected to be called in createNextErrorResponse()

    const expectedData = { id: 'some-id' };
    // mock magic service request to return undefined
    jest.spyOn(HttpService.Magic, 'Get').mockImplementation(jest.fn(() => new Promise(res => res(expectedData))));

    const response = await GET(
      new NextRequest(new URL('http://testurl'), {
        headers: {
          'x-magic-test-header': 'test-value',
          'x-fortmatic-test-header': 'test-value',
          'other-test-header': 'test-value',
        },
      }),
      { params: { apiKey: 'test-api-key' } },
    );
    const body = await response.json();
    const { data } = body;

    expect(response.status).toBe(200);
    expect(data).toEqual(expectedData);
  });
});

describe('failure', () => {
  it('should return with status 400 if no apiKey provided', async () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn()); // expected to be called in the handler
    jest.spyOn(console, 'warn').mockImplementation(jest.fn()); // expected to be called in createNextErrorResponse()

    const response = await GET(new NextRequest(new URL('http://testurl')), { params: { apiKey: '' } });
    const body = await response.json();
    const { error_code, message, status } = body;

    expect(response.status).toBe(400);
    expect(error_code).toBe(MagicApiErrorCode.API_KEY_IS_MISSING);
    expect(message).toBe(NextResponseErrorMessage.ConfigClientCacheKeyMissing);
    expect(status).toBe('failed');
  });

  it('should return with status 400 if client config response is empty or unexpected', async () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn()); // expected to be called in the handler
    jest.spyOn(console, 'warn').mockImplementation(jest.fn()); // expected to be called in createNextErrorResponse()

    // mock magic service request to return undefined
    jest.spyOn(HttpService.Magic, 'Get').mockImplementation(jest.fn(() => new Promise(res => res(undefined))));

    const response = await GET(new NextRequest(new URL('http://testurl')), { params: { apiKey: 'test-api-key' } });
    const body = await response.json();
    const { error_code, message, status } = body;

    expect(response.status).toBe(400);
    expect(error_code).toBe(MagicApiErrorCode.INVALID_API_KEY);
    expect(message).toBe(NextResponseErrorMessage.ConfigClientCacheDataMissing);
    expect(status).toBe('failed');
  });

  it('should return with status 500 and surface error if magic service called fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn()); // expected to be called in the handler
    jest.spyOn(console, 'warn').mockImplementation(jest.fn()); // expected to be called in createNextErrorResponse()

    // mock magic service request to return undefined
    jest.spyOn(HttpService.Magic, 'Get').mockImplementation(
      jest.fn(() => {
        throw new Error();
      }),
    );

    const response = await GET(new NextRequest(new URL('http://testurl')), { params: { apiKey: 'test-api-key' } });
    const body = await response.json();
    const { error_code, message, status } = body;

    expect(response.status).toBe(500);
    expect(error_code).toBe('internal_server_error');
    expect(message).toBe('Internal server error');
    expect(status).toBe('failed');
  });
});
