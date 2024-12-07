'use-client';

import PayPalTransactionLink from '@components/show-ui/fiat-on-ramps/paypal/transaction-link';
import { PayPalPendingAndCompletedProps, PaypalOrderStatus } from '@custom-types/onramp';
import { useTranslation } from '@lib/common/i18n';
import { IcoCheckmarkCircleFill, LoadingSpinner, Text } from '@magiclabs/ui-components';
import { HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';

const paypalStepsIcon = {
  [PaypalOrderStatus.PENDING]: <LoadingSpinner size={20} strokeWidth={3} />,
  [PaypalOrderStatus.COMPLETED]: (
    <IcoCheckmarkCircleFill color={token('colors.brand.lighter')} width={20} height={20} />
  ),
};

const PayPalOrderSteps = ({ transactionLink, step }: PayPalPendingAndCompletedProps) => {
  const { t } = useTranslation('send');

  return (
    <VStack gap={4} alignItems="flex-start">
      <HStack gap={4}>
        <IcoCheckmarkCircleFill color={token('colors.brand.lighter')} width={20} height={20} />
        <HStack gap={1.5}>
          <Text variant="info" styles={{ fontWeight: 'bold' }}>
            {t('Transfer initiated')}
          </Text>
          <PayPalTransactionLink transactionLink={transactionLink} />
        </HStack>
      </HStack>
      <HStack gap={4}>
        {paypalStepsIcon[step]}
        <Text variant="info" styles={{ fontWeight: 'bold' }}>
          {t('Transfer complete')}
        </Text>
      </HStack>
    </VStack>
  );
};

export default PayPalOrderSteps;
