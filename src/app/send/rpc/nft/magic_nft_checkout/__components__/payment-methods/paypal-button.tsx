import { usePaypalButtonShape } from '@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-paypal-button-shape';
import { useNftCheckoutContext } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context';
import { NFT_CHECKOUT_STATUS, PAYPAL_ERROR_MESSAGES } from '@constants/nft';
import { useClientId, useColorMode } from '@hooks/common/client-config';
import { useSendRouter } from '@hooks/common/send-router';
import { useNftCheckoutPayload, usePaypalClientToken } from '@hooks/data/embedded/nft';
import { createOrder } from '@hooks/data/embedded/nft/fetchers';
import { LoadingSpinner } from '@magiclabs/ui-components';
import { OnApproveData } from '@paypal/paypal-js';
import { FUNDING, PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { css } from '@styled/css';
import { Center, HStack, VStack } from '@styled/jsx';
import { useEffect } from 'react';

const Resolved = () => {
  const colorMode = useColorMode();
  const { nftCheckoutPayload } = useNftCheckoutPayload();

  const { setIsPaypalPending, setStatus } = useNftCheckoutContext();
  const [{ isPending }] = usePayPalScriptReducer();
  const paypalButtonShape = usePaypalButtonShape();

  const handleOnClick = () => {
    setIsPaypalPending(true);
  };

  const handleOnApprove = async (data: OnApproveData) => {
    setIsPaypalPending(false);

    const params = new URLSearchParams({
      orderId: data.orderID,
    });
    window.history.pushState(null, '', `?${params.toString()}`);

    setStatus(NFT_CHECKOUT_STATUS.PAYPAL_CHECKOUT);
  };

  const handleCreateOrder = async () => {
    setIsPaypalPending(true);

    const { orderId } = await createOrder({
      contractId: nftCheckoutPayload.contractId,
      toAddress: nftCheckoutPayload.walletAddress ?? '',
      tokenId: nftCheckoutPayload.tokenId,
      quantity: nftCheckoutPayload.quantity ? nftCheckoutPayload.quantity : 1,
    });

    return orderId;
  };

  const handleOnError = (e: Record<string, unknown>) => {
    logger.error('Error creating order', e);
    setIsPaypalPending(false);

    if (e?.message === PAYPAL_ERROR_MESSAGES.DETECTED_POPUP_CLOSE) {
      return;
    }

    if (e?.message === PAYPAL_ERROR_MESSAGES.NOT_ENOUGH_AVAILABLE_TOKENS) {
      setStatus(NFT_CHECKOUT_STATUS.PRICE_ESTIMATE_EXPIRED);
      return;
    }

    setStatus(NFT_CHECKOUT_STATUS.SOMETHING_WENT_WRONG);
  };

  const handleOnCancel = () => {
    setIsPaypalPending(false);
  };

  useEffect(() => {
    return () => {
      setIsPaypalPending(false);
    };
  }, []);

  return (
    <>
      <VStack w="full" h={12} pos="relative">
        {isPending && (
          <Center w="full" h={12} pos="absolute" borderRadius="full" top={0} left={0} right={0} bottom={0}>
            <LoadingSpinner size={20} strokeWidth={2.5} neutral />
          </Center>
        )}
        <PayPalButtons
          className={css({
            w: 'full',
            h: '3rem',
          })}
          fundingSource={FUNDING.PAYPAL}
          style={{
            shape: paypalButtonShape,
            tagline: false,
            height: 48,
            layout: 'horizontal',
            color: colorMode === 'dark' ? 'blue' : 'gold',
          }}
          onError={handleOnError}
          createOrder={handleCreateOrder}
          onApprove={handleOnApprove}
          onClick={handleOnClick}
          onCancel={handleOnCancel}
        />
      </VStack>
    </>
  );
};

export const PaypalButton = ({ disabled }: { disabled?: boolean }) => {
  const { nftCheckoutPayload } = useNftCheckoutPayload();
  const { clientId, error: clientIdError } = useClientId();
  const { data: paypalClientToken } = usePaypalClientToken({
    contractId: nftCheckoutPayload.contractId,
    magicClientId: clientId,
  });
  const router = useSendRouter();

  useEffect(() => {
    if (clientIdError) {
      logger.error('paypal-button - Error fetching client config', clientIdError);
      return router.replace('/send/error/config');
    }
  }, [clientIdError]);

  return (
    <HStack
      w="full"
      opacity={disabled ? 0.5 : 1}
      cursor={disabled ? 'not-allowed' : 'pointer'}
      pointerEvents={disabled ? 'none' : 'auto'}
    >
      <PayPalScriptProvider
        options={{
          clientId: paypalClientToken.paypalClientId,
          dataClientToken: paypalClientToken.paypalClientToken,
          merchantId: paypalClientToken.paypalMerchantId,
          dataPartnerAttributionId: paypalClientToken.paypalBnCode,
          components: 'buttons,hosted-fields',
          intent: 'authorize',
          vault: false,
          currency: 'USD',
        }}
      >
        <Resolved />
      </PayPalScriptProvider>
    </HStack>
  );
};
