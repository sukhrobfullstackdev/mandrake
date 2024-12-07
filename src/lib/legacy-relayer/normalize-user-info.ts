import { UserInfo } from '@custom-types/user';
import { UniversalUserInfoRetrieveResponse } from '@custom-types/wallet';

export function normalizeUserInfo(data: UniversalUserInfoRetrieveResponse): UserInfo {
  const userEmail = data.login.identifiers[0]?.identifier;
  return {
    authUserId: data.authUserId,
    authUserMfaActive: data.authUserMfaActive,
    authUserWalletId: data.authUserWalletId,
    utcTimestampMs: data.utcTimestampMs,
    clientId: data.clientId,
    publicAddress: data.publicAddress,
    consent: data.consent,
    usedChainIds: data.usedChainIds,
    challengeMessage: data.challengeMessage,
    login: {
      type: data.login.type,
      oauth2: data.login.oauth2,
      webauthn: data.login.webauthn as string,
    },
    recoveryFactors: [],
    ...(userEmail ? { email: userEmail } : {}),
  };
}
