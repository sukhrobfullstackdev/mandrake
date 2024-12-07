import { LoginMethodType, UserConsentTypes, WebAuthnInfoType } from './api-response';
import { RecoveryFactor } from './mfa';

export type MagicUserMetadata = {
  issuer: string | null;
  publicAddress: string | null;
  email: string | null;
  phoneNumber: string | null;
  isMfaEnabled: boolean;
  recoveryFactors: RecoveryFactor[];
};

export interface UserInfo {
  authUserId: string;
  authUserMfaActive: boolean;
  authUserWalletId: string;
  utcTimestampMs: number;
  clientId: string;
  publicAddress: string;
  consent: UserConsentTypes;
  usedChainIds?: string[] | undefined[];
  challengeMessage: string;
  login: {
    type: LoginMethodType;
    oauth2: string | null;
    webauthn: string | null | WebAuthnInfoType;
  };
  recoveryFactors: RecoveryFactor[];
  email?: string;
  phoneNumber?: string;
}
