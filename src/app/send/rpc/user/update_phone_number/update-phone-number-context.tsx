'use client';
import { createContext, ReactNode, useContext, useState } from 'react';

export type UpdatePhoneNumberState = {
  updatePhoneNumberCredential: string;
  attemptId: string;
  newPhoneNumber?: string;
  oldPhoneNumber?: string;
  updatePhoneNumberFactorId?: string;
};

export type UpdatePhoneNumberStateContext = {
  updatePhoneNumberCredential: string;
  attemptId: string;
  newPhoneNumber?: string;
  oldPhoneNumber?: string;
  updatePhoneNumberFactorId?: string;
  setUpdatePhoneNumberState: (state: UpdatePhoneNumberState) => void;
};

export const UpdatePhoneNumberContext = createContext<UpdatePhoneNumberStateContext>({
  updatePhoneNumberCredential: '',
  attemptId: '',
  newPhoneNumber: '',
  oldPhoneNumber: '',
  updatePhoneNumberFactorId: '',
  setUpdatePhoneNumberState: () => {},
});

export const UpdatePhoneNumberProvider = ({ children }: { children: ReactNode }) => {
  const [loginState, setUpdatePhoneNumberState] = useState<UpdatePhoneNumberState>({
    updatePhoneNumberCredential: '',
    newPhoneNumber: '',
    oldPhoneNumber: '',
    attemptId: '',
  } as UpdatePhoneNumberState);

  return (
    <UpdatePhoneNumberContext.Provider value={{ ...loginState, setUpdatePhoneNumberState }}>
      {children}
    </UpdatePhoneNumberContext.Provider>
  );
};

export const useUpdatePhoneNumberContext = () => useContext(UpdatePhoneNumberContext);
