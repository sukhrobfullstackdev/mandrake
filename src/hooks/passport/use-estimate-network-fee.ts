/* istanbul ignore file */
import { estimateCabUserOpGasFee, estimateNonCabUserOpGasFee, NetworkFee } from '@app/passport/libs/network-fee';
import KernelClientService, { CabEnabledNetworks } from '@app/passport/libs/tee/kernel-client';
import { useCurrencyFormatter } from '@hooks/common/currency-formatter';
import { useTokenFormatter } from '@hooks/common/token-formatter';
import { usePassportStore } from '@hooks/data/passport/store';
import { PassportSmartAccount } from '@hooks/passport/use-smart-account';
import { Call, Network } from 'magic-passport/types';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';

interface EstimateNetworkFeeProps {
  calls: Call[] | null;
  smartAccount?: PassportSmartAccount;
}
interface UseEstimateNetworkFeeProps extends EstimateNetworkFeeProps {
  enabled?: boolean;
  isCabOperation: boolean;
  selectedTokenSymbol: string;
}

export const useEstimateNetworkFee = ({
  calls,
  smartAccount,
  enabled,
  isCabOperation,
  selectedTokenSymbol,
}: UseEstimateNetworkFeeProps) => {
  const network = usePassportStore(state => state.decodedQueryParams.network) as Network;

  const { t } = useTranslation('passport');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [networkFeeUsd, setNetworkFeeUsd] = useState<number>();
  const [networkFeeNativeToken, setNetworkFeeNativeToken] = useState<string>();
  const [networkFeeError, setNetworkFeeError] = useState<string | null>(null);
  const { formattedValue: networkFeeUsdFormatted } = useCurrencyFormatter({ value: networkFeeUsd || 0 });
  const networkFeeNativeTokenFormatted = useTokenFormatter({ value: Number(networkFeeNativeToken) || 0, token: 'ETH' });
  const [isStale, setIsStale] = useState<boolean>(true);

  let interval: NodeJS.Timeout;

  useEffect(() => {
    interval = setInterval(() => setIsStale(true), 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsStale(true);
    clearInterval(interval);
    interval = setInterval(() => setIsStale(true), 30000);
  }, [isCabOperation]);

  useEffect(() => setIsStale(true), [isCabOperation]);

  const calculateNetworkFees = async () => {
    if (!smartAccount || !calls) throw new Error('Smart account or userop calls not found');
    setIsLoading(true);
    setNetworkFeeError(null);
    try {
      let networkFee: NetworkFee;

      if (isCabOperation) networkFee = await estimateCabUserOpGasFee(smartAccount, network, calls);
      else networkFee = await estimateNonCabUserOpGasFee(smartAccount, network, calls);

      setNetworkFeeNativeToken(networkFee.networkFeeNativeToken);
      setNetworkFeeUsd(networkFee.networkFeeUsd);
      setNetworkFeeError(null);
    } catch (error: unknown) {
      logger.error(error);
      if ((error as Error).message.toLowerCase().includes('repay tokens')) {
        // user does not have enough tokens to perform the user operation, no op
        setNetworkFeeError(`${t('Insufficient')} ${selectedTokenSymbol} ${t('balance to perform this operation.')}`);
      } else if (/No registered paymaster on sponsor chain (\d+)/.test((error as Error).message)) {
        const result = (error as Error).message.match(/No registered paymaster on sponsor chain (\d+)/);
        const chainId = result?.[1];
        if (chainId && (CabEnabledNetworks as unknown[]).includes(parseInt(chainId || ''))) {
          // This is a CAB supported chain but
          // Zerodev's paymaster has not yet registered this address on the sponsor chain
          // will enable cab again just in case
          setNetworkFeeError(t('Your account is being set up, please try again in a few minutes.'));
          KernelClientService.enableCab(smartAccount, network).catch(() => {
            setNetworkFeeError(t('Network fee estimation failed. Please close the popup and try again.'));
          });
        } else {
          setNetworkFeeError(t('This token is not supported. Please select another.'));
        }
      } else {
        setNetworkFeeError(t('Network fee estimation failed. Please close the popup and try again.'));
      }
    }
    setIsStale(false);
    setIsLoading(false);
  };

  // Calculate network fee in USD & Native Token
  useEffect(() => {
    if (!smartAccount || !calls || !enabled || !isStale || isLoading) return;
    calculateNetworkFees();
  }, [smartAccount, calls, enabled, isStale, isLoading, isCabOperation]);

  return {
    networkFeeUsd,
    networkFeeNativeToken,
    networkFeeUsdFormatted,
    networkFeeNativeTokenFormatted,
    error: networkFeeError,
    isLoading,
  };
};
