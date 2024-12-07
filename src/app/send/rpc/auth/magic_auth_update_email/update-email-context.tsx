'use client';
import { createContext, ReactNode, useContext, useState } from 'react';

export type UpdateEmailState = {
  updateEmailCredential: string;
  newEmail: string;
  attemptId: string;
};

export type UpdateEmailStateContext = {
  updateEmailCredential: string;
  newEmail: string;
  attemptId: string;
  setUpdateEmailState: (state: UpdateEmailState) => void;
};

export const UpdateEmailContext = createContext<UpdateEmailStateContext>({
  updateEmailCredential: '',
  newEmail: '',
  attemptId: '',
  setUpdateEmailState: () => {},
});

export const UpdateEmailProvider = ({ children }: { children: ReactNode }) => {
  const [loginState, setUpdateEmailState] = useState<UpdateEmailState>({
    updateEmailCredential: '',
    newEmail: '',
    attemptId: '',
  } as UpdateEmailState);

  return (
    <UpdateEmailContext.Provider value={{ ...loginState, setUpdateEmailState }}>{children}</UpdateEmailContext.Provider>
  );
};

export const useUpdateEmailContext = () => useContext(UpdateEmailContext);
