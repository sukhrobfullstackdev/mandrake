import { createJwtWithIframeKP, setDpopHeader, strToUint8 } from '@utils/dpop';

describe('setDpopHeader', () => {
  it('should return an object with dpop property when jwt is provided', () => {
    const jwt = 'some.jwt.token';
    const result = setDpopHeader(jwt);
    expect(result).toEqual({ dpop: jwt });
  });

  it('should return an object with dpop property as empty string when jwt is not provided', () => {
    const resultWithoutArg = setDpopHeader();
    expect(resultWithoutArg).toEqual(undefined);

    const resultWithEmptyString = setDpopHeader('');
    expect(resultWithEmptyString).toEqual(undefined);
  });
});

describe('strToUint8', () => {
  test('converts a string to Uint8Array correctly', () => {
    const str = 'test';
    const uint8Array = strToUint8(str);
    // Convert both Uint8Arrays to regular arrays for comparison
    const actualArray = Array.from(uint8Array);
    const expectedArray = [116, 101, 115, 116]; // 'test' -> 116, 101, 115, 116
    expect(actualArray).toEqual(expectedArray);
  });
});

jest.mock('@lib/services/web-storage/data-api', () => ({
  data: {
    getItem: jest.fn(key => {
      if (key === 'RELAYER_STORE_KEY_PUBLIC_JWK') {
        return Promise.resolve({
          kty: 'EC',
          crv: 'P-256',
          x: 'MKBCTNIcKUSDii11ySs3526iDZ8AiTo7Tu6KPAqv7D4',
          y: '4Etl6SRW2YiFUzDMKzOJsGYtHuJVIh8sP4nI8dpjHT8',
          use: 'sig',
          kid: '1',
        });
      } else if (key === 'RELAYER_STORE_KEY_PRIVATE_KEY') {
        return Promise.resolve({
          type: 'private',
          algorithm: {
            name: 'ECDSA',
            namedCurve: 'P-256',
          },
          extractable: false,
          usages: ['sign'],
        });
      }
      return Promise.reject(new Error('Unknown key'));
    }),
  },
}));

// Utility function to decode base64 URL without padding
function base64UrlDecode(str: string) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );
  return JSON.parse(jsonPayload);
}

describe('createJwtWithIframeKP', () => {
  test('should return the jwt that was provided from the sdk', async () => {
    const jwtFromSDK = 'initialJwt';
    const result = await createJwtWithIframeKP(jwtFromSDK);
    expect(result).toBe(jwtFromSDK);
  });

  test('should return a generated jwt if none was provided from the sdk', async () => {
    const generatedJwt = (await createJwtWithIframeKP()) ?? ''; // Your function call here
    const [header, payload] = generatedJwt
      .split('.')
      .slice(0, 2)
      .map(part => base64UrlDecode(part));

    expect(header.typ).toEqual('dpop+jwt');
    expect(header.alg).toEqual('ES256');
    expect(payload).toBeDefined();
  });
});
