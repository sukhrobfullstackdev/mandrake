'use client';
import { createContext, ReactNode, useContext, useState } from 'react';
import { OwnedNFT } from '@hooks/passport/use-nfts-for-owner';

export type NftState = {
  selectedNft: OwnedNFT | null;
};

export type NftStateContext = {
  setNftState: (state: NftState) => void;
} & NftState;

const defaultNftState = {
  selectedNft: null,
};

export const PassportContext = createContext<NftStateContext>({
  ...defaultNftState,
  setNftState: () => {},
});

export const PassportProvider = ({ children }: { children: ReactNode }) => {
  const [nftState, setNftState] = useState<NftState>({
    ...defaultNftState,
  } as NftState);

  return <PassportContext.Provider value={{ ...nftState, setNftState }}>{children}</PassportContext.Provider>;
};

export const useNftContext = () => useContext(PassportContext);
