'use-client';

import PayPalOrderStatus from '@components/show-ui/fiat-on-ramps/paypal/order-status';
import PayPalOrderSteps from '@components/show-ui/fiat-on-ramps/paypal/order-steps';
import PayPalStatusDescription from '@components/show-ui/fiat-on-ramps/paypal/status-description';
import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { PayPalPendingAndCompletedProps } from '@custom-types/onramp';
import { useSendRouter } from '@hooks/common/send-router';
import { useTranslation } from '@lib/common/i18n';
import { Button, IcoCheckmarkCircleFill, Page } from '@magiclabs/ui-components';
import { Box, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';

const PayPalPendingAndCompleted = ({ transactionLink, step }: PayPalPendingAndCompletedProps) => {
  const { t } = useTranslation('send');
  const router = useSendRouter();

  const handlePressBack = () => {
    router.replace('/send/rpc/wallet/magic_show_fiat_onramp/');
  };

  return (
    <>
      <WalletPageHeader onPressBack={handlePressBack} />
      <Page.Icon>
        <Box mt={6}>
          <IcoCheckmarkCircleFill width={40} height={40} color={token('colors.brand.base')} />
        </Box>
      </Page.Icon>
      <Page.Content>
        <VStack gap={6}>
          <PayPalOrderStatus step={step} />
          <PayPalOrderSteps step={step} transactionLink={transactionLink} />
          <PayPalStatusDescription step={step} />
          <Box w="full" my={3}>
            <Button label={t('Done')} aria-label="done" expand onPress={handlePressBack} />
          </Box>
        </VStack>
      </Page.Content>
    </>
  );
};

export default PayPalPendingAndCompleted;
