import { useStore } from '@hooks/store';
import { HttpService } from '@http-services';

jest.mock('uuid', () => ({
  v4: () => '123456',
}));

describe('@lib/http-services/magic-api', () => {
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
    const output = await HttpService.Magic.Get('/bar');

    expect(fetch).toHaveBeenCalledWith('https://api.test.foo.link/bar', {
      credentials: 'include',
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en_us',
        'content-type': 'application/json;charset=UTF-8',
        'x-amzn-trace-id': 'Root=123456',
        'x-fortmatic-network': 'foonet',
        'x-magic-api-key': 'foo_key',
        'x-magic-bundle-id': 'foo_id',
        'x-magic-meta': 'None',
        'x-magic-referrer': 'https://www.foo.com',
        'x-magic-sdk': 'foo-sdk',
        'x-magic-trace-id': '123456',
      },
      method: 'GET',
    });
    expect(output).toEqual('foo');
  });

  it('should make a get request with added header', async () => {
    const output = await HttpService.Magic.Get('/bar', { 'x-test-header': 'foo' });

    expect(fetch).toHaveBeenCalledWith('https://api.test.foo.link/bar', {
      credentials: 'include',
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en_us',
        'content-type': 'application/json;charset=UTF-8',
        'x-amzn-trace-id': 'Root=123456',
        'x-fortmatic-network': 'foonet',
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
    expect(output).toEqual('foo');
  });

  it('should make a get request with authorization header if UST is in state', async () => {
    useStore.setState({
      authUserSessionToken: '123abc',
    });

    const output = await HttpService.Magic.Get('/bar', { 'x-magic-api-key': '123' });

    expect(fetch).toHaveBeenCalledWith('https://api.test.foo.link/bar', {
      credentials: 'include',
      headers: {
        authorization: 'Bearer 123abc',
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en_us',
        'content-type': 'application/json;charset=UTF-8',
        'x-amzn-trace-id': 'Root=123456',
        'x-fortmatic-network': 'foonet',
        'x-magic-api-key': '123',
        'x-magic-bundle-id': 'foo_id',
        'x-magic-meta': 'None',
        'x-magic-referrer': 'https://www.foo.com',
        'x-magic-sdk': 'foo-sdk',
        'x-magic-trace-id': '123456',
      },
      method: 'GET',
    });
    expect(output).toEqual('foo');
  });

  it('should make a get request with customAuthorizationToken as authorization header if in state', async () => {
    useStore.setState({
      authUserSessionToken: 'test123',
    });

    const output = await HttpService.Magic.Get('/bar', { 'x-magic-api-key': '123' });

    expect(fetch).toHaveBeenCalledWith('https://api.test.foo.link/bar', {
      credentials: 'include',
      headers: {
        authorization: 'Bearer test123',
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en_us',
        'content-type': 'application/json;charset=UTF-8',
        'x-amzn-trace-id': 'Root=123456',
        'x-fortmatic-network': 'foonet',
        'x-magic-api-key': '123',
        'x-magic-bundle-id': 'foo_id',
        'x-magic-meta': 'None',
        'x-magic-referrer': 'https://www.foo.com',
        'x-magic-sdk': 'foo-sdk',
        'x-magic-trace-id': '123456',
      },
      method: 'GET',
    });

    expect(output).toEqual('foo');
  });

  it('should make request with customAuthorizationToken as auth header if both that and UST are in state', async () => {
    useStore.setState({
      authUserSessionToken: '123abc',
      customAuthorizationToken: 'custom-auth-jwt',
    });

    const output = await HttpService.Magic.Get('/bar', { 'x-magic-api-key': '123' });

    expect(fetch).toHaveBeenCalledWith('https://api.test.foo.link/bar', {
      credentials: 'include',
      headers: {
        authorization: 'Bearer 123abc',
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en_us',
        'content-type': 'application/json;charset=UTF-8',
        'x-amzn-trace-id': 'Root=123456',
        'x-custom-authorization-token': 'custom-auth-jwt',
        'x-fortmatic-network': 'foonet',
        'x-magic-api-key': '123',
        'x-magic-bundle-id': 'foo_id',
        'x-magic-meta': 'None',
        'x-magic-referrer': 'https://www.foo.com',
        'x-magic-sdk': 'foo-sdk',
        'x-magic-trace-id': '123456',
      },
      method: 'GET',
    });

    expect(output).toEqual('foo');
  });
});
