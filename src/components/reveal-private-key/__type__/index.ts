import { OAuthProvider } from '@custom-types/oauth';

export enum RevealViewType {
  EXPORT = 'EXPORT',
  REVEAL = 'REVEAL',
}

export type RevealViewTypeObj = {
  [x in RevealViewType]: string;
};

export enum PrimaryLogin {
  EMAIL = 'email',
  PHONE = 'phone',
  WEBAUTHN = 'webauthn',
}

export enum LoginProvider {
  LINK = 'link',
  SMS = 'sms',
  WEBAUTHN = 'webauthn',
  OAUTH2 = 'oauth2',
}

export type LoginArg = PrimaryLogin | OAuthProvider;
