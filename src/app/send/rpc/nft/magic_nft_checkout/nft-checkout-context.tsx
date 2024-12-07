'use client';

import { NFT_CHECKOUT_STATUS } from '@constants/nft';
import { NftCheckoutStatus } from '@custom-types/nft';
import { createContext, ReactNode, useContext, useState } from 'react';

type NftCheckoutState = {
  status: NftCheckoutStatus;
  isPaypalPending: boolean;
};

type NftCheckoutStateContext = {
  setStatus: (nextStatus: NftCheckoutStatus) => void;
  setIsPaypalPending: (isPending: boolean) => void;
} & NftCheckoutState;

const defaultLoginState = {
  status: NFT_CHECKOUT_STATUS.HYDRATE_SESSION as NftCheckoutStatus,
  isPaypalPending: false,
};

export const NftCheckoutContext = createContext<NftCheckoutStateContext>({
  ...defaultLoginState,
  setStatus: () => {},
  setIsPaypalPending: () => {},
});

export const NftCheckoutProvider = ({ children }: { children: ReactNode }) => {
  const [nftCheckoutState, setNftCheckoutState] = useState<NftCheckoutState>({
    ...defaultLoginState,
  } as NftCheckoutState);

  const setStatus = (nextStatus: NftCheckoutStatus) => {
    defaultLoginState.status = nextStatus;
    setNftCheckoutState(prev => ({
      ...prev,
      status: nextStatus,
    }));
  };

  const setIsPaypalPending = (isPending: boolean) => {
    setNftCheckoutState(prev => ({
      ...prev,
      isPaypalPending: isPending,
    }));
  };

  return (
    <NftCheckoutContext.Provider value={{ ...nftCheckoutState, setStatus, setIsPaypalPending }}>
      {children}
    </NftCheckoutContext.Provider>
  );
};

export const useNftCheckoutContext = () => useContext(NftCheckoutContext);
