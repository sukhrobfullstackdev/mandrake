import {
  base64BinaryToUint8Array,
  decodeBase64,
  decodeBase64URL,
  encodeBase64,
  encodeBase64URL,
  fromBase64URL,
  parseJWT,
  toBase64URL,
} from '@lib/utils/base64';

describe('@utils/base64', () => {
  it('should decode a base64 string', () => {
    const output = decodeBase64('Zm9vYmFy');
    expect(output).toEqual('foobar');
  });

  it('should encode a base64 url', () => {
    const output = decodeBase64URL('aHR0cDovL2Zvby5iYXI');
    expect(output).toEqual('http://foo.bar');
  });

  it('should encode a base64 string', () => {
    const output = encodeBase64('foobar');
    expect(output).toEqual('Zm9vYmFy');
  });

  it('should encode a base64 url', () => {
    const output = encodeBase64URL('http://foo.bar');
    expect(output).toEqual('aHR0cDovL2Zvby5iYXI');
  });

  it('should convert a string to a base64 URL', () => {
    const output = toBase64URL('http://foo.bar');
    expect(output).toEqual('http:__foo.bar');
  });

  it('should convert to a string from a base64 URL', () => {
    const output = fromBase64URL('aHR0cDovL2Zvby5iYXI');
    expect(output).toEqual('aHR0cDovL2Zvby5iYXI=');
  });

  it('should parse JWT', () => {
    const output = parseJWT(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.dyt0CoTl4WoVjAHI9Q_CwSKhl6d_9rhM3NrXuJttkao',
    );
    expect(output).toEqual({
      header: { alg: 'HS256', typ: 'JWT' },
      payload: { admin: true, name: 'John Doe', sub: '1234567890' },
      sig: 'dyt0CoTl4WoVjAHI9Q_CwSKhl6d_9rhM3NrXuJttkao',
    });
  });

  it('should convert base64Binary to Uint8Array', () => {
    const output = base64BinaryToUint8Array('aHR0cDovL2Zvby5iYXI=');
    expect(output).toEqual(new Uint8Array([104, 116, 116, 112, 58, 47, 47, 102, 111, 111, 46, 98, 97, 114]));
  });
});
