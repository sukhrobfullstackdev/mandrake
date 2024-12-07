// prettier-ignore

import type { } from '@redux-devtools/extension'; // required for devtools typing
import { Network } from 'magic-passport/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { middleware } from './middleware';

/**
 * Describes the shape of known global options encoded
 * into the URL query for first-party Magic SDK extensions.
 */
// export interface ExtensionOptions {
//   /**
//    * Custom theme parameters integrated specifically for UserVoice, a partner
//    * that has unique requirements due to their multi-tenanted SaaS use-case.
//    *
//    * @see https://github.com/magiclabs/uservoice-theme-provider-extension
//    */
//   uservoiceThemeProvider: { appName: string | null; logoURL: string | null };

//   [key: string]: unknown;
// }

export interface DecodedPassportQueryParams {
  apiKey?: string;
  network?: Network;
  // host?: string;
  sdkType?: string;
  // version?: string;
  locale?: string;
  // bundleId?: string;
  // meta?: Record<string, string>;
}

export interface PassportStoreState {
  /**
   * App state
   */
  decodedQueryParams: DecodedPassportQueryParams;
  magicApiKey: string | null;
  isAppConfigHydrated: boolean;
  messageEventListenerAdded: boolean;

  /**
   * User state
   */
  userId: string | null;
  email: string | null;
  /**
   * Persisted state
   */
  accessToken: string | null;
  eoaPublicAddress: string | null;
  existingPasskeyCredentialIds: string[];
  refreshToken: string | null;
}

export const initialState: PassportStoreState = {
  // initial app state
  decodedQueryParams: {},
  magicApiKey: null,
  isAppConfigHydrated: false,
  messageEventListenerAdded: false,

  // initial user state
  userId: null,
  email: null,

  // initial persisted state
  accessToken: null,
  eoaPublicAddress: null,
  existingPasskeyCredentialIds: [],
  refreshToken: null,
};

export interface PersistedPassportStoreState {
  /**
   * Persisted state
   */
  accessToken: string | null;
  eoaPublicAddress: string | null;
  existingPasskeyCredentialIds: string[];
  refreshToken: string | null;
}

export const usePassportStore = create<PassportStoreState>()(
  persist(
    middleware((): PassportStoreState => initialState),
    {
      name: 'passport-store',
      version: 1,
      partialize: state => ({
        accessToken: state.accessToken,
        eoaPublicAddress: state.eoaPublicAddress,
        existingPasskeyCredentialIds: state.existingPasskeyCredentialIds,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
