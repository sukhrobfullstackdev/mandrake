import { OAuthProvider } from '@custom-types/oauth';

export enum ConnectWithUILoginMethod {
  EMAIL = 'email',
  LEGACY_GOOGLE_SIGN_IN = 'legacy-google-sign-in', // This is only applicable for Universal wallet
  UNKNOWN = 'unknown',
}

export type ConnectWithUILoginType = ConnectWithUILoginMethod | OAuthProvider;
