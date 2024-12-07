'use-client';

import { PaypalOrderStatus } from '@custom-types/onramp';
import { useTranslation } from '@lib/common/i18n';
import { Text } from '@magiclabs/ui-components';

interface PayPalOrderStatusProps {
  step: PaypalOrderStatus.PENDING | PaypalOrderStatus.COMPLETED;
}

const paypalStatusMessage = {
  [PaypalOrderStatus.PENDING]: 'Processing Purchase...',
  [PaypalOrderStatus.COMPLETED]: 'Purchase Complete!',
};

const PayPalOrderStatus = ({ step }: PayPalOrderStatusProps) => {
  const { t } = useTranslation('send');
  let paypalStatus = paypalStatusMessage[step];

  if (!paypalStatus) {
    paypalStatus = 'Processing Purchase...';
    logger.error(`Paypal status not found for step: ${step}`);
  }

  return <Text.H4 styles={{ fontWeight: 600 }}>{t(paypalStatus)}</Text.H4>;
};

export default PayPalOrderStatus;
