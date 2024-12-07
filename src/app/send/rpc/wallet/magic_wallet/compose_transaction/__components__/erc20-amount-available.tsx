/* istanbul ignore file */

import { TokenFormatter } from '@app/send/rpc/eth/eth_sendTransaction/__components__/token-formatter';
import { useTranslation } from '@lib/common/i18n';
import { IconGenericToken, Text } from '@magiclabs/ui-components';
import { Box, HStack } from '@styled/jsx';
import { formatUnits } from 'ethers';
import Image from 'next/image';

interface Erc20TokenAmountAvailableProps {
  logo: string;
  balance: string;
  decimals: number;
  symbol: string;
}

export default function Erc20TokenAmountAvailable({ logo, balance, decimals, symbol }: Erc20TokenAmountAvailableProps) {
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
        {logo ? (
          <Image src={logo} height={24} width={24} alt={`${symbol} logo`} style={{ borderRadius: '50%' }} />
        ) : (
          <IconGenericToken height={24} width={24} />
        )}
        <Text size="sm">
          <TokenFormatter value={Number(formatUnits(balance.toString(), decimals || 'ether'))} token={symbol} />{' '}
          {t('available')}
        </Text>
      </HStack>
    </Box>
  );
}
