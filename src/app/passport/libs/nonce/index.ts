import { PassportSmartAccount } from '@hooks/passport/use-smart-account';
import { getCustomNonceKeyFromString } from '@zerodev/sdk';
import { ENTRYPOINT_ADDRESS_V07 } from 'permissionless';
import { v4 as uuid } from 'uuid';

export const getCustomNonce = async (smartAccount: PassportSmartAccount) => {
  const nonceKey = getCustomNonceKeyFromString(uuid(), ENTRYPOINT_ADDRESS_V07);
  const nonce = await smartAccount.getNonce(nonceKey);
  return nonce;
};
