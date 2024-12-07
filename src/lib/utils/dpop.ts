import { SDKType } from '@constants/sdk-type';
import { useStore } from '@hooks/store';
import { data } from '@lib/services/web-storage/data-api';
import semver from 'semver';
import { v4 as uuid } from 'uuid';
import { encodeBase64URL } from './base64';
import {
  RELAYER_STORE_KEY_PRIVATE_KEY,
  RELAYER_STORE_KEY_PUBLIC_JWK,
  generateWCKP,
  isJWKValid,
  signatureSHA256Type,
  uint8ToUrlBase64,
} from './web-crypto';

/**
 * @param jwt
 */
export const setDpopHeader = (jwt?: string) => {
  if (jwt) {
    return { dpop: jwt };
  }
};

export function strToUint8(str: string) {
  return new TextEncoder().encode(str);
}

function shouldOverwriteToIframeDpop(): boolean {
  // For legacy SDK without KP or versions with KP being removed upon logout
  // We should fallback to iframe keys to generate dpop for consistent device profile
  try {
    const { version, sdkType } = useStore.getState().decodedQueryParams;
    const semverVersion = semver.valid(semver.coerce(version));

    if (semverVersion !== null && sdkType === SDKType.MagicSDK) {
      return semver.lt(semverVersion, '18.4.0');
    }
  } catch (e) {
    return false;
  }
  return false;
}

export async function createJwtWithIframeKP(jwtFromSDK?: string) {
  // this is the jwt from sdkMetadata
  // this is for mobile and legacy versions of Magic SDK which do not pass in the jwt
  if (jwtFromSDK && !shouldOverwriteToIframeDpop()) {
    return jwtFromSDK;
  }

  try {
    let publicJwk = (await data.getItem(RELAYER_STORE_KEY_PUBLIC_JWK)) as JsonWebKey;
    let privateJwk = (await data.getItem(RELAYER_STORE_KEY_PRIVATE_KEY)) as CryptoKey;

    // mobile or legacy versions of Magic SDK which do not pass in the jwt
    if (!publicJwk || !privateJwk || !isJWKValid(publicJwk)) {
      await generateWCKP();
    }

    publicJwk = (await data.getItem(RELAYER_STORE_KEY_PUBLIC_JWK)) as JsonWebKey;
    privateJwk = (await data.getItem(RELAYER_STORE_KEY_PRIVATE_KEY)) as CryptoKey;

    const { subtle } = window.crypto;

    if (!privateJwk || !subtle) {
      logger.error('unable to find private key or webcrypto unsupported', {
        jwtFromSDK,
      });
      return jwtFromSDK;
    }

    const claims = {
      iat: Math.floor(new Date().getTime() / 1000),
      jti: uuid(),
    };

    const headers = {
      typ: 'dpop+jwt',
      alg: 'ES256',
      jwk: publicJwk,
    };

    const jws = {
      protected: encodeBase64URL(JSON.stringify(headers)),
      claims: encodeBase64URL(JSON.stringify(claims)),
    };

    const payload = strToUint8(`${jws.protected}.${jws.claims}`);
    const sig = uint8ToUrlBase64(new Uint8Array(await subtle.sign(signatureSHA256Type, privateJwk, payload)));

    return `${jws.protected}.${jws.claims}.${sig}`;
  } catch {
    return jwtFromSDK;
  }
}
