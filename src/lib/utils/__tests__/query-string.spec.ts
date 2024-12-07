import { getDecodedQueryParams, getParsedQueryParams } from '@lib/utils/query-string';

describe('@utils/query-string', () => {
  it('should get parsed query params', () => {
    let output = getParsedQueryParams('foo');
    expect(output).toEqual({ foo: '' });

    output = getParsedQueryParams('?foo=bar&bar=baz');
    expect(output).toEqual({ foo: 'bar', bar: 'baz' });
  });

  it('should get decoded params', () => {
    let output = getDecodedQueryParams('');
    expect(output).toEqual({});

    output = getDecodedQueryParams(
      'eyJBUElfS0VZIjoicGtfZm9vIiwiRE9NQUlOX09SSUdJTiI6Imh0dHBzOi8vZm9vLmJhci5hcHAiLCJob3N0IjoibG9jYWxob3N0OjMwMDAiLCJzZGsiOiJtYWdpYy1zZGsiLCJ2ZXJzaW9uIjoiMS4yLjMiLCJsb2NhbGUiOiJlbl9VUyJ9',
    );
    expect(output).toEqual({
      apiKey: 'pk_foo',
      domainOrigin: 'https://foo.bar.app',
      host: 'localhost:3000',
      sdkType: 'magic-sdk',
      version: '1.2.3',
      locale: 'en_US',
    });
  });
});
