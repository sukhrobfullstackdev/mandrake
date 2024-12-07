import { SdkMetadata } from '@lib/message-channel/resolve-json-rpc-response';
import type {} from '@redux-devtools/extension'; // required for devtools typing
import { Network } from 'magic-passport/types';
import { create } from 'zustand';
import { middleware } from './middleware';

/**
 * Describes the shape of known global options encoded
 * into the URL query for first-party Magic SDK extensions.
 */
export interface ExtensionOptions {
  /**
   * Custom theme parameters integrated specifically for UserVoice, a partner
   * that has unique requirements due to their multi-tenanted SaaS use-case.
   *
   * @see https://github.com/magiclabs/uservoice-theme-provider-extension
   */
  uservoiceThemeProvider: { appName: string | null; logoURL: string | null };

  [key: string]: unknown;
}

export interface DecodedQueryParams {
  apiKey?: string;
  domainOrigin?: string;
  ethNetwork?: string | { rpcUrl: string; chainId?: number; chainType?: string };
  network?: Network;
  host?: string;
  sdkType?: string;
  version?: string;
  ext?: Partial<ExtensionOptions>;
  locale?: string;
  bundleId?: string;
  meta?: Record<string, string>;
}

export interface StoreState {
  /**
   * App state
   *
   * these properties are related to Mandrake's applicationn state and should not be programmatically modified
   * caveat - `activeRpcPayload` is an exception, however `useResolveActiveRpcRequest` and `useRejectActiveRpcRequest` are the only places it should be modified
   */
  decodedQueryParams: DecodedQueryParams;
  magicApiKey: string | null;
  isAppConfigHydrated: boolean;
  messageEventListenerAdded: boolean;
  sdkMetaData: SdkMetadata | null;
  isGlobalAppScope: boolean;
  /**
   * User state
   *
   * these properties are related to the user's state and can be programmatically modified
   */
  authUserId: string | null;
  authUserSessionToken: string | null;
  email: string | null;
  phoneNumber: string | null;
  mfaEnrollInfo: string | null;
  mfaEnrollSecret: string | null;
  mfaRecoveryCodes: string[];
  customAuthorizationToken: string | null;
  systemClockOffset: number;
}

export const initialState: StoreState = {
  // initial app state
  decodedQueryParams: {},
  isAppConfigHydrated: false,
  magicApiKey: null,
  messageEventListenerAdded: false,
  sdkMetaData: null,
  isGlobalAppScope: false,

  // initial user state
  authUserId: null,
  authUserSessionToken: null,
  email: null,
  phoneNumber: null,
  mfaEnrollSecret: null,
  mfaEnrollInfo: null,
  mfaRecoveryCodes: [],
  customAuthorizationToken: null,
  systemClockOffset: 0,
};

export const useStore = create<StoreState>()(middleware((): StoreState => initialState));
