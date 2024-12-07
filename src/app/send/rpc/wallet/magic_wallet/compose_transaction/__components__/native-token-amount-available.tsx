'use client';

/* istanbul ignore file */

import { CurrencyFormatter } from '@app/send/rpc/eth/eth_sendTransaction/__components__/currency-formatter';
import SendTxTokenLogo from '@app/send/rpc/eth/eth_sendTransaction/__components__/send-tx-token-logo';
import { TokenFormatter } from '@app/send/rpc/eth/eth_sendTransaction/__components__/token-formatter';
import { useTranslation } from '@lib/common/i18n';
import { Text } from '@magiclabs/ui-components';
import { HStack } from '@styled/jsx';
import { Box } from '@styled/jsx/box';
import { formatUnits } from 'ethers';

interface NativeTokenAmountAvailableProps {
  isInputFormatFiat: boolean;
  balanceInWei: number;
  balanceInUsd: number;
}

export default function NativeTokenAmountAvailable({
  isInputFormatFiat,
  balanceInWei,
  balanceInUsd,
}: NativeTokenAmountAvailableProps) {
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
          {isInputFormatFiat ? (
            <CurrencyFormatter value={balanceInUsd} />
          ) : (
            <TokenFormatter value={Number(formatUnits(balanceInWei.toString()))} />
          )}{' '}
          {t('available')}
        </Text>
      </HStack>
    </Box>
  );
}
