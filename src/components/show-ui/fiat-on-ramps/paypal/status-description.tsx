'use-client';

import { PaypalOrderStatus } from '@custom-types/onramp';
import { useTranslation } from '@lib/common/i18n';
import { Text } from '@magiclabs/ui-components';
import { token } from '@styled/tokens';

interface PayPalStatusDescriptionProps {
  step: PaypalOrderStatus.PENDING | PaypalOrderStatus.COMPLETED;
}

const paypalStatusMessage = {
  [PaypalOrderStatus.PENDING]: 'It may take a few minutes for your transaction to finish processing.',
  [PaypalOrderStatus.COMPLETED]:
    'It may take a few minutes for this page to update, but your purchase may appear in your wallet sooner.',
};

const PayPalStatusDescription = ({ step }: PayPalStatusDescriptionProps) => {
  const { t } = useTranslation('send');
  let paypalStatusDescription = paypalStatusMessage[step];

  if (!paypalStatusDescription) {
    paypalStatusDescription = 'It may take a few minutes for your transaction to finish processing.';
    logger.error(`Paypal status not found for step: ${step}`);
  }

  return (
    <Text size="sm" styles={{ textAlign: 'center', color: token('colors.text.tertiary') }}>
      {t(paypalStatusDescription)}
    </Text>
  );
};

export default PayPalStatusDescription;
