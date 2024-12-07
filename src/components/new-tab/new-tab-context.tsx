'use client';
import { createContext, ReactNode, useContext, useState } from 'react';

export type NewTabState = {
  isThemeLoaded: boolean;
};

export type NewTabStateContext = {
  setNewTabState: (state: NewTabState) => void;
} & NewTabState;

const defaultNewTabState = {
  isThemeLoaded: false,
};

export const NewTabContext = createContext<NewTabStateContext>({
  ...defaultNewTabState,
  setNewTabState: () => {},
});

export const NewTabProvider = ({ children }: { children: ReactNode }) => {
  const [newTabState, setNewTabState] = useState<NewTabState>({
    ...defaultNewTabState,
  } as NewTabState);

  return <NewTabContext.Provider value={{ ...newTabState, setNewTabState }}>{children}</NewTabContext.Provider>;
};

export const useNewTabContext = () => useContext(NewTabContext);
