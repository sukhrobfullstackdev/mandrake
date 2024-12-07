import { CSRF_TOKEN_COOKIE, OAUTH_MOBILE_BUNDLE_ID } from '@constants/cookies';
import { useStore } from '@hooks/store';
import { HttpService } from '@http-services';

jest.mock('uuid', () => ({
  v4: () => '123456',
}));

jest.mock('cookies-next', () => ({
  getCookie: jest.fn().mockImplementation(input => {
    switch (input) {
      case CSRF_TOKEN_COOKIE:
        return 'abc123';
      case OAUTH_MOBILE_BUNDLE_ID:
        return 'defg456';
      default:
        return '';
    }
  }),
}));

describe('@lib/http-services/nft-api', () => {
  beforeEach(() => {
    process.env.VERCEL_ENV = 'test';
    useStore.setState({
      decodedQueryParams: {
        apiKey: 'foo_key',
        bundleId: 'foo_id',
        domainOrigin: 'https://www.foo.com',
        ethNetwork: 'foonet',
        locale: 'en_us',
        sdkType: 'foo-sdk',
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should make a get request', async () => {
    const output = await HttpService.Nft.Get('/bar');

    expect(fetch).toHaveBeenCalledWith('https://nft-api.test.foo.link/bar', {
      headers: {
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json;charset=UTF-8',
        'x-fortmatic-network': 'foonet',
        'accept-language': 'en_us',
        'x-amzn-trace-id': 'Root=123456',
        'x-magic-api-key': 'foo_key',
        'x-magic-bundle-id': 'foo_id',
        'x-magic-meta': 'None',
        'x-magic-referrer': 'https://www.foo.com',
        'x-magic-sdk': 'foo-sdk',
        'x-magic-trace-id': '123456',
      },
      method: 'GET',
    });
    expect(output).toEqual({ data: 'foo', headers: {}, message: 'bar', status: 'ok', statusCode: 200 });
  });

  it('should make a get request with added header', async () => {
    const output = await HttpService.Nft.Get('/bar', { 'x-test-header': 'foo' });

    expect(fetch).toHaveBeenCalledWith('https://nft-api.test.foo.link/bar', {
      headers: {
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json;charset=UTF-8',
        'x-fortmatic-network': 'foonet',
        'accept-language': 'en_us',
        'x-amzn-trace-id': 'Root=123456',
        'x-magic-api-key': 'foo_key',
        'x-magic-bundle-id': 'foo_id',
        'x-magic-meta': 'None',
        'x-magic-referrer': 'https://www.foo.com',
        'x-magic-sdk': 'foo-sdk',
        'x-magic-trace-id': '123456',
        'x-test-header': 'foo',
      },
      method: 'GET',
    });
    expect(output).toEqual({ data: 'foo', headers: {}, message: 'bar', status: 'ok', statusCode: 200 });
  });

  it('should make a get request with authorization header if UST is in state', async () => {
    useStore.setState({
      authUserSessionToken: '123abc',
      customAuthorizationToken: 'custom-auth-jwt',
    });

    const output = await HttpService.Nft.Get('/bar', { 'x-magic-api-key': '123' });

    expect(fetch).toHaveBeenCalledWith('https://nft-api.test.foo.link/bar', {
      headers: {
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json;charset=UTF-8',
        authorization: 'Bearer 123abc',
        'x-custom-authorization-token': 'custom-auth-jwt',
        'x-fortmatic-network': 'foonet',
        'accept-language': 'en_us',
        'x-amzn-trace-id': 'Root=123456',
        'x-magic-api-key': '123',
        'x-magic-bundle-id': 'foo_id',
        'x-magic-meta': 'None',
        'x-magic-referrer': 'https://www.foo.com',
        'x-magic-sdk': 'foo-sdk',
        'x-magic-trace-id': '123456',
      },
      method: 'GET',
    });
    expect(output).toEqual({ data: 'foo', headers: {}, message: 'bar', status: 'ok', statusCode: 200 });
  });
});
