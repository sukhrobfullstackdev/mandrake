'use client';
import { createContext, ReactNode, useContext, useState } from 'react';

export interface DisableMfaState {
  recoveryCode: string;
  setRecoveryCode: (recoveryCode: string) => void;
}

export const DisableMfaContext = createContext<DisableMfaState>({
  recoveryCode: '',
  setRecoveryCode: () => {},
});

export const DisableMfaProvider = ({ children }: { children: ReactNode }) => {
  const [recoveryCode, setRecoveryCode] = useState<string>('');

  return <DisableMfaContext.Provider value={{ recoveryCode, setRecoveryCode }}>{children}</DisableMfaContext.Provider>;
};

export const useDisableMfaContext = () => useContext(DisableMfaContext);
