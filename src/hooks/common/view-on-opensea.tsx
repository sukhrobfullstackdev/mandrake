import { OPENSEA_NETWORKS } from '@constants/opensea';
import { useChainInfo } from '@hooks/common/chain-info';
import { useFlags } from '@hooks/common/launch-darkly';
import { usePassportStore } from '@hooks/data/passport/store';
import { useTranslation } from '@lib/common/i18n';
import { useCallback, useEffect, useState } from 'react';

export const useDedicatedViewOnOpenSea = () => {
  const { chainInfo } = useChainInfo();
  const [showViewButton, setShowViewButton] = useState<boolean>(false);
  const [isCustomizedEnabled, setIsCustomizedEnabled] = useState<boolean>(false);

  const flags = useFlags();

  const customizeUrlFlag = flags?.isCustomizeNftMarketplaceUrlEnable;

  useEffect(() => {
    // if the flag is disabled Display the Opensea View button
    // If the flag is enabled and the URL is not empty Display the View button with customized URL
    // If the flag is enabled, hide the button
    setShowViewButton(!customizeUrlFlag || !!customizeUrlFlag?.url);
    setIsCustomizedEnabled(!!customizeUrlFlag?.url);
  }, []);

  const viewOnOpenSea = useCallback(
    ({ contractAddress, tokenId }: { contractAddress: string; tokenId: string | number }) => {
      if (!chainInfo || !Object.keys(OPENSEA_NETWORKS).includes(chainInfo.networkName)) {
        return;
      }

      const url = customizeUrlFlag?.enabled
        ? customizeUrlFlag?.url
        : `https://${chainInfo.isMainnet ? '' : 'testnets.'}opensea.io/assets/${
            OPENSEA_NETWORKS[chainInfo.networkName]
          }/${contractAddress}/${tokenId}`;

      window.open(url, '_blank', 'noopener noreferrer');
    },
    [chainInfo, customizeUrlFlag],
  );

  return { viewOnOpenSea, showViewButton, isCustomizedEnabled };
};

export const usePassportViewOnOpenSea = () => {
  const network = usePassportStore(state => state.decodedQueryParams.network);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useTranslation('passport');

  const viewOnOpenSea = useCallback(
    ({
      contractAddress,
      tokenId,
      networkName,
    }: {
      contractAddress: string;
      tokenId: string | number;
      networkName: string;
    }) => {
      if (!Object.keys(OPENSEA_NETWORKS).includes(networkName)) {
        return setError(new Error(t('Network not supported on OpenSea')));
      }
      if (error) setError(null);

      const url = `https://${network?.testnet ? 'testnets.' : ''}opensea.io/assets/${OPENSEA_NETWORKS[networkName]}/${contractAddress}/${tokenId}`;

      window.open(url, '_blank', 'noopener noreferrer');
    },
    [network],
  );

  return { viewOnOpenSea, error };
};
