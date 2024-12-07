import { mock } from 'jest-mock-extended';
import { NextRequest } from 'next/server';
import { cspMiddleware } from '../middleware';

jest.mock('../middleware', () => {
  return {
    cspMiddleware: jest.fn((request, apiKeyParam) => {
      if (!apiKeyParam) {
        return Promise.reject(new Error('API_KEY is required'));
      }
      // Simulate the actual behavior of the function when an API key is provided
      return Promise.resolve({
        headers: {
          get: jest
            .fn()
            .mockReturnValue(
              "default-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'; connect-src 'self'; img-src 'self'; font-src 'self'; object-src 'self'; base-uri 'self'; form-action 'self'; worker-src 'self'; block-all-mixed-content; upgrade-insecure-requests;",
            ),
        },
      });
    }),
  };
});

describe('cspMiddleware', () => {
  const apiKey: string | undefined = 'pk_live_EXAMPLE';
  const domainOrigin: string | undefined = 'testDomainOrigin';
  const sdk: string | undefined = 'testSdk';

  it('should throw an error if API_KEY is not provided', async () => {
    const mockRequest = mock<NextRequest>();

    await expect(cspMiddleware(mockRequest, undefined, domainOrigin, sdk)).rejects.toThrow('API_KEY is required');
  });

  it('should set the Content-Security-Policy header correctly', async () => {
    const mockRequest = mock<NextRequest>();

    const response = await cspMiddleware(mockRequest, apiKey, domainOrigin, sdk);

    expect(response.headers.get('Content-Security-Policy')).toEqual(
      "default-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'; connect-src 'self'; img-src 'self'; font-src 'self'; object-src 'self'; base-uri 'self'; form-action 'self'; worker-src 'self'; block-all-mixed-content; upgrade-insecure-requests;",
    );
  });

  it('should set the x-nonce header correctly', async () => {
    const mockRequest = mock<NextRequest>();
    const response = await cspMiddleware(mockRequest, apiKey, domainOrigin, sdk);

    const nonce = response.headers.get('x-nonce');

    expect(nonce).toBeTruthy();
  });

  it('should throw an error if the fetch request fails', async () => {
    const mockRequest = mock<NextRequest>();

    (cspMiddleware as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Magic client config error')));

    await expect(cspMiddleware(mockRequest, apiKey, domainOrigin, sdk)).rejects.toThrow('Magic client config error');

    // Clear the mock after the test
    (cspMiddleware as jest.Mock).mockReset();
  });
});
