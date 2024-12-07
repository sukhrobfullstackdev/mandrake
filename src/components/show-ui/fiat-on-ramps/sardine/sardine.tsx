import FiatOnrampError from '@components/show-ui/fiat-on-ramps/FiatOnrampError';
import FiatOnrampSuccess from '@components/show-ui/fiat-on-ramps/FiatOnrampSuccess';
import { SARDINE_URL_PROD, SARDINE_URL_TEST } from '@constants/env';
import { ETH_SENDTRANSACTION } from '@constants/eth-rpc-methods';
import { MAGIC_WALLET } from '@constants/route-methods';
import { useChainInfo } from '@hooks/common/chain-info';
import { useSendRouter } from '@hooks/common/send-router';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { useSardineClientToken } from '@hooks/data/embedded/onramp';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { LoadingSpinner } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { useState } from 'react';

const Sardine = () => {
  const { chainInfo } = useChainInfo();
  const router = useSendRouter();
  const { userMetadata } = useUserMetadata();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const [isProcessed, setIsProcessed] = useState(false);

  const backNavigationRoute = activeRpcPayload?.method.endsWith(ETH_SENDTRANSACTION)
    ? '/send/rpc/eth/eth_sendTransaction'
    : activeRpcPayload?.method.endsWith(MAGIC_WALLET)
      ? '/send/rpc/wallet/magic_wallet/home'
      : '/send/rpc/wallet/magic_show_fiat_onramp';

  const {
    data: sardineToken,
    isLoading,
    error,
  } = useSardineClientToken({
    isMainnet: !!chainInfo?.isMainnet,
    paymentMethodTypeConfig: { default: 'ach', enabled: ['ach', 'us_debit'] },
  });

  const sardineUrl = chainInfo?.isMainnet ? SARDINE_URL_PROD : SARDINE_URL_TEST;
  const urlParams = [
    `address=${userMetadata?.publicAddress}`,
    `network=${chainInfo?.name.toLowerCase() || 'ethereum'}`,
    `client_token=${sardineToken}`,
    `fiat_amount=${chainInfo?.name === 'Polygon' ? '50' : '100'}`,
    `asset_type=${chainInfo?.currency.toLowerCase() || 'eth'}`,
  ];

  const handleBackButtonClick = () => {
    router.replace(backNavigationRoute);
  };

  const attachListener = () => {
    window.addEventListener('message', sardineEvent => {
      if (typeof sardineEvent?.data === 'string') {
        try {
          const dataObj = JSON.parse(sardineEvent.data);
          if (dataObj.status === 'processed') {
            setIsProcessed(true);
          }
        } catch (e) {
          logger.error('Error with parsing sardineEvent', e);
        }
      }
    });
  };

  return (
    <>
      {isLoading && (
        <VStack gap={24}>
          <LoadingSpinner size={36} strokeWidth={4} />
        </VStack>
      )}
      {isProcessed && <FiatOnrampSuccess onBackPress={handleBackButtonClick} />}
      {error && <FiatOnrampError onBackPress={handleBackButtonClick} error={error} />}
      {sardineToken && !isProcessed && (
        <iframe
          src={`${sardineUrl}/?${urlParams.join('&')}`}
          onLoad={attachListener}
          id="sardine_iframe"
          height="620px"
          width="419px"
          title="Sardine"
          allow="camera *;geolocation *"
          sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-scripts allow-top-navigation"
        />
      )}
    </>
  );
};

export default Sardine;
