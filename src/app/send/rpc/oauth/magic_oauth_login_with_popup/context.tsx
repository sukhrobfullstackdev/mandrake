'use client';
import { OAuthMetadata } from '@custom-types/oauth';
import { createContext, ReactNode, useContext, useState } from 'react';

type OAuthState = {
  provider?: string;
  providerURI?: string;
  providerResult?: string;
  metaData: OAuthMetadata | null;
};

type Context = OAuthState & {
  setOAuthState: (state: OAuthState) => void;
};

export const OAuthContext = createContext<Context>({
  provider: '',
  providerURI: '',
  providerResult: '',
  metaData: null,
  setOAuthState: () => {},
});

const contextDefault = {
  provider: '',
  providerURI: '',
  providerResult: '',
  metaData: null,
};

export const OAuthProvider = ({ children }: { children: ReactNode }) => {
  const [oauthState, setOAuthState] = useState<OAuthState>(contextDefault);
  return <OAuthContext.Provider value={{ ...oauthState, setOAuthState }}>{children}</OAuthContext.Provider>;
};

export const useOAuthContext = () => {
  return useContext(OAuthContext);
};
