'use client';
import { createContext, ReactNode, useContext, useState } from 'react';

export type LoginState = {
  utcTimestampMs: number;
  utcOtcExpiryMs: number;
  utcRetrygateMs: number;
  requestOriginMessage: string;
  loginFlowContext: string;
  showCloseButton: boolean;
  emailFromPayload: string;
  deviceVerificationLink?: string;
};

export type LoginStateContext = {
  setLoginState: (state: LoginState) => void;
} & LoginState;

const defaultLoginState = {
  utcTimestampMs: 0,
  utcOtcExpiryMs: 0,
  utcRetrygateMs: 0,
  requestOriginMessage: '',
  loginFlowContext: '',
  deviceVerificationLink: '',
  showCloseButton: false,
  emailFromPayload: '',
};

export const LoginContext = createContext<LoginStateContext>({
  ...defaultLoginState,
  setLoginState: () => {},
});

export const LoginProvider = ({ children }: { children: ReactNode }) => {
  const [loginState, setLoginState] = useState<LoginState>({
    ...defaultLoginState,
  } as LoginState);

  return <LoginContext.Provider value={{ ...loginState, setLoginState }}>{children}</LoginContext.Provider>;
};

export const useLoginContext = () => useContext(LoginContext);
