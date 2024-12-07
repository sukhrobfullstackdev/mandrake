'use client';

import { PaypalCardForm } from '@app/send/rpc/nft/magic_nft_checkout/__components__/card-payment/paypal-card-form';
import { useClientId, useColorMode } from '@hooks/common/client-config';
import { useSendRouter } from '@hooks/common/send-router';
import { useNftCheckoutPayload, usePaypalClientToken } from '@hooks/data/embedded/nft';
import { createOrder } from '@hooks/data/embedded/nft/fetchers';
import { useTranslation } from '@lib/common/i18n';
import { Animate, Text } from '@magiclabs/ui-components';
import { PayPalHostedFieldsProvider, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { css } from '@styled/css';
import { VStack } from '@styled/jsx';
import { useCallback, useEffect } from 'react';

export const CardPayment = () => {
  const { t } = useTranslation('send');
  const { nftCheckoutPayload } = useNftCheckoutPayload();
  const { clientId, error: clientIdError } = useClientId();
  const { data: paypalClientToken } = usePaypalClientToken({
    contractId: nftCheckoutPayload.contractId,
    magicClientId: clientId,
  });
  const colorMode = useColorMode();
  const router = useSendRouter();

  const handleCreateOrder = useCallback(async () => {
    const { orderId } = await createOrder({
      contractId: nftCheckoutPayload.contractId,
      toAddress: nftCheckoutPayload.walletAddress ?? '',
      tokenId: nftCheckoutPayload.tokenId,
      quantity: nftCheckoutPayload.quantity ?? 1,
    });

    return orderId;
  }, [nftCheckoutPayload]);

  useEffect(() => {
    if (clientIdError) {
      logger.error('Card Payment - Error fetching client config', clientIdError);
      return router.replace('/send/error/config');
    }
  }, [clientIdError]);

  return (
    <Animate type="slide" asChild>
      <VStack
        w="full"
        gap={6}
        mt={6}
        alignItems="flex-start"
        className={css({
          '& div': {
            w: 'full',
          },
        })}
      >
        <Text.H3>{t('Payment details')}</Text.H3>

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
          <PayPalHostedFieldsProvider
            styles={{
              input: {
                'font-size': '1rem',
                'font-weight': 300,
                'font-family': 'sans-serif',
                // Cannot use tokens here, PayPal only recognizes hex codes
                color: colorMode === 'dark' ? '#fff' : '#18171A',
              },
            }}
            createOrder={handleCreateOrder}
          >
            <PaypalCardForm />
          </PayPalHostedFieldsProvider>
        </PayPalScriptProvider>
      </VStack>
    </Animate>
  );
};
