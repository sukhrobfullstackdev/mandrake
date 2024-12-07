'use client';

import { usePaypalOrderDetails } from '@hooks/data/embedded/nft';
import { truncateEmail } from '@lib/utils/nft-checkout';
import { LogoPayPal, Text } from '@magiclabs/ui-components';
import { HStack } from '@styled/jsx';

type Props = {
  orderId: string;
};

export const PayerEmail = ({ orderId }: Props) => {
  const {
    data: { payerEmail },
  } = usePaypalOrderDetails({ orderId });

  return (
    <HStack gap={3}>
      <Text size="sm">{truncateEmail(payerEmail, 22)}</Text>
      <LogoPayPal />
    </HStack>
  );
};
