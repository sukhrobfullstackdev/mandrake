import { CONFIRM_ACTION_JWT_PUBLIC_KEYS } from '@constants/confirm-action-keys';
import { DEPLOY_ENV } from '@constants/env';
import { DecodedTctPayload } from '@custom-types/confirm-action';
import { decodeBase64 } from '@lib/utils/base64';
import { importSPKI, jwtVerify } from 'jose';

export const getDecodedTctPayload = (tct: string) => {
  const parts = tct.split('.');
  return JSON.parse(decodeBase64(parts[1])) as DecodedTctPayload;
};

export const isTctTokenInvalidOrExpired = async (tct: string) => {
  const tctPayload = getDecodedTctPayload(tct);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  // Validate time stamp and show expired state if expired..
  if (currentTimestamp > tctPayload.exp) return true;

  try {
    const publicKey = await importSPKI(
      CONFIRM_ACTION_JWT_PUBLIC_KEYS[DEPLOY_ENV as keyof typeof CONFIRM_ACTION_JWT_PUBLIC_KEYS],
      'RS256',
    );

    await jwtVerify(tct, publicKey);

    return false;
  } catch (e) {
    return true;
  }
};
