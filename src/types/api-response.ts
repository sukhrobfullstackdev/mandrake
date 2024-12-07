import { MagicApiErrorCode } from '@constants/error';
import { SerializedHeaders } from '@lib/http-services/core/http-service-abstract';

export interface MagicAPIResponse<TData = { message: string }> {
  data: TData;
  error_code: MagicApiErrorCode;
  message: string;
  status: 'ok' | 'failed';
  headers: SerializedHeaders;
  status_code: number;
}
export interface WebAuthnDevicesInfoType {
  id: string;
  nickname: string;
  transport: string;
  userAgent: string;
}

export interface WebAuthnInfoType {
  devicesInfo: Array<WebAuthnDevicesInfoType>;
  username: string;
}

export interface UserConsentTypes {
  email: true;
}

export interface DelegatedWalletInfo {
  delegatedAccessToken: string;
  delegatedIdentityId: string;
  delegatedKeyId: string;
  delegatedPoolId: string;
}

export interface DkmsV3KeyData {
  magicKmsInfo: DelegatedWalletInfo;
  systemClockOffset: number;
}

export enum LoginMethodType {
  EmailLink = 'email_link',
  WebAuthn = 'webauthn',
  OAuth2 = 'oauth2',
  SMS = 'sms',
  SpireKey = 'spirekey',
}

export type MfaFactors = Array<{
  type: Array<'email_link' | 'totp' | 'recovery_codes' | 'public_address' | 'sms'>;
  isVerified: boolean;
}>;

export type MfaInfoData = {
  utcTimestampMs: number;
  loginFlowContext: string;
  factorsRequired: MfaFactors;
};
