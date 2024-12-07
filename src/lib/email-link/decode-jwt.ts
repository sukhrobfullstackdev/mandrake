interface DecodedJWT<TPayload extends Record<string, string | number>> {
  header: {
    alg: string;
    typ?: string;
    kid?: string;
    jku?: string;
    x5u?: string;
    x5t?: string;
  };
  payload: TPayload & Record<string, string | number>;
  signature?: string;
}

export function decodeJWT<TPayload extends Record<string, string | number>>(
  token: string,
  b64UrlDecoder: (b64: string) => string,
): DecodedJWT<TPayload> {
  const [header, payload, signature] = token.split('.');
  const headerDecoded = JSON.parse(b64UrlDecoder(header));
  const payloadDecoded = JSON.parse(b64UrlDecoder(payload));

  return { header: headerDecoded, payload: payloadDecoded, signature };
}
