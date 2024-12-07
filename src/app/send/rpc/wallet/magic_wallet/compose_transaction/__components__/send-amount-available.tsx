'use client';

/* istanbul ignore file */

import { CurrencyFormatter } from '@app/send/rpc/eth/eth_sendTransaction/__components__/currency-formatter';
import SendTxTokenLogo from '@app/send/rpc/eth/eth_sendTransaction/__components__/send-tx-token-logo';
import { useTranslation } from '@lib/common/i18n';
import { Text } from '@magiclabs/ui-components';
import { Box, HStack } from '@styled/jsx';

interface SendAmountAvailableProps {
  value: number;
  // isErc20Token?: boolean;
}

export default function SendAmountAvailable({ value }: SendAmountAvailableProps) {
  const { t } = useTranslation('send');

  return (
    <Box height={'3rem'}>
      <HStack
        w="100%"
        p="0 1rem"
        h="3rem"
        borderTop="1px solid"
        borderColor="text.tertiary/20"
        borderBottom="1px solid"
        position="absolute"
        top="3.8rem"
        left="0"
        justifyContent="center"
      >
        <SendTxTokenLogo size={16} />
        <Text size="sm">
          <CurrencyFormatter value={value} /> {t('available')}
        </Text>
      </HStack>
    </Box>
  );
}
