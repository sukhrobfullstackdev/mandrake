import KernelClientService, { CabEnabledNetworks } from '@app/passport/libs/tee/kernel-client';
import { usePassportStore } from '@hooks/data/passport/store';
import { KernelSmartAccount } from '@zerodev/sdk';
import { ENTRYPOINT_ADDRESS_V07 } from 'permissionless';
import { useEffect, useState } from 'react';
import { Chain, HttpTransport } from 'viem';

export type PassportSmartAccount = KernelSmartAccount<typeof ENTRYPOINT_ADDRESS_V07, HttpTransport, Chain>;

export const useSmartAccount = () => {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [smartAccount, setSmartAccount] = useState<PassportSmartAccount | undefined>(undefined);
  const currentState = usePassportStore.getState();
  const eoaPublicAddress = currentState.eoaPublicAddress;
  const accessToken = currentState.accessToken;
  const network = currentState.decodedQueryParams.network;

  const getSmartAccount = async () => {
    if (!network) {
      setError(new Error('Network not found'));
      return;
    }

    if (!eoaPublicAddress) {
      setError(new Error('EOA public address not found'));
      return;
    }

    if (!accessToken) {
      setError(new Error('Access token not found'));
      return;
    }

    try {
      const sa = await KernelClientService.getSmartAccount({ eoaPublicAddress, accessToken, network });

      if (!sa) {
        setError(new Error('Kernel account not found'));
        return;
      }

      setSmartAccount(sa);
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSmartAccount();
  }, []);

  const [isCabEnabledOnCurrentChain, setIsCabEnabledOnCurrentChain] = useState(false);
  // True when CAB was found to not be supported for the account on the current selected network
  // It polls for 10 seconds and if CAB status is still not supported, it will attempt to enableCab
  const [isPreparingAccount, setIsPreparingAccount] = useState(false);
  // True when performing initial check for if CAB is supported for the account on the current selected network
  const [isCheckingCABStatus, setIsCheckingCABStatus] = useState(true);
  const checkCABStatus = async (shouldPoll = true, pollingStartTime?: Date) => {
    if (!network || !smartAccount) return;
    if (isCabEnabledOnCurrentChain) return;
    const res = await KernelClientService.isAccountCABEnabledOnNetwork(smartAccount, network);
    // if res.isEnabledOnCurrentChain is false then set isPreparingAccount to current time and set a recursive timeout that stops 10 secs from now
    if (res.isEnabledOnCurrentChain) {
      setIsCabEnabledOnCurrentChain(true);
      setIsPreparingAccount(false);
    } else if (shouldPoll && res.enabledChains.length !== CabEnabledNetworks.length) {
      setIsPreparingAccount(true);
      setTimeout(async () => {
        if (pollingStartTime && Date.now() - pollingStartTime.getTime() > 10000) {
          // polling timed out, manually enable cab client for account, then do a final check (will still be false if network just isn't supported)
          await KernelClientService.enableCab(smartAccount, network);
          const finalRes = await KernelClientService.isAccountCABEnabledOnNetwork(smartAccount, network);
          setIsCabEnabledOnCurrentChain(finalRes.isEnabledOnCurrentChain);
          checkCABStatus(false);
        } else {
          // continue polling
          checkCABStatus(true, pollingStartTime ?? new Date(Date.now()));
        }
      }, 1000);
    } else {
      setIsCabEnabledOnCurrentChain(false);
      setIsPreparingAccount(false);
    }
    setIsCheckingCABStatus(false);
  };

  useEffect(() => {
    if (!smartAccount || !network || !isCheckingCABStatus) return;
    checkCABStatus();
  }, [smartAccount, isCheckingCABStatus, network]);

  return { smartAccount, isLoading, error, isCheckingCABStatus, isPreparingAccount, isCabEnabledOnCurrentChain };
};
